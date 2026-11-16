ALTER TABLE `products` ADD `defect_note` text;--> statement-breakpoint
ALTER TABLE `products` ADD `original_id` integer REFERENCES products(id);