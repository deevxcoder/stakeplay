import { storage } from './server/storage.ts';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return ;
}

async function createAdminUser() {
  try {
    // First, check if admin already exists
    let adminUser = await storage.getUserByUsername('admin');
    console.log('Existing admin user:', adminUser);
    
    if (!adminUser) {
      // Create a new admin user
      const hashedPassword = await hashPassword('admin123');
      adminUser = await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        mobile: '+1234567890',
      });
      console.log('Created new admin user:', adminUser);
    }
    
    // Make the user an admin
    const updatedUser = await storage.makeUserAdmin('admin');
    console.log('Updated admin privileges:', updatedUser);
    
    // Verify the user is now an admin
    const verifiedUser = await storage.getUserByUsername('admin');
    console.log('Final admin user status:', verifiedUser);
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
