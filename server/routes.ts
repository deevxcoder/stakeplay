import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  sattaMatkaSchema,
  legacySattaMatkaSchema,
  coinTossSchema,
  SATTA_MATKA_MULTIPLIER,
  COIN_TOSS_MULTIPLIER,
  MULTIPLIERS,
  insertDepositSchema,
  insertWithdrawalSchema,
  paymentDetailsSchema
} from "@shared/schema";
import { User } from "@shared/schema";
import { 
  sendWelcomeEmail, 
  sendDepositStatusEmail, 
  sendWithdrawalStatusEmail 
} from "./email";

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to ensure user is an admin
const ensureAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && (req.user as User).isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Unauthorized: Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Check admin status endpoint
  app.get("/api/check-admin", ensureAuthenticated, (req, res) => {
    const user = req.user as User;
    console.log("User", user.username, "checked admin status. isAdmin:", user.isAdmin);
    res.json({ isAdmin: user.isAdmin || false });
  });
  // Set up authentication
  setupAuth(app);

  // Special route to make a user an admin (for development purposes only)
  app.post("/api/make-admin", async (req, res) => {
    try {
      // Check if we're getting an HTML request from the middleware
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.status(200).json({ error: "This API endpoint can only be accessed programmatically" });
      }

      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // For testing, let's log and hardcode a successful response
      console.log(`Attempting to make user '${username}' an admin`);

      const user = await storage.makeUserAdmin(username);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.isAdmin) {
        return res.status(400).json({ error: "Could not make user an admin. Demo users cannot be admins." });
      }

      const responseData = { 
        message: "User is now an admin", 
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          balance: user.balance
        }
      };

      console.log('Successful admin creation response:', responseData);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error making user admin:", error);
      return res.status(500).json({ error: "Failed to make user an admin" });
    }
  });

  // Check admin status
  app.get("/api/check-admin", ensureAuthenticated, (req, res) => {
    const isAdmin = (req.user as User).isAdmin === true;
    console.log(`User ${(req.user as User).username} checked admin status. isAdmin:`, isAdmin);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({ isAdmin }));
  });

  // Another admin check with just text response
  app.get("/api/admin-check-text", ensureAuthenticated, (req, res) => {
    const isAdmin = (req.user as User).isAdmin === true;
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(isAdmin ? "true" : "false");
  });

  // Get user's recent bets
  app.get("/api/user/bets", ensureAuthenticated, async (req, res) => {
    const user = req.user as User;
    const bets = await storage.getUserBets(user.id, 10);
    return res.json(bets);
  });

  // Updated Satta Matka game routes
  app.post("/api/games/matka/play", ensureAuthenticated, async (req, res) => {
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

      // Get authenticated user
      const user = req.user as User;

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
  app.get("/api/games/matka/history", ensureAuthenticated, async (req, res) => {
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

  // Coin Toss game routes
  app.post("/api/games/coin/play", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = coinTossSchema.parse(req.body);
      const { choice, betAmount } = validatedData;

      // Get authenticated user
      const user = req.user as User;

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
  app.get("/api/games/coin/history", ensureAuthenticated, async (req, res) => {
    try {
      const history = await storage.getGameHistory("coin_toss", 10);
      return res.json(history);
    } catch (error) {
      console.error("Error fetching Coin Toss history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Deposit Routes -----

  // Create a new deposit request
  app.post("/api/deposits", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;

      // Validate the request body
      const depositData = insertDepositSchema.parse({
        ...req.body,
        userId: user.id
      });

      // Validate payment details based on payment mode
      try {
        paymentDetailsSchema.parse(depositData.details);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid payment details", 
            errors: err.errors 
          });
        }
      }

      // Create the deposit request
      const deposit = await storage.createDeposit(depositData);

      return res.status(201).json(deposit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      console.error("Error creating deposit:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's deposit history
  app.get("/api/deposits", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const deposits = await storage.getUserDeposits(user.id);
      return res.json(deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin route: Get all pending deposits
  app.get("/api/admin/deposits/pending", ensureAdmin, async (req, res) => {
    try {
      const pendingDeposits = await storage.getAllPendingDeposits();
      return res.json(pendingDeposits);
    } catch (error) {
      console.error("Error fetching pending deposits:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin route: Update deposit status
  app.patch("/api/admin/deposits/:id", ensureAdmin, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const { status, adminNote } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedDeposit = await storage.updateDepositStatus(
        depositId, 
        status, 
        adminNote
      );

      if (!updatedDeposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      // Send email notification about deposit status update
      const user = await storage.getUser(updatedDeposit.userId);
      if (user && user.email) {
        sendDepositStatusEmail(user, updatedDeposit).catch(error => {
          console.error("Failed to send deposit status email:", error);
        });
      }

      return res.json(updatedDeposit);
    } catch (error) {
      console.error("Error updating deposit:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Withdrawal Routes -----

  // Create a new withdrawal request
  app.post("/api/withdrawals", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;

      // Validate the request body
      const withdrawalData = insertWithdrawalSchema.parse({
        ...req.body,
        userId: user.id
      });

      // Check if user has enough balance
      if (user.balance < withdrawalData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Validate payment details based on payment mode
      try {
        paymentDetailsSchema.parse(withdrawalData.details);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid payment details", 
            errors: err.errors 
          });
        }
      }

      // Create the withdrawal request (this will also deduct the amount from user's balance)
      const withdrawal = await storage.createWithdrawal(withdrawalData);

      return res.status(201).json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      console.error("Error creating withdrawal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's withdrawal history
  app.get("/api/withdrawals", ensureAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const withdrawals = await storage.getUserWithdrawals(user.id);
      return res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin route: Get all pending withdrawals
  app.get("/api/admin/withdrawals/pending", ensureAdmin, async (req, res) => {
    try {
      const pendingWithdrawals = await storage.getAllPendingWithdrawals();
      return res.json(pendingWithdrawals);
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin route: Update withdrawal status
  app.patch("/api/admin/withdrawals/:id", ensureAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, adminNote } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedWithdrawal = await storage.updateWithdrawalStatus(
        withdrawalId, 
        status, 
        adminNote
      );

      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      // Send email notification about withdrawal status update
      const user = await storage.getUser(updatedWithdrawal.userId);
      if (user && user.email) {
        sendWithdrawalStatusEmail(user, updatedWithdrawal).catch(error => {
          console.error("Failed to send withdrawal status email:", error);
        });
      }

      return res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Admin Market Management Routes -----

  // Get all markets
  app.get("/api/admin/markets", ensureAdmin, async (req, res) => {
    try {
      const markets = await storage.getAllMarkets();
      return res.json(markets || [
        {
          id: "gali",
          name: "Gali Market",
          displayName: "Gali",
          description: "Popular market with daily results",
          openTime: "10:00",
          closeTime: "17:00",
          resultTime: "17:30",
          status: "open",
          color: "#FF5733",
          latestResult: "42"
        },
        {
          id: "dishawar",
          name: "Dishawar Market",
          displayName: "Dishawar",
          description: "Traditional market with evening results",
          openTime: "15:00",
          closeTime: "21:00",
          resultTime: "21:30",
          status: "open",
          color: "#33FF57",
          latestResult: "87"
        },
        {
          id: "mumbai",
          name: "Mumbai Market",
          displayName: "Mumbai",
          description: "Popular Mumbai-based market",
          openTime: "09:00",
          closeTime: "16:00",
          resultTime: "16:30",
          status: "open",
          color: "#3357FF",
          latestResult: "24"
        }
      ];
      return res.json(markets || defaultMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update market details
  app.patch("/api/admin/markets/:id", ensureAdmin, async (req, res) => {
    try {
      const marketId = req.params.id;
      const { openTime, closeTime, resultTime, status } = req.body;

      // This would update the market in the database
      // For now, we just return the updated data
      return res.json({
        id: marketId,
        openTime,
        closeTime,
        resultTime,
        status,
        updated: true
      });
    } catch (error) {
      console.error("Error updating market:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add market result
  app.post("/api/admin/markets/:id/results", ensureAdmin, async (req, res) => {
    try {
      const marketId = req.params.id;
      const { result, date } = req.body;

      if (!result || !date) {
        return res.status(400).json({ message: "Result and date are required" });
      }

      // This would add the result to the database
      // For now, we just return a success message
      return res.status(201).json({
        id: Math.floor(Math.random() * 1000),
        marketId,
        result,
        date,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding market result:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get market results history
  app.get("/api/admin/markets/:id/results", ensureAdmin, async (req, res) => {
    try {
      const marketId = req.params.id;

      // This would retrieve the results from the database
      // For now, we just return some mock data
      const results = [
        {
          id: 1,
          marketId,
          result: "42",
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          marketId,
          result: "87",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      return res.json(results);
    } catch (error) {
      console.error("Error fetching market results:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Admin Settings Routes -----

  // Get platform settings
  app.get("/api/admin/settings", ensureAdmin, async (req, res) => {
    try {
      // This would retrieve settings from the database
      // For now, we return some default settings
      const settings = {
        maintenance: {
          enabled: false,
          message: "We're currently performing maintenance. Please check back soon."
        },
        notifications: {
          emailOnRegistration: true,
          emailOnDeposit: true,
          emailOnWithdrawal: true
        },
        game: {
          minBetAmount: 10,
          maxBetAmount: 10000,
          coinTossMultiplier: 1.9,
          sattaMatkaMultiplier: 7.5
        },
        platform: {
          siteName: "Satta Matka",
          supportEmail: "support@example.com",
          supportPhone: "+1234567890",
          demoMode: false
        }
      };

      return res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update platform settings
  app.patch("/api/admin/settings", ensureAdmin, async (req, res) => {
    try {
      const updatedSettings = req.body;

      // This would update settings in the database
      // For now, we just return the updated settings
      return res.json({
        ...updatedSettings,
        updated: true
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Admin Dashboard Overview Routes -----

  // Get admin dashboard stats
  app.get("/api/admin/stats", ensureAdmin, async (req, res) => {
    try {
      // This would calculate stats from the database
      // For now, we return some mock stats
      const stats = {
        totalUsers: 125,
        newUsersToday: 12,
        totalDeposits: 58950,
        pendingDeposits: 7,
        totalWithdrawals: 25680,
        pendingWithdrawals: 5,
        platformProfit: 33270,
        profitToday: 4250,
        userGrowth: [
          { date: '2025-04-01', count: 5 },
          { date: '2025-04-02', count: 7 },
          { date: '2025-04-03', count: 3 },
          { date: '2025-04-04', count: 8 },
          { date: '2025-04-05', count: 10 },
          { date: '2025-04-06', count: 9 },
          { date: '2025-04-07', count: 12 }
        ],
        transactionVolume: [
          { date: '2025-04-01', deposits: 5200, withdrawals: 2100 },
          { date: '2025-04-02', deposits: 6500, withdrawals: 3200 },
          { date: '2025-04-03', deposits: 4800, withdrawals: 2500 },
          { date: '2025-04-04', deposits: 7200, withdrawals: 3800 },
          { date: '2025-04-05', deposits: 9500, withdrawals: 4200 },
          { date: '2025-04-06', deposits: 8700, withdrawals: 5100 },
          { date: '2025-04-07', deposits: 10500, withdrawals: 4800 }
        ]
      };

      return res.json(stats);
    } catch (error) {
      console.error("Error calculating admin stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ----- Admin User Management Routes -----

  // Get all users
  app.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      // This would retrieve all users from the database
      // In a real implementation, we would add pagination
      const users = [
        {
          id: 1,
          username: "user1",
          email: "user1@example.com",
          mobile: "+1234567890",
          balance: 5000,
          isAdmin: false,
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: 2,
          username: "user2",
          email: "user2@example.com",
          mobile: "+1987654321",
          balance: 2500,
          isAdmin: false,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: 3,
          username: "admin",
          email: "admin@example.com",
          mobile: "+1555555555",
          balance: 10000,
          isAdmin: true,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
        }
      ];

      return res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user details
  app.patch("/api/admin/users/:id", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { balance, isAdmin } = req.body;

      // This would update the user in the database
      // For now, we just return a success message
      return res.json({
        id: userId,
        balance,
        isAdmin,
        updated: true
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new market
  app.post("/api/admin/markets", ensureAdmin, async (req, res) => {
    try {
      console.log("Database URL:", process.env.DATABASE_URL);
      const marketData = req.body;

      // Save market to database using storage
      const newMarket = await storage.createMarket(marketData);

      return res.status(201).json(newMarket);
    } catch (error) {
      console.error("Error creating market:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });


  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}