CREATE TABLE `students` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`admission_number` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
