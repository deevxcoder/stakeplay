import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { sendWelcomeEmail } from "./email";

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password comparison function
async function comparePasswords(supplied: string, stored: string) {
  // For development, first check if stored password is already plaintext
  // In a real production app, we would never store plaintext passwords
  if (!stored.includes(".")) {
    return supplied === stored;
  }

  // Default scrypt comparison for hashed passwords
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "stakeplay-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up LocalStrategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Convert username to lowercase for case-insensitive comparison
        const normalizedUsername = username.toLowerCase();
        const user = await storage.getUserByUsername(normalizedUsername);
        console.log("Login attempt for user:", normalizedUsername);
        
        if (!user) {
          console.log("User not found:", normalizedUsername);
          return done(null, false, { message: "Incorrect username." });
        }
        
        // For development, allow plaintext password comparison
        const isValidPassword = user.password === password || await comparePasswords(password, user.password);
        console.log("Password validation result:", isValidPassword);
        
        if (!isValidPassword) {
          console.log("Invalid password for user:", username);
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Routes for authentication
  
  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password and create the user
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Send welcome email if user provided an email
      if (user.email) {
        sendWelcomeEmail(user).catch(error => {
          console.error("Failed to send welcome email:", error);
        });
      }

      // Log the user in after registration
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Authentication failed" });
      
      try {
        // Get fresh user data from database to ensure correct admin status
        const dbUser = await storage.getUserByUsername(user.username);
        if (!dbUser) {
          return res.status(401).json({ message: "User not found" });
        }

        req.login(dbUser, (err) => {
          if (err) return next(err);
          
          // Return user data without password
          const { password, ...userWithoutPassword } = dbUser;
          console.log("User logged in:", userWithoutPassword.username, "isAdmin:", userWithoutPassword.isAdmin);
          return res.json(userWithoutPassword);
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Demo login route - creates or finds demo user and logs them in
  app.post("/api/login/demo", async (req, res, next) => {
    try {
      // Check if demo user exists
      let demoUser = await storage.getUserByUsername("demo");
      
      // Create demo user if it doesn't exist
      if (!demoUser) {
        const hashedPassword = await hashPassword("demo-password");
        demoUser = await storage.createUser({
          username: "demo",
          password: hashedPassword,
          email: "demo@example.com",
          mobile: "1234567890"
        });
        
        // Update demo user's balance to 10000 and mark as demo
        demoUser = await storage.updateUserBalance(demoUser.id, 10000) as User;
        
        // Mark as demo and ensure it's not admin
        const updatedUser = { 
          ...demoUser, 
          isDemo: true,
          isAdmin: false 
        };
        
        // Update user by calling updateUser method
        const updatedDemoUser = await storage.updateUser(demoUser.id, updatedUser);
        demoUser = updatedDemoUser || demoUser;
      }
      
      // Log the user in
      req.login(demoUser, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = demoUser;
        return res.json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  // Get current user route
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}