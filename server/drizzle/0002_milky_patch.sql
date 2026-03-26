CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`tags` text DEFAULT '[]',
	`ingredients` text DEFAULT '[]',
	`steps` text DEFAULT '[]',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
