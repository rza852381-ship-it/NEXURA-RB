CREATE TABLE `analytics_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`visitors` int DEFAULT 0,
	`pageViews` int DEFAULT 0,
	`sessions` int DEFAULT 0,
	`bounceRate` decimal(5,2),
	`conversionRate` decimal(5,2),
	`avgSessionDuration` int DEFAULT 0,
	`sources` json,
	`topPages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('meta_ads','social_post','email','sms','content') DEFAULT 'social_post',
	`status` enum('draft','scheduled','active','paused','completed','failed') DEFAULT 'draft',
	`budget` decimal(10,2),
	`spent` decimal(10,2) DEFAULT '0',
	`targetAudience` json,
	`adContent` text,
	`imageUrl` varchar(500),
	`videoUrl` varchar(500),
	`platforms` json,
	`scheduledAt` timestamp,
	`startDate` timestamp,
	`endDate` timestamp,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(100) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int,
	`type` enum('revenue','expense','refund','ad_spend') NOT NULL,
	`category` varchar(100),
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`description` text,
	`date` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`type` enum('image','video','logo','banner','document') NOT NULL,
	`url` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`size` int,
	`mimeType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seo_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeId` int,
	`url` varchar(500) NOT NULL,
	`title` varchar(255),
	`metaDescription` text,
	`keywords` json,
	`score` int DEFAULT 0,
	`issues` json,
	`suggestions` json,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seo_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('facebook','instagram','twitter','tiktok') NOT NULL,
	`accessToken` text,
	`pageId` varchar(255),
	`pageName` varchar(255),
	`isConnected` boolean DEFAULT false,
	`connectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500),
	`platform` enum('shopify','woocommerce','custom','other') DEFAULT 'custom',
	`logoUrl` varchar(500),
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
