CREATE TABLE `salla_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`merchantId` varchar(100),
	`storeName` varchar(255),
	`storeEmail` varchar(320),
	`storeDomain` varchar(500),
	`storePlan` varchar(50),
	`storeAvatar` varchar(500),
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`tokenType` varchar(50) DEFAULT 'Bearer',
	`expiresAt` timestamp,
	`scope` text,
	`isActive` boolean DEFAULT true,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salla_connections_id` PRIMARY KEY(`id`)
);
