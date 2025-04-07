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
  selection: text("selection").notNull(), // For Matka: "2,5,9", For Coin: "heads" or "tails"
  result: text("result").notNull(), // For Matka: "2,5,9", For Coin: "heads" or "tails"
  payout: integer("payout").notNull(), // Negative for losses, positive for wins
  createdAt: timestamp("created_at").defaultNow(),
  isWin: boolean("is_win").notNull(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  gameType: true,
  betAmount: true,
  selection: true,
  result: true,
  payout: true,
  isWin: true,
});

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

// Game history for each type
export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // "satta_matka" or "coin_toss"
  result: text("result").notNull(), // For Matka: "2,5,9", For Coin: "heads" or "tails"
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).pick({
  gameType: true,
  result: true,
});

export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type GameHistory = typeof gameHistory.$inferSelect;

// Validation schemas for game inputs
export const sattaMatkaSchema = z.object({
  selectedNumbers: z.array(z.number().min(0).max(9)).length(3),
  betAmount: z.number().min(100).max(10000),
});

export const coinTossSchema = z.object({
  choice: z.enum(["heads", "tails"]),
  betAmount: z.number().min(10).max(10000),
});

// Odds
export const SATTA_MATKA_MULTIPLIER = 7.5;
export const COIN_TOSS_MULTIPLIER = 1.9;
