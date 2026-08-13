CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`edit_token` text NOT NULL,
	`creator_name` text NOT NULL,
	`partner_name` text NOT NULL,
	`message` text NOT NULL,
	`theme` text DEFAULT 'sunset' NOT NULL,
	`youtube_url` text,
	`memories_json` text NOT NULL,
	`referral_code` text NOT NULL,
	`referred_by` text,
	`play_count` integer DEFAULT 0 NOT NULL,
	`completion_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_slug_unique` ON `games` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `games_edit_token_unique` ON `games` (`edit_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `games_referral_code_unique` ON `games` (`referral_code`);--> statement-breakpoint
CREATE TABLE `play_events` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`event` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `referral_events` (
	`id` text PRIMARY KEY NOT NULL,
	`referral_code` text NOT NULL,
	`created_game_id` text NOT NULL,
	`points` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referral_events_created_game_id_unique` ON `referral_events` (`created_game_id`);