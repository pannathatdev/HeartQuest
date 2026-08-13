import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  editToken: text("edit_token").notNull().unique(),
  creatorName: text("creator_name").notNull(),
  partnerName: text("partner_name").notNull(),
  message: text("message").notNull(),
  theme: text("theme").notNull().default("sunset"),
  youtubeUrl: text("youtube_url"),
  memoriesJson: text("memories_json").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  playCount: integer("play_count").notNull().default(0),
  completionCount: integer("completion_count").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  ownerUserId: text("owner_user_id"),
  occasion: text("occasion").notNull().default("anniversary"),
  questPlanJson: text("quest_plan_json").notNull().default("[]"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleSubject: text("google_subject").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  referralCode: text("referral_code").notNull().unique(),
  heartPoints: integer("heart_points").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_sessions_user").on(table.userId), index("idx_sessions_expiry").on(table.expiresAt)]);

export const playEvents = sqliteTable("play_events", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull(),
  event: text("event").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_play_events_game_event").on(table.gameId, table.event)]);

export const referralEvents = sqliteTable("referral_events", {
  id: text("id").primaryKey(),
  referralCode: text("referral_code").notNull(),
  createdGameId: text("created_game_id").notNull().unique(),
  points: integer("points").notNull().default(1),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_referral_code").on(table.referralCode)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull(),
  packageId: text("package_id").notNull(),
  provider: text("provider").notNull().default("manual_promptpay"),
  externalPaymentId: text("external_payment_id"),
  amountSatang: integer("amount_satang").notNull(),
  status: text("status").notNull().default("awaiting_payment"),
  customerContact: text("customer_contact"),
  slipKey: text("slip_key"),
  submittedAt: integer("submitted_at"),
  reviewedAt: integer("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  createdAt: integer("created_at").notNull(),
  userId: text("user_id"),
}, (table) => [index("idx_payments_status_created").on(table.status, table.createdAt), index("idx_payments_game").on(table.gameId)]);
