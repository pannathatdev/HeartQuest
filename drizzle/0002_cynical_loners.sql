CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`package_id` text NOT NULL,
	`amount_satang` integer NOT NULL,
	`status` text DEFAULT 'awaiting_payment' NOT NULL,
	`customer_contact` text,
	`slip_key` text,
	`submitted_at` integer,
	`reviewed_at` integer,
	`reviewed_by` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_payments_status_created` ON `payments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_payments_game` ON `payments` (`game_id`);--> statement-breakpoint
PRAGMA optimize;
