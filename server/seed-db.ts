
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db, users, bets } from "./database";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  try {
    // Create test users
    const testUsers = [
      {
        username: "test_user",
        password: await hashPassword("test123"),
        email: "test@example.com",
        mobile: "+1234567890",
        balance: 5000,
        isAdmin: false
      },
      {
        username: "test_admin",
        password: await hashPassword("admin123"),
        email: "testadmin@example.com",
        mobile: "+9876543210",
        balance: 10000,
        isAdmin: true
      }
    ];

    // Insert test users
    for (const user of testUsers) {
      const existingUser = await storage.getUserByUsername(user.username);
      if (!existingUser) {
        const newUser = await storage.createUser(user);
        console.log(`Created user: ${newUser.username}, isAdmin: ${newUser.isAdmin}`);
      }
    }

    // Create sample bets
    const testUser = await storage.getUserByUsername("test_user");
    if (testUser) {
      const sampleBets = [
        {
          userId: testUser.id,
          amount: 100,
          market: "gali",
          betType: "jodi",
          status: "completed",
        },
        {
          userId: testUser.id,
          amount: 200,
          market: "dishawar",
          betType: "oddEven",
          status: "pending",
        }
      ];

      // Insert sample bets
      for (const bet of sampleBets) {
        await db.insert(bets).values(bet);
        console.log(`Created bet for user ${testUser.username}`);
      }
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding
seedDatabase();
