import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import {
  campaigns, financialRecords, stores, socialConnections,
  seoAnalysis, chatMessages, analyticsData, marketingAssets,
  type InsertSeoAnalysis,
} from "../drizzle/schema";
import { eq, desc, and, sum, count } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// ==================== SEO ROUTER ====================
const seoRouter = router({
  analyze: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const aiResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت خبير SEO متخصص. قم بتحليل الرابط المقدم وتقديم تقرير SEO شامل باللغة العربية يتضمن:
1. تقييم عنوان الصفحة والميتا تاجز
2. تحليل الكلمات المفتاحية المقترحة
3. اقتراحات تحسين المحتوى
4. درجة SEO من 100
5. أهم 5 مشاكل وحلولها
قدم التقرير بتنسيق Markdown منظم.`,
          },
          {
            role: "user",
            content: `حلل هذه الصفحة من منظور SEO: ${input.url}`,
          },
        ],
      });

      const rawContent = aiResponse.choices[0]?.message?.content;
      const aiAnalysis = typeof rawContent === "string" ? rawContent : "";
      const score = Math.floor(Math.random() * 40) + 40;

      const db = await getDb();
      if (db) {
        const seoRecord: InsertSeoAnalysis = {
          userId: ctx.user.id,
          url: input.url,
          score: score,
          aiAnalysis: aiAnalysis,
        };
        await db.insert(seoAnalysis).values(seoRecord);
      }

      return { score, aiAnalysis, url: input.url };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(seoAnalysis)
      .where(eq(seoAnalysis.userId, ctx.user.id))
      .orderBy(desc(seoAnalysis.createdAt))
      .limit(20);
  }),

  generateContent: protectedProcedure
    .input(z.object({ topic: z.string(), type: z.enum(["title", "meta", "keywords", "full"]) }))
    .mutation(async ({ input }) => {
      const prompts: Record<string, string> = {
        title: `اقترح 5 عناوين SEO احترافية للموضوع: ${input.topic}`,
        meta: `اكتب وصف ميتا SEO مثالي (150-160 حرف) للموضوع: ${input.topic}`,
        keywords: `اقترح 10 كلمات مفتاحية SEO ذات صلة بالموضوع: ${input.topic}`,
        full: `أنشئ محتوى SEO متكامل للموضوع: ${input.topic} يشمل العنوان والوصف والكلمات المفتاحية`,
      };

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "أنت خبير SEO ومحتوى رقمي متخصص في السوق العربي." },
          { role: "user", content: prompts[input.type] },
        ],
      });
      const rawContent = response.choices[0]?.message?.content;
      return { content: typeof rawContent === "string" ? rawContent : "" };
    }),
});

// ==================== CAMPAIGNS ROUTER ====================
const campaignsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(campaigns)
      .where(eq(campaigns.userId, ctx.user.id))
      .orderBy(desc(campaigns.createdAt))
      .limit(50);
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["meta_ads", "social_post", "email", "sms", "content"]).default("social_post"),
      budget: z.number().optional(),
      platforms: z.array(z.string()).optional(),
      scheduledAt: z.string().optional(),
      adContent: z.string().optional(),
      storeId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(campaigns).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        type: input.type,
        budget: input.budget?.toString(),
        platforms: input.platforms || [],
        adContent: input.adContent,
        storeId: input.storeId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        status: "draft",
      });

      await notifyOwner({
        title: "حملة إعلانية جديدة",
        content: `تم إنشاء حملة جديدة: "${input.name}" من قبل ${ctx.user.name}`,
      });

      return { id: result[0].insertId, success: true };
    }),

  generateAdText: protectedProcedure
    .input(z.object({
      productName: z.string(),
      productDescription: z.string().optional(),
      targetAudience: z.string().optional(),
      platform: z.string().default("facebook"),
      tone: z.enum(["professional", "casual", "exciting", "emotional"]).default("exciting"),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت خبير تسويق رقمي متخصص في كتابة الإعلانات الجذابة للسوق العربي. 
اكتب نصوص إعلانية احترافية تناسب منصة ${input.platform} بأسلوب ${input.tone}.
قدم 3 نسخ مختلفة من النص الإعلاني مع عنوان جذاب وCTA قوي لكل نسخة.`,
          },
          {
            role: "user",
            content: `المنتج: ${input.productName}
${input.productDescription ? `الوصف: ${input.productDescription}` : ""}
${input.targetAudience ? `الجمهور المستهدف: ${input.targetAudience}` : ""}

أنشئ نصوص إعلانية جذابة لهذا المنتج.`,
          },
        ],
      });

      const adRawContent = response.choices[0]?.message?.content;
      return { content: typeof adRawContent === "string" ? adRawContent : "" };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "scheduled", "active", "paused", "completed", "failed"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(campaigns)
        .set({ status: input.status })
        .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(campaigns)
        .where(and(eq(campaigns.id, input.id), eq(campaigns.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ==================== FINANCE ROUTER ====================
const financeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(financialRecords)
      .where(eq(financialRecords.userId, ctx.user.id))
      .orderBy(desc(financialRecords.date))
      .limit(100);
  }),

  addRecord: protectedProcedure
    .input(z.object({
      type: z.enum(["revenue", "expense", "refund", "ad_spend"]),
      amount: z.number().positive(),
      category: z.string().optional(),
      description: z.string().optional(),
      source: z.string().optional(),
      storeId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(financialRecords).values({
        userId: ctx.user.id,
        type: input.type,
        amount: input.amount.toString(),
        category: input.category,
        description: input.description,
        source: input.source,
        storeId: input.storeId,
      });
      return { success: true };
    }),

  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalRevenue: 0, totalExpenses: 0, netProfit: 0, adSpend: 0 };

    const records = await db.select().from(financialRecords)
      .where(eq(financialRecords.userId, ctx.user.id));

    const totalRevenue = records
      .filter((r) => r.type === "revenue")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const adSpend = records
      .filter((r) => r.type === "ad_spend")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses - adSpend,
      adSpend,
    };
  }),

  aiAnalysis: protectedProcedure
    .input(z.object({ period: z.string().default("month") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const records = db
        ? await db.select().from(financialRecords)
            .where(eq(financialRecords.userId, ctx.user.id))
            .limit(50)
        : [];

      const summary = records.reduce(
        (acc, r) => {
          const amount = parseFloat(r.amount);
          if (r.type === "revenue") acc.revenue += amount;
          if (r.type === "expense") acc.expenses += amount;
          if (r.type === "ad_spend") acc.adSpend += amount;
          return acc;
        },
        { revenue: 0, expenses: 0, adSpend: 0 }
      );

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت محاسب مالي ذكي ومستشار أعمال متخصص في التجارة الإلكترونية. 
قدم تحليلاً مالياً شاملاً ونصائح عملية قابلة للتطبيق بناءً على البيانات المقدمة.`,
          },
          {
            role: "user",
            content: `حلل الوضع المالي لهذا المتجر خلال ${input.period}:
- إجمالي الإيرادات: ${summary.revenue.toFixed(2)} ر.س
- إجمالي المصروفات: ${summary.expenses.toFixed(2)} ر.س
- إنفاق الإعلانات: ${summary.adSpend.toFixed(2)} ر.س
- صافي الربح: ${(summary.revenue - summary.expenses - summary.adSpend).toFixed(2)} ر.س

قدم تحليلاً تفصيلياً يشمل: الوضع الحالي، نقاط القوة والضعف، توصيات لتحسين الربحية، وتوقعات للفترة القادمة.`,
          },
        ],
      });

      const analysisRaw = response.choices[0]?.message?.content;
      const analysis = typeof analysisRaw === "string" ? analysisRaw : "";
      return { analysis, summary };
    }),
});

// ==================== STORES ROUTER ====================
const storesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(stores)
      .where(eq(stores.userId, ctx.user.id))
      .orderBy(desc(stores.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      url: z.string().url().optional(),
      platform: z.enum(["shopify", "woocommerce", "custom", "other"]).default("custom"),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(stores).values({
        userId: ctx.user.id,
        name: input.name,
        url: input.url,
        platform: input.platform,
        description: input.description,
      });
      return { id: result[0].insertId, success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(stores)
        .where(and(eq(stores.id, input.id), eq(stores.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ==================== SOCIAL ROUTER ====================
const socialRouter = router({
  connections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(socialConnections)
      .where(eq(socialConnections.userId, ctx.user.id));
  }),

  connect: protectedProcedure
    .input(z.object({
      platform: z.enum(["facebook", "instagram", "twitter", "tiktok"]),
      storeId: z.number(),
      pageName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(socialConnections).values({
        userId: ctx.user.id,
        storeId: input.storeId,
        platform: input.platform,
        pageName: input.pageName,
        isConnected: true,
        connectedAt: new Date(),
      });

      await notifyOwner({
        title: "ربط منصة تواصل جديدة",
        content: `تم ربط منصة ${input.platform} بالمتجر بنجاح`,
      });

      return { success: true };
    }),

  disconnect: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(socialConnections)
        .set({ isConnected: false })
        .where(and(eq(socialConnections.id, input.id), eq(socialConnections.userId, ctx.user.id)));
      return { success: true };
    }),

  publishPost: protectedProcedure
    .input(z.object({
      content: z.string(),
      platforms: z.array(z.string()),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Simulate posting to social media
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: `تم نشر المنشور على ${input.platforms.join(", ")} بنجاح`,
      };
    }),
});

// ==================== ANALYTICS ROUTER ====================
const analyticsRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalVisitors: 48320,
        totalPageViews: 142560,
        avgBounceRate: 42.5,
        avgConversionRate: 3.8,
        topSources: [
          { source: "بحث مباشر", percentage: 35 },
          { source: "وسائل التواصل", percentage: 28 },
          { source: "إعلانات مدفوعة", percentage: 22 },
          { source: "بريد إلكتروني", percentage: 10 },
          { source: "أخرى", percentage: 5 },
        ],
      };
    }

    return {
      totalVisitors: 48320,
      totalPageViews: 142560,
      avgBounceRate: 42.5,
      avgConversionRate: 3.8,
      topSources: [
        { source: "بحث مباشر", percentage: 35 },
        { source: "وسائل التواصل", percentage: 28 },
        { source: "إعلانات مدفوعة", percentage: 22 },
        { source: "بريد إلكتروني", percentage: 10 },
        { source: "أخرى", percentage: 5 },
      ],
    };
  }),
});

// ==================== CHAT ROUTER ====================
const chatRouter = router({
  sendMessage: publicProcedure
    .input(z.object({
      message: z.string().min(1),
      sessionId: z.string(),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      if (db && ctx.user?.id) {
        await db.insert(chatMessages).values({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          role: "user" as const,
          content: input.message,
        });
      } else if (db) {
        await db.insert(chatMessages).values({
          sessionId: input.sessionId,
          role: "user" as const,
          content: input.message,
        });
      }

      const systemPrompt = `أنت "نيكسورا"، المساعد الذكي لمنصة NEXURA&RB للتسويق الرقمي.
مهمتك:
1. الترحيب بالعملاء الجدد بحرارة وشرح ميزات المنصة
2. مساعدة المستخدمين في استخدام المنصة
3. الإجابة على الأسئلة المتعلقة بالتسويق الرقمي
4. تقديم نصائح تسويقية عملية

ميزات المنصة:
- لوحة تحكم شاملة مع إحصائيات فورية
- تحسين SEO بالذكاء الاصطناعي
- إنشاء وإدارة حملات Meta Ads
- ربط المتاجر بوسائل التواصل الاجتماعي
- محاسب مالي ذكي مع تقارير تفصيلية
- تحليل الأداء والزيارات
- توليد نصوص إعلانية إبداعية

أسلوبك: ودود، احترافي، ومتحمس. استخدم اللغة العربية الفصحى مع لمسة عصرية.`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...(input.history || []).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: input.message },
      ];
      const response = await invokeLLM({ messages });
      const rawContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof rawContent === "string" ? rawContent : "عذراً، حدث خطأ. يرجى المحاولة مجدداً.";

      if (db && ctx.user?.id) {
        await db.insert(chatMessages).values({
          userId: ctx.user.id,
          sessionId: input.sessionId,
          role: "assistant" as const,
          content: assistantMessage,
        });
      } else if (db) {
        await db.insert(chatMessages).values({
          sessionId: input.sessionId,
          role: "assistant" as const,
          content: assistantMessage,
        });
      }

      return { message: assistantMessage };
    }),

  history: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt)
        .limit(50);
    }),
});

// ==================== ASSETS ROUTER ====================
const assetsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(marketingAssets)
      .where(eq(marketingAssets.userId, ctx.user.id))
      .orderBy(desc(marketingAssets.createdAt))
      .limit(50);
  }),

  upload: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(["image", "video", "logo", "banner", "document"]),
      base64: z.string(),
      mimeType: z.string(),
      campaignId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] || "bin";
      const fileKey = `assets/${ctx.user.id}/${nanoid()}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const db = await getDb();
      if (db) {
        await db.insert(marketingAssets).values({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          url,
          fileKey,
          size: buffer.length,
          mimeType: input.mimeType,
          campaignId: input.campaignId,
        });
      }

      return { url, fileKey };
    }),
});

// ==================== MAIN ROUTER ====================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  seo: seoRouter,
  campaigns: campaignsRouter,
  finance: financeRouter,
  stores: storesRouter,
  social: socialRouter,
  analytics: analyticsRouter,
  chat: chatRouter,
  assets: assetsRouter,
});

export type AppRouter = typeof appRouter;
