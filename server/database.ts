
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { text, integer, boolean, timestamp, jsonb, pgTable } from "drizzle-orm/pg-core";

// Create a PostgreSQL pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Define tables
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  balance: integer("balance").notNull().default(0),
  isDemo: boolean("is_demo").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const bets = pgTable("bets", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  market: text("market"),
  betType: text("bet_type"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Create drizzle database instance
export const db = drizzle(pool);
