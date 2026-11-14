CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text,
	`phone` text NOT NULL,
	`email` text,
	`payload` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`owner_notified_at` integer
);
