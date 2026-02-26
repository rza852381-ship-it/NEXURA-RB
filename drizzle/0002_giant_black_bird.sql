ALTER TABLE `stores` MODIFY COLUMN `platform` enum('shopify','woocommerce','salla','custom','other') DEFAULT 'custom';--> statement-breakpoint
ALTER TABLE `stores` ADD `apiKey` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `status` enum('active','inactive','pending') DEFAULT 'pending';