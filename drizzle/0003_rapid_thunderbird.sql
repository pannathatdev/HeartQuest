ALTER TABLE `payments` ADD `provider` text DEFAULT 'manual_promptpay' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `external_payment_id` text;--> statement-breakpoint
PRAGMA optimize;
