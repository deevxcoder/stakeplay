import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  sattaMatkaSchema,
  legacySattaMatkaSchema,
  coinTossSchema,
  SATTA_MATKA_MULTIPLIER,
  COIN_TOSS_MULTIPLIER,
  MULTIPLIERS
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

  // Updated Satta Matka game routes
  app.post("/api/games/matka/play", async (req, res) => {
    try {
      // Try the new schema first, fall back to legacy schema if that fails
      let betData;
      let isLegacy = false;
      
      try {
        betData = sattaMatkaSchema.parse(req.body);
      } catch (err) {
        // Try to use legacy schema
        betData = legacySattaMatkaSchema.parse(req.body);
        isLegacy = true;
      }
      
      // Get user
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance
      if (user.balance < betData.betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      let result: string;
      let isWin = false;
      let multiplier = 0;
      let stringSelection = '';
      let market = 'gali';
      let betType = 'jodi';
      
      // Handle different game versions
      if (isLegacy) {
        // Legacy game with 3 numbers
        const { selectedNumbers, betAmount } = betData as { selectedNumbers: number[], betAmount: number };
        
        // Generate random result (3 numbers between 0-9)
        const resultArray = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
        result = resultArray.join(",");
        
        // Check if user won
        isWin = JSON.stringify(selectedNumbers.sort()) === JSON.stringify(resultArray.sort());
        multiplier = SATTA_MATKA_MULTIPLIER;
        stringSelection = selectedNumbers.join(",");
      } else {
        // New Satta Matka with 2-digit results
        // We need type assertions because TypeScript can't properly infer union types
        const data = betData as any;
        
        betType = data.betType as string;
        market = data.market as string;
        
        // Generate two-digit result (00-99)
        const twoDigitResult = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        result = twoDigitResult;
        
        // Determine win and multiplier based on bet type
        switch (betType) {
          case "jodi":
            // Exact match of two digits
            stringSelection = data.selection as string;
            isWin = data.selection === twoDigitResult;
            multiplier = MULTIPLIERS.SATTA_MATKA_JODI;
            break;
            
          case "oddEven":
            // Odd or even result
            stringSelection = data.selection as string;
            const resultNumber = parseInt(twoDigitResult);
            const isResultOdd = resultNumber % 2 === 1;
            isWin = (data.selection === "odd" && isResultOdd) || 
                    (data.selection === "even" && !isResultOdd);
            multiplier = MULTIPLIERS.SATTA_MATKA_ODD_EVEN;
            break;
            
          case "cross":
            // Cross combinations
            const crossNumbers = data.selection as number[];
            stringSelection = crossNumbers.join(",");
            
            // Generate all possible combinations
            const combinations: string[] = [];
            for (let i = 0; i < crossNumbers.length; i++) {
              for (let j = 0; j < crossNumbers.length; j++) {
                if (i !== j) {
                  combinations.push(`${crossNumbers[i]}${crossNumbers[j]}`);
                }
              }
            }
            
            // Check if result matches any combination
            isWin = combinations.includes(twoDigitResult);
            
            // Adjust multiplier based on number of combinations
            multiplier = Math.max(90 / combinations.length, 1.5);
            break;
            
          case "hurf":
            // Left and/or right digit matches
            const leftDigit = data.leftDigit as number | null;
            const rightDigit = data.rightDigit as number | null;
            stringSelection = `left:${leftDigit},right:${rightDigit}`;
            
            const resultLeftDigit = parseInt(twoDigitResult[0]);
            const resultRightDigit = parseInt(twoDigitResult[1]);
            
            const leftMatch = leftDigit !== null && leftDigit === resultLeftDigit;
            const rightMatch = rightDigit !== null && rightDigit === resultRightDigit;
            
            // Win if either position matches
            isWin = leftMatch || rightMatch;
            
            // Multiplier depends on whether one or both positions were selected
            if (leftDigit !== null && rightDigit !== null) {
              multiplier = MULTIPLIERS.SATTA_MATKA_HURF_DOUBLE;
            } else {
              multiplier = MULTIPLIERS.SATTA_MATKA_HURF_SINGLE;
            }
            break;
          
          default:
            throw new Error(`Unknown bet type: ${betType}`);
        }
      }
      
      // Calculate payout
      const betAmount = (betData as any).betAmount as number;
      const payout = isWin ? Math.floor(betAmount * multiplier) : -betAmount;
      
      // Update user balance
      const newBalance = user.balance + payout;
      await storage.updateUserBalance(user.id, newBalance);
      
      // Record the bet
      const bet = await storage.createBet({
        userId: user.id,
        gameType: "satta_matka",
        betAmount,
        selection: stringSelection,
        result,
        payout,
        isWin,
        market,
        betType
      });
      
      // Add to game history
      await storage.addGameHistory({
        gameType: "satta_matka",
        result,
        market
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
      console.error("Satta Matka game error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get Satta Matka history (allow filtering by market)
  app.get("/api/games/matka/history", async (req, res) => {
    try {
      const market = req.query.market as string;
      let history;
      
      if (market) {
        // Filter by market if provided
        history = await storage.getGameHistory("satta_matka", 10);
        history = history.filter(h => h.market === market);
      } else {
        // Otherwise get all history
        history = await storage.getGameHistory("satta_matka", 10);
      }
      
      return res.json(history);
    } catch (error) {
      console.error("Error fetching Satta Matka history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Coin Toss game routes (unchanged)
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
