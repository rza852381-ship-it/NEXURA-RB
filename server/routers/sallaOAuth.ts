/**
 * Salla OAuth 2.0 Integration
 * يدعم النمط السهل (Easy Mode) من سلة
 * Client ID + Client Secret → Access Token + Refresh Token
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sallaConnections } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { Request, Response } from "express";

const SALLA_API = "https://api.salla.dev/admin/v2";
const SALLA_AUTH_URL = "https://accounts.salla.sa/oauth2/auth";
const SALLA_TOKEN_URL = "https://accounts.salla.sa/oauth2/token";

// جلب بيانات المتجر من سلة
async function fetchStoreInfo(accessToken: string) {
  const res = await fetch(`${SALLA_API}/store/info`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const data = await res.json();
  if (data.status === 200) return data.data;
  return null;
}

// تجديد التوكن باستخدام refresh_token
async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const res = await fetch(SALLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  return res.json();
}

// تبادل authorization_code بـ access_token
async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) {
  const res = await fetch(SALLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });
  return res.json();
}

export const sallaOAuthRouter = router({
  // الحصول على رابط OAuth لبدء عملية الربط
  getAuthUrl: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .query(({ input }) => {
      const clientId = process.env.SALLA_CLIENT_ID || "7e42b932-6690-477d-aba0-a9fca78047e5";
      const redirectUri = `${input.origin}/api/salla/callback`;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "offline_access",
      });
      return {
        url: `${SALLA_AUTH_URL}?${params.toString()}`,
        redirectUri,
      };
    }),

  // جلب اتصالات سلة للمستخدم
  getConnections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const connections = await db
      .select()
      .from(sallaConnections)
      .where(and(eq(sallaConnections.userId, ctx.user.id), eq(sallaConnections.isActive, true)));
    // إخفاء التوكن من الاستجابة
    return connections.map((c) => ({
      id: c.id,
      storeName: c.storeName,
      storeEmail: c.storeEmail,
      storeDomain: c.storeDomain,
      storePlan: c.storePlan,
      storeAvatar: c.storeAvatar,
      merchantId: c.merchantId,
      isActive: c.isActive,
      connectedAt: c.connectedAt,
      expiresAt: c.expiresAt,
      hasRefreshToken: !!c.refreshToken,
    }));
  }),

  // جلب إحصائيات متجر سلة مربوط
  getStoreStats: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(sallaConnections)
        .where(
          and(
            eq(sallaConnections.id, input.connectionId),
            eq(sallaConnections.userId, ctx.user.id),
            eq(sallaConnections.isActive, true)
          )
        )
        .limit(1);

      const conn = result[0];
      if (!conn) return null;

      // تحقق من انتهاء التوكن وجدده إذا لزم
      let accessToken = conn.accessToken;
      if (conn.expiresAt && conn.expiresAt < new Date() && conn.refreshToken) {
        const clientId = process.env.SALLA_CLIENT_ID || "7e42b932-6690-477d-aba0-a9fca78047e5";
        const clientSecret = process.env.SALLA_CLIENT_SECRET || "";
        const newTokens = await refreshAccessToken(conn.refreshToken, clientId, clientSecret);
        if (newTokens.access_token) {
          accessToken = newTokens.access_token;
          await db
            .update(sallaConnections)
            .set({
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || conn.refreshToken,
              expiresAt: newTokens.expires_in
                ? new Date(Date.now() + newTokens.expires_in * 1000)
                : undefined,
            })
            .where(eq(sallaConnections.id, conn.id));
        }
      }

      const [products, orders] = await Promise.all([
        fetch(`${SALLA_API}/products?per_page=1`, {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        }).then((r) => r.json()),
        fetch(`${SALLA_API}/orders?per_page=100`, {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        }).then((r) => r.json()),
      ]);

      const ordersData = orders.data || [];
      const totalRevenue = ordersData.reduce((sum: number, o: any) => {
        const amount = parseFloat(o.amounts?.total?.amount || "0");
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const statusCounts: Record<string, number> = {};
      ordersData.forEach((o: any) => {
        const status = o.status?.name || "غير محدد";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return {
        storeName: conn.storeName,
        storeDomain: conn.storeDomain,
        storeAvatar: conn.storeAvatar,
        storePlan: conn.storePlan,
        totalProducts: products.pagination?.total || 0,
        totalOrders: orders.pagination?.total || 0,
        totalRevenue: totalRevenue.toFixed(2),
        currency: "SAR",
        ordersByStatus: statusCounts,
      };
    }),

  // جلب منتجات متجر مربوط
  getProducts: protectedProcedure
    .input(z.object({ connectionId: z.number(), page: z.number().default(1), perPage: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { data: [], pagination: { total: 0 } };

      const result = await db
        .select()
        .from(sallaConnections)
        .where(and(eq(sallaConnections.id, input.connectionId), eq(sallaConnections.userId, ctx.user.id)))
        .limit(1);

      const conn = result[0];
      if (!conn?.accessToken) return { data: [], pagination: { total: 0 } };

      const res = await fetch(
        `${SALLA_API}/products?page=${input.page}&per_page=${input.perPage}`,
        { headers: { Authorization: `Bearer ${conn.accessToken}`, Accept: "application/json" } }
      );
      const data = await res.json();
      return { data: data.data || [], pagination: data.pagination || { total: 0 } };
    }),

  // جلب طلبات متجر مربوط
  getOrders: protectedProcedure
    .input(z.object({ connectionId: z.number(), page: z.number().default(1), perPage: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { data: [], pagination: { total: 0 } };

      const result = await db
        .select()
        .from(sallaConnections)
        .where(and(eq(sallaConnections.id, input.connectionId), eq(sallaConnections.userId, ctx.user.id)))
        .limit(1);

      const conn = result[0];
      if (!conn?.accessToken) return { data: [], pagination: { total: 0 } };

      const res = await fetch(
        `${SALLA_API}/orders?page=${input.page}&per_page=${input.perPage}`,
        { headers: { Authorization: `Bearer ${conn.accessToken}`, Accept: "application/json" } }
      );
      const data = await res.json();
      return { data: data.data || [], pagination: data.pagination || { total: 0 } };
    }),

  // فصل متجر سلة
  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .update(sallaConnections)
        .set({ isActive: false })
        .where(
          and(
            eq(sallaConnections.id, input.connectionId),
            eq(sallaConnections.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  // ربط يدوي بالتوكن (للاختبار)
  connectWithToken: protectedProcedure
    .input(z.object({ accessToken: z.string().min(10), refreshToken: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const storeInfo = await fetchStoreInfo(input.accessToken);
      if (!storeInfo) throw new Error("التوكن غير صالح أو انتهت صلاحيته");

      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // حذف الاتصالات القديمة لنفس المتجر
      await db
        .update(sallaConnections)
        .set({ isActive: false })
        .where(eq(sallaConnections.userId, ctx.user.id));

      await db.insert(sallaConnections).values({
        userId: ctx.user.id,
        merchantId: String(storeInfo.id),
        storeName: storeInfo.name,
        storeEmail: storeInfo.email,
        storeDomain: storeInfo.domain,
        storePlan: storeInfo.plan,
        storeAvatar: storeInfo.avatar,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken || null,
        isActive: true,
      });

      return {
        success: true,
        store: {
          name: storeInfo.name,
          email: storeInfo.email,
          domain: storeInfo.domain,
          plan: storeInfo.plan,
          type: storeInfo.type,
        },
      };
    }),
});

// ==================== Express Route للـ OAuth Callback ====================
export function registerSallaOAuthRoutes(app: any) {
  // نقطة بداية OAuth
  app.get("/api/salla/auth", (req: Request, res: Response) => {
    const clientId = process.env.SALLA_CLIENT_ID || "7e42b932-6690-477d-aba0-a9fca78047e5";
    const origin = req.query.origin as string || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/salla/callback`;
    const state = Buffer.from(JSON.stringify({ origin, userId: req.query.userId })).toString("base64");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "offline_access",
      state,
    });

    res.redirect(`${SALLA_AUTH_URL}?${params.toString()}`);
  });

  // استقبال callback من سلة
  app.get("/api/salla/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/salla-connect?error=${encodeURIComponent(error as string)}`);
    }

    if (!code) {
      return res.redirect("/salla-connect?error=no_code");
    }

    try {
      let origin = `${req.protocol}://${req.get("host")}`;
      let userId: number | null = null;

      if (state) {
        try {
          const decoded = JSON.parse(Buffer.from(state as string, "base64").toString());
          origin = decoded.origin || origin;
          userId = decoded.userId ? parseInt(decoded.userId) : null;
        } catch {}
      }

      const clientId = process.env.SALLA_CLIENT_ID || "7e42b932-6690-477d-aba0-a9fca78047e5";
      const clientSecret = process.env.SALLA_CLIENT_SECRET || "";
      const redirectUri = `${origin}/api/salla/callback`;

      // تبادل الكود بتوكن
      const tokenData = await exchangeCodeForToken(code as string, clientId, clientSecret, redirectUri);

      if (!tokenData.access_token) {
        console.error("Salla OAuth error:", tokenData);
        return res.redirect(`/salla-connect?error=token_exchange_failed`);
      }

      // جلب معلومات المتجر
      const storeInfo = await fetchStoreInfo(tokenData.access_token);

      // حفظ في قاعدة البيانات إذا كان userId متاحاً
      if (userId) {
        const db = await getDb();
        if (db) {
          await db.update(sallaConnections).set({ isActive: false }).where(eq(sallaConnections.userId, userId));
          await db.insert(sallaConnections).values({
            userId,
            merchantId: storeInfo ? String(storeInfo.id) : null,
            storeName: storeInfo?.name || "متجر سلة",
            storeEmail: storeInfo?.email || null,
            storeDomain: storeInfo?.domain || null,
            storePlan: storeInfo?.plan || null,
            storeAvatar: storeInfo?.avatar || null,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            scope: tokenData.scope || null,
            isActive: true,
          });
        }
      }

      // إعادة التوجيه مع نجاح
      res.redirect(`/salla-connect?success=true&store=${encodeURIComponent(storeInfo?.name || "متجر سلة")}`);
    } catch (err) {
      console.error("Salla OAuth callback error:", err);
      res.redirect("/salla-connect?error=server_error");
    }
  });
}
