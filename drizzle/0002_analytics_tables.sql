-- Analytics tables migration
-- Add link_clicks table for detailed click tracking
CREATE TABLE `link_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`linkId` text NOT NULL,
	`clickedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ipAddress` text,
	`country` text,
	`city` text,
	`userAgent` text,
	`deviceType` text DEFAULT 'unknown',
	`browser` text,
	`os` text,
	`referrer` text,
	`referrerDomain` text,
	FOREIGN KEY (`linkId`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Add profile_views table for tracking profile page visits
CREATE TABLE `profile_views` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`viewedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ipAddress` text,
	`country` text,
	`city` text,
	`userAgent` text,
	`deviceType` text DEFAULT 'unknown',
	`browser` text,
	`os` text,
	`referrer` text,
	`referrerDomain` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Create indexes for common queries
CREATE INDEX `link_clicks_linkId_idx` ON `link_clicks` (`linkId`);
CREATE INDEX `link_clicks_clickedAt_idx` ON `link_clicks` (`clickedAt`);
CREATE INDEX `link_clicks_country_idx` ON `link_clicks` (`country`);
CREATE INDEX `profile_views_userId_idx` ON `profile_views` (`userId`);
CREATE INDEX `profile_views_viewedAt_idx` ON `profile_views` (`viewedAt`);
