import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  sattaMatkaSchema, 
  coinTossSchema,
  SATTA_MATKA_MULTIPLIER,
  COIN_TOSS_MULTIPLIER
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user", async (req, res) => {
    // For demo purposes, always return the demo user
    const user = await storage.getUserByUsername("demo");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  // Get user's recent bets
  app.get("/api/user/bets", async (req, res) => {
    const user = await storage.getUserByUsername("demo");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const bets = await storage.getUserBets(user.id, 10);
    return res.json(bets);
  });

  // Satta Matka game routes
  app.post("/api/games/matka/play", async (req, res) => {
    try {
      const validatedData = sattaMatkaSchema.parse(req.body);
      const { selectedNumbers, betAmount } = validatedData;
      
      // Get user
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance
      if (user.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate random result (3 numbers between 0-9)
      const result = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
      
      // Check if user won
      const isWin = JSON.stringify(selectedNumbers.sort()) === JSON.stringify(result.sort());
      
      // Calculate payout
      const payout = isWin ? Math.floor(betAmount * SATTA_MATKA_MULTIPLIER) : -betAmount;
      
      // Update user balance
      const newBalance = user.balance + payout;
      await storage.updateUserBalance(user.id, newBalance);
      
      // Record the bet
      const bet = await storage.createBet({
        userId: user.id,
        gameType: "satta_matka",
        betAmount,
        selection: selectedNumbers.join(","),
        result: result.join(","),
        payout,
        isWin
      });
      
      // Add to game history
      await storage.addGameHistory({
        gameType: "satta_matka",
        result: result.join(",")
      });
      
      // Return the result
      return res.json({
        result,
        isWin,
        payout,
        newBalance
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get Satta Matka history
  app.get("/api/games/matka/history", async (req, res) => {
    const history = await storage.getGameHistory("satta_matka", 5);
    return res.json(history);
  });

  // Coin Toss game routes
  app.post("/api/games/coin/play", async (req, res) => {
    try {
      const validatedData = coinTossSchema.parse(req.body);
      const { choice, betAmount } = validatedData;
      
      // Get user
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance
      if (user.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate random result
      const result = Math.random() < 0.5 ? "heads" : "tails";
      
      // Check if user won
      const isWin = choice === result;
      
      // Calculate payout
      const payout = isWin ? Math.floor(betAmount * COIN_TOSS_MULTIPLIER) : -betAmount;
      
      // Update user balance
      const newBalance = user.balance + payout;
      await storage.updateUserBalance(user.id, newBalance);
      
      // Record the bet
      const bet = await storage.createBet({
        userId: user.id,
        gameType: "coin_toss",
        betAmount,
        selection: choice,
        result,
        payout,
        isWin
      });
      
      // Add to game history
      await storage.addGameHistory({
        gameType: "coin_toss",
        result
      });
      
      // Return the result
      return res.json({
        result,
        isWin,
        payout,
        newBalance
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get Coin Toss history
  app.get("/api/games/coin/history", async (req, res) => {
    const history = await storage.getGameHistory("coin_toss", 10);
    return res.json(history);
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
