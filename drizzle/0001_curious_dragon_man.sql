CREATE INDEX `idx_play_events_game_event` ON `play_events` (`game_id`,`event`);--> statement-breakpoint
CREATE INDEX `idx_referral_code` ON `referral_events` (`referral_code`);--> statement-breakpoint
PRAGMA optimize;
