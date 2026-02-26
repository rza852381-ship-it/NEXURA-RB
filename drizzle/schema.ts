import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ==================== جدول المستخدمين ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== جدول المتاجر ====================
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }),
  platform: mysqlEnum("platform", ["shopify", "woocommerce", "salla", "custom", "other"]).default("custom"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  apiKey: text("apiKey"),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

// ==================== جدول ربط وسائل التواصل ====================
export const socialConnections = mysqlTable("social_connections", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "twitter", "tiktok"]).notNull(),
  accessToken: text("accessToken"),
  pageId: varchar("pageId", { length: 255 }),
  pageName: varchar("pageName", { length: 255 }),
  isConnected: boolean("isConnected").default(false),
  connectedAt: timestamp("connectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;

// ==================== جدول الحملات الإعلانية ====================
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["meta_ads", "social_post", "email", "sms", "content"]).default("social_post"),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "paused", "completed", "failed"]).default("draft"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  targetAudience: json("targetAudience"),
  adContent: text("adContent"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  platforms: json("platforms"),
  scheduledAt: timestamp("scheduledAt"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  reach: int("reach").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ==================== جدول السجلات المالية ====================
export const financialRecords = mysqlTable("financial_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId"),
  type: mysqlEnum("type", ["revenue", "expense", "refund", "ad_spend"]).notNull(),
  category: varchar("category", { length: 100 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

// ==================== جدول تحليلات الزيارات ====================
export const analyticsData = mysqlTable("analytics_data", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  userId: int("userId").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  visitors: int("visitors").default(0),
  pageViews: int("pageViews").default(0),
  sessions: int("sessions").default(0),
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }),
  avgSessionDuration: int("avgSessionDuration").default(0),
  sources: json("sources"),
  topPages: json("topPages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = typeof analyticsData.$inferInsert;

// ==================== جدول تحليلات SEO ====================
export const seoAnalysis = mysqlTable("seo_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId"),
  url: varchar("url", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }),
  metaDescription: text("metaDescription"),
  keywords: json("keywords"),
  score: int("score").default(0),
  issues: json("issues"),
  suggestions: json("suggestions"),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeoAnalysis = typeof seoAnalysis.$inferSelect;
export type InsertSeoAnalysis = typeof seoAnalysis.$inferInsert;

// ==================== جدول المحادثات مع الروبوت ====================
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ==================== جدول المواد التسويقية ====================
export const marketingAssets = mysqlTable("marketing_assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["image", "video", "logo", "banner", "document"]).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  size: int("size"),
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingAsset = typeof marketingAssets.$inferSelect;
export type InsertMarketingAsset = typeof marketingAssets.$inferInsert;

// ==================== جدول اتصالات سلة OAuth ====================
export const sallaConnections = mysqlTable("salla_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  merchantId: varchar("merchantId", { length: 100 }),
  storeName: varchar("storeName", { length: 255 }),
  storeEmail: varchar("storeEmail", { length: 320 }),
  storeDomain: varchar("storeDomain", { length: 500 }),
  storePlan: varchar("storePlan", { length: 50 }),
  storeAvatar: varchar("storeAvatar", { length: 500 }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenType: varchar("tokenType", { length: 50 }).default("Bearer"),
  expiresAt: timestamp("expiresAt"),
  scope: text("scope"),
  isActive: boolean("isActive").default(true),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SallaConnection = typeof sallaConnections.$inferSelect;
export type InsertSallaConnection = typeof sallaConnections.$inferInsert;
