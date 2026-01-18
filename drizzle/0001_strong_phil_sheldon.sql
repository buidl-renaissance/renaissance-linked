CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`imageUrl` text,
	`favicon` text,
	`siteName` text,
	`position` integer DEFAULT 0 NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
