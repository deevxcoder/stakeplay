import { 
  users, type User, type InsertUser,
  bets, type Bet, type InsertBet,
  gameHistory, type GameHistory, type InsertGameHistory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number, limit?: number): Promise<Bet[]>;
  
  // Game history operations
  addGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  getGameHistory(gameType: string, limit?: number): Promise<GameHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bets: Map<number, Bet>;
  private history: Map<number, GameHistory>;
  private userIdCounter: number;
  private betIdCounter: number;
  private historyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.bets = new Map();
    this.history = new Map();
    this.userIdCounter = 1;
    this.betIdCounter = 1;
    this.historyIdCounter = 1;
    
    // Add a default demo user
    this.createUser({
      username: "demo",
      password: "password"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, balance: 10000 };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.betIdCounter++;
    const now = new Date();
    const bet: Bet = { 
      ...insertBet, 
      id, 
      createdAt: now
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getUserBets(userId: number, limit = 10): Promise<Bet[]> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    return userBets.slice(0, limit);
  }

  // Game history operations
  async addGameHistory(insertHistory: InsertGameHistory): Promise<GameHistory> {
    const id = this.historyIdCounter++;
    const now = new Date();
    const history: GameHistory = {
      ...insertHistory,
      id,
      timestamp: now
    };
    this.history.set(id, history);
    return history;
  }

  async getGameHistory(gameType: string, limit = 10): Promise<GameHistory[]> {
    const gameHistories = Array.from(this.history.values())
      .filter(history => history.gameType === gameType)
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    
    return gameHistories.slice(0, limit);
  }
}

export const storage = new MemStorage();
