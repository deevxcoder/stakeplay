
import { storage } from './server/storage.ts';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // First, check if admin already exists
    let adminUser = await storage.getUserByUsername('admin');
    console.log('Existing admin user:', adminUser);
    
    if (!adminUser) {
      // Create a new admin user with no initial balance
      const hashedPassword = await hashPassword('admin123');
      adminUser = await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        mobile: '+1234567890',
        balance: 0,
        isAdmin: true
      });
      console.log('Created new admin user:', adminUser);
    } else {
      // Update existing user to be admin with no balance override
      adminUser = await storage.makeUserAdmin(adminUser.username);
      console.log('Updated admin privileges:', adminUser);
    }
    
    // Verify the user is now an admin
    const verifiedUser = await storage.getUserByUsername('admin');
    console.log('Final admin user status:', verifiedUser);
    
    return verifiedUser;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

createAdminUser();
