import { 
  users, type User, type InsertUser,
  bets, type Bet, type InsertBet,
  gameHistory, type GameHistory, type InsertGameHistory,
  deposits, type Deposit, type InsertDeposit,
  withdrawals, type Withdrawal, type InsertWithdrawal
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  updateUser(userId: number, updateData: Partial<User>): Promise<User | undefined>;
  verifyPassword(userId: number, password: string): Promise<boolean>;
  updatePassword(userId: number, newPassword: string): Promise<User | undefined>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number, limit?: number): Promise<Bet[]>;
  
  // Game history operations
  addGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  getGameHistory(gameType: string, limit?: number): Promise<GameHistory[]>;
  
  // Deposit operations
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getUserDeposits(userId: number, limit?: number): Promise<Deposit[]>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  updateDepositStatus(id: number, status: string, adminNote?: string): Promise<Deposit | undefined>;
  getAllPendingDeposits(): Promise<Deposit[]>;
  
  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: number, limit?: number): Promise<Withdrawal[]>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  updateWithdrawalStatus(id: number, status: string, adminNote?: string): Promise<Withdrawal | undefined>;
  getAllPendingWithdrawals(): Promise<Withdrawal[]>;
  
  // Session store
  sessionStore: any; // Using any to avoid type issues with session store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bets: Map<number, Bet>;
  private history: Map<number, GameHistory>;
  private deposits: Map<number, Deposit>;
  private withdrawals: Map<number, Withdrawal>;
  private userIdCounter: number;
  private betIdCounter: number;
  private historyIdCounter: number;
  private depositIdCounter: number;
  private withdrawalIdCounter: number;
  sessionStore: any; // Using any to avoid type issues with session store

  constructor() {
    this.users = new Map();
    this.bets = new Map();
    this.history = new Map();
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.userIdCounter = 1;
    this.betIdCounter = 1;
    this.historyIdCounter = 1;
    this.depositIdCounter = 1;
    this.withdrawalIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired sessions every 24 hours
    });
    
    // We'll add a demo user later through the hashPassword API
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
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 0, 
      isDemo: false,
      isAdmin: false,
      isActive: true,
      email: insertUser.email || null,
      mobile: insertUser.mobile || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
  
  async updateUser(userId: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Only allow updating specific fields
    const allowedFields = ['email', 'mobile'];
    const filteredUpdateData: Partial<User> = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        (filteredUpdateData as any)[key] = (updateData as any)[key];
      }
    });
    
    const updatedUser = { ...user, ...filteredUpdateData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // In a real application, this would use bcrypt or scrypt to compare hashed passwords
    // For this demo, we're doing a simple comparison
    return user.password === password;
  }
  
  async updatePassword(userId: number, newPassword: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // In a real application, this would hash the password before storing
    const updatedUser = { ...user, password: newPassword };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.betIdCounter++;
    const now = new Date();
    
    // Ensure market and betType are set to null if not provided
    const market = insertBet.market ?? null;
    const betType = insertBet.betType ?? null;
    
    const bet: Bet = { 
      ...insertBet, 
      id, 
      createdAt: now,
      market,
      betType
    };
    
    this.bets.set(id, bet);
    return bet;
  }

  async getUserBets(userId: number, limit = 10): Promise<Bet[]> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => {
        return (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) - 
               (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      });
    
    return userBets.slice(0, limit);
  }

  // Game history operations
  async addGameHistory(insertHistory: InsertGameHistory): Promise<GameHistory> {
    const id = this.historyIdCounter++;
    const now = new Date();
    
    // Ensure market is set to null if not provided
    const market = insertHistory.market ?? null;
    
    const history: GameHistory = {
      ...insertHistory,
      id,
      timestamp: now,
      market
    };
    
    this.history.set(id, history);
    return history;
  }

  async getGameHistory(gameType: string, limit = 10): Promise<GameHistory[]> {
    const gameHistories = Array.from(this.history.values())
      .filter(history => history.gameType === gameType)
      .sort((a, b) => {
        return (b.timestamp instanceof Date ? b.timestamp.getTime() : 0) - 
               (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
      });
    
    return gameHistories.slice(0, limit);
  }

  // Deposit operations
  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const id = this.depositIdCounter++;
    const now = new Date();
    
    const deposit: Deposit = { 
      ...insertDeposit, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: "pending",
      adminNote: null,
      details: insertDeposit.details || {}
    };
    
    this.deposits.set(id, deposit);
    return deposit;
  }

  async getUserDeposits(userId: number, limit = 10): Promise<Deposit[]> {
    const userDeposits = Array.from(this.deposits.values())
      .filter(deposit => deposit.userId === userId)
      .sort((a, b) => {
        return (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) - 
               (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      });
    
    return userDeposits.slice(0, limit);
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async updateDepositStatus(id: number, status: string, adminNote?: string): Promise<Deposit | undefined> {
    const deposit = await this.getDeposit(id);
    if (!deposit) return undefined;
    
    const now = new Date();
    const updatedDeposit = { 
      ...deposit, 
      status, 
      updatedAt: now,
      adminNote: adminNote || deposit.adminNote
    };
    
    this.deposits.set(id, updatedDeposit);

    // If deposit is approved, update user's balance
    if (status === "approved") {
      const user = await this.getUser(deposit.userId);
      if (user) {
        await this.updateUserBalance(user.id, user.balance + deposit.amount);
      }
    }
    
    return updatedDeposit;
  }

  async getAllPendingDeposits(): Promise<Deposit[]> {
    return Array.from(this.deposits.values())
      .filter(deposit => deposit.status === "pending")
      .sort((a, b) => {
        return (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) - 
               (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
      });
  }

  // Withdrawal operations
  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.withdrawalIdCounter++;
    const now = new Date();
    
    const withdrawal: Withdrawal = { 
      ...insertWithdrawal, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: "pending",
      adminNote: null,
      details: insertWithdrawal.details || {}
    };
    
    // Deduct the amount from the user's balance immediately
    const user = await this.getUser(withdrawal.userId);
    if (user && user.balance >= withdrawal.amount) {
      await this.updateUserBalance(user.id, user.balance - withdrawal.amount);
    }
    
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async getUserWithdrawals(userId: number, limit = 10): Promise<Withdrawal[]> {
    const userWithdrawals = Array.from(this.withdrawals.values())
      .filter(withdrawal => withdrawal.userId === userId)
      .sort((a, b) => {
        return (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) - 
               (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      });
    
    return userWithdrawals.slice(0, limit);
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async updateWithdrawalStatus(id: number, status: string, adminNote?: string): Promise<Withdrawal | undefined> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) return undefined;
    
    const now = new Date();
    const updatedWithdrawal = { 
      ...withdrawal, 
      status, 
      updatedAt: now,
      adminNote: adminNote || withdrawal.adminNote
    };
    
    this.withdrawals.set(id, updatedWithdrawal);

    // If withdrawal is rejected, refund the amount to the user's balance
    if (status === "rejected") {
      const user = await this.getUser(withdrawal.userId);
      if (user) {
        await this.updateUserBalance(user.id, user.balance + withdrawal.amount);
      }
    }
    
    return updatedWithdrawal;
  }

  async getAllPendingWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter(withdrawal => withdrawal.status === "pending")
      .sort((a, b) => {
        return (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) - 
               (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
      });
  }
}

export const storage = new MemStorage();
