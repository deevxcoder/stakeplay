
import { storage } from "./storage";
import { db, users, bets } from "./database";
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  try {
    // Delete existing data
    await db.delete(users);

    // Create test users
    const testUsers = [
      {
        username: "kalua",
        password: "kalua123",
        email: "kalua@example.com",
        mobile: "+1234567890",
        balance: 10000,
        isAdmin: true,
        isDemo: false,
        isActive: true
      },
      {
        username: "demo_user",
        password: "demo123",
        email: "demo@example.com",
        mobile: "+9876543210",
        balance: 5000,
        isAdmin: false,
        isDemo: true,
        isActive: true
      }
    ];

    // Insert test users
    for (const user of testUsers) {
      const result = await db.insert(users).values(user).returning();
      console.log(`Created user: ${result[0].username}, isAdmin: ${result[0].isAdmin}`);
    }

    // Create default markets in storage
    const defaultMarkets = [
      {
        id: "gali",
        name: "Gali Market",
        displayName: "Gali",
        description: "Popular market with daily results",
        openTime: "10:00",
        closeTime: "17:00",
        resultTime: "17:30",
        color: "#FF5733",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        coverImage: "/src/assets/gali-banner.svg",
        allowedBetTypes: ["jodi", "oddEven", "cross", "hurf"]
      },
      {
        id: "dishawar",
        name: "Dishawar Market",
        displayName: "Dishawar",
        description: "Traditional market with evening results",
        openTime: "15:00",
        closeTime: "21:00",
        resultTime: "21:30",
        color: "#33FF57",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        coverImage: "/src/assets/dishawar-banner.svg",
        allowedBetTypes: ["jodi", "oddEven", "cross", "hurf"]
      }
    ];

    // Create markets
    for (const market of defaultMarkets) {
      await storage.createMarket(market);
      console.log(`Created market: ${market.name}`);
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding
seedDatabase();
