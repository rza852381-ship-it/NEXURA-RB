import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { stores } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const SALLA_API = "https://api.salla.dev/admin/v2";

async function sallaFetch(endpoint: string, token: string) {
  const res = await fetch(`${SALLA_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.json();
}

export const sallaRouter = router({
  // اختبار التوكن وجلب معلومات المتجر
  connect: protectedProcedure
    .input(z.object({ token: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const data = await sallaFetch("/store/info", input.token);
      if (data.status !== 200) {
        throw new Error(data.error?.message || "توكن غير صالح");
      }
      const store = data.data;
      const db = await getDb();
      if (db) {
        // حفظ بيانات المتجر في قاعدة البيانات
        await db.insert(stores).values({
          userId: ctx.user.id,
          name: store.name,
          url: store.domain,
          platform: "salla",
          apiKey: input.token,
          status: "active",
        }).onDuplicateKeyUpdate({
          set: {
            name: store.name,
            url: store.domain,
            apiKey: input.token,
            status: "active",
          },
        });
      }
      return {
        success: true,
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          domain: store.domain,
          currency: store.currency,
          plan: store.plan,
          type: store.type,
          avatar: store.avatar,
        },
      };
    }),

  // جلب معلومات المتجر المحفوظة
  storeInfo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, ctx.user.id))
      .limit(1);
    const store = result[0];
    if (!store?.apiKey) return null;

    const data = await sallaFetch("/store/info", store.apiKey);
    if (data.status !== 200) return null;
    return data.data;
  }),

  // جلب المنتجات
  products: protectedProcedure
    .input(z.object({ page: z.number().default(1), perPage: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { data: [], pagination: { total: 0 } };
      const result = await db.select().from(stores).where(eq(stores.userId, ctx.user.id)).limit(1);
      const store = result[0];
      if (!store?.apiKey) return { data: [], pagination: { total: 0 } };

      const data = await sallaFetch(
        `/products?page=${input.page}&per_page=${input.perPage}`,
        store.apiKey
      );
      return {
        data: data.data || [],
        pagination: data.pagination || { total: 0 },
      };
    }),

  // جلب الطلبات
  orders: protectedProcedure
    .input(z.object({ page: z.number().default(1), perPage: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { data: [], pagination: { total: 0 } };
      const result = await db.select().from(stores).where(eq(stores.userId, ctx.user.id)).limit(1);
      const store = result[0];
      if (!store?.apiKey) return { data: [], pagination: { total: 0 } };

      const data = await sallaFetch(
        `/orders?page=${input.page}&per_page=${input.perPage}`,
        store.apiKey
      );
      return {
        data: data.data || [],
        pagination: data.pagination || { total: 0 },
      };
    }),

  // جلب العملاء
  customers: protectedProcedure
    .input(z.object({ page: z.number().default(1), perPage: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { data: [], pagination: { total: 0 } };
      const result = await db.select().from(stores).where(eq(stores.userId, ctx.user.id)).limit(1);
      const store = result[0];
      if (!store?.apiKey) return { data: [], pagination: { total: 0 } };

      const data = await sallaFetch(
        `/customers?page=${input.page}&per_page=${input.perPage}`,
        store.apiKey
      );
      return {
        data: data.data || [],
        pagination: data.pagination || { total: 0 },
      };
    }),

  // إحصائيات المتجر الشاملة
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(stores).where(eq(stores.userId, ctx.user.id)).limit(1);
    const store = result[0];
    if (!store?.apiKey) return null;

    const [storeInfo, products, orders] = await Promise.all([
      sallaFetch("/store/info", store.apiKey),
      sallaFetch("/products?per_page=1", store.apiKey),
      sallaFetch("/orders?per_page=100", store.apiKey),
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
      store: storeInfo.data,
      totalProducts: products.pagination?.total || 0,
      totalOrders: orders.pagination?.total || 0,
      totalRevenue: totalRevenue.toFixed(2),
      currency: storeInfo.data?.currency || "SAR",
      ordersByStatus: statusCounts,
    };
  }),

  // فصل المتجر
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db
      .update(stores)
      .set({ status: "inactive", apiKey: null })
      .where(eq(stores.userId, ctx.user.id));
    return { success: true };
  }),
});
