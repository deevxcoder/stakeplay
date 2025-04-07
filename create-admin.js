const { storage } = require('./server/storage');
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
    // Create new admin user
    const adminUser = await storage.createUser({
      username: 'kalua',
      password: 'kalua123',
      email: 'kalua@example.com',
      mobile: '+1234567890',
      balance: 0,
      isAdmin: true
    });

    console.log('Admin user details:', {
      username: adminUser.username,
      isAdmin: adminUser.isAdmin
    });

    // Verify admin status
    const verifiedUser = await storage.getUserByUsername('kalua');
    console.log('Verified admin user status:', verifiedUser);

    return verifiedUser;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

createAdminUser();