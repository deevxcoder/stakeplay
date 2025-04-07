import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(10000),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bet records table
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(), // "satta_matka" or "coin_toss"
  betAmount: integer("bet_amount").notNull(),
  selection: text("selection").notNull(), // For Matka: depends on bet type, For Coin: "heads" or "tails"
  result: text("result").notNull(), // For Matka: two-digit number, For Coin: "heads" or "tails"
  payout: integer("payout").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
  isWin: boolean("is_win").notNull(),
  // New fields
  market: text("market").default("gali"),  // "gali", "dishawar", "mumbai"
  betType: text("bet_type").default("jodi"), // "jodi", "oddEven", "cross", "hurf"
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  gameType: true,
  betAmount: true,
  selection: true,
  result: true,
  payout: true,
  isWin: true,
  market: true,
  betType: true,
});

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

// Game history for each type
export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // "satta_matka" or "coin_toss"
  result: text("result").notNull(), // For Matka: two-digit number, For Coin: "heads" or "tails"
  timestamp: timestamp("timestamp").defaultNow(),
  market: text("market").default("gali"), // "gali", "dishawar", "mumbai"
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).pick({
  gameType: true,
  result: true,
  market: true,
});

export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type GameHistory = typeof gameHistory.$inferSelect;

// Validation schemas for game inputs

// Updated Satta Matka schemas
export const sattaMatkaBaseSchema = z.object({
  betAmount: z.number().min(100).max(10000),
  market: z.enum(["gali", "dishawar", "mumbai"]),
  betType: z.enum(["jodi", "oddEven", "cross", "hurf"])
});

// Jodi bet type schema
export const sattaMatkaJodiSchema = sattaMatkaBaseSchema.extend({
  betType: z.literal("jodi"),
  selection: z.string().regex(/^\d{2}$/, "Must be a two-digit number")
});

// Odd/Even bet type schema
export const sattaMatkaOddEvenSchema = sattaMatkaBaseSchema.extend({
  betType: z.literal("oddEven"),
  selection: z.enum(["odd", "even"])
});

// Cross bet type schema
export const sattaMatkaCrossSchema = sattaMatkaBaseSchema.extend({
  betType: z.literal("cross"),
  selection: z.array(z.number().min(0).max(9)).min(2).max(5)
});

// Hurf bet type schema
export const sattaMatkaHurfSchema = sattaMatkaBaseSchema.extend({
  betType: z.literal("hurf"),
  leftDigit: z.number().min(0).max(9).nullable(),
  rightDigit: z.number().min(0).max(9).nullable()
}).refine((data) => data.leftDigit !== null || data.rightDigit !== null, {
  message: "At least one digit position must be selected"
});

// Combined Satta Matka schema using different approach to avoid TypeScript issues
export const sattaMatkaSchema = z.union([
  sattaMatkaJodiSchema,
  sattaMatkaOddEvenSchema,
  sattaMatkaCrossSchema,
  sattaMatkaHurfSchema
]);

// Legacy schema for backward compatibility
export const legacySattaMatkaSchema = z.object({
  selectedNumbers: z.array(z.number().min(0).max(9)).length(3),
  betAmount: z.number().min(100).max(10000),
});

// Coin toss schema
export const coinTossSchema = z.object({
  choice: z.enum(["heads", "tails"]),
  betAmount: z.number().min(10).max(10000),
});

// Multipliers for different bet types
export const MULTIPLIERS = {
  SATTA_MATKA_JODI: 90,       // High odds for exact 2-digit match
  SATTA_MATKA_ODD_EVEN: 1.9,  // Lower odds for 50/50 chance
  SATTA_MATKA_CROSS: 5,       // Base multiplier, adjusted by number of combinations
  SATTA_MATKA_HURF_SINGLE: 9, // One position match
  SATTA_MATKA_HURF_DOUBLE: 4.5, // Two position matches
  COIN_TOSS: 1.9              // Coin toss unchanged
};

// Legacy multipliers (for backward compatibility)
export const SATTA_MATKA_MULTIPLIER = 7.5;
export const COIN_TOSS_MULTIPLIER = 1.9;
