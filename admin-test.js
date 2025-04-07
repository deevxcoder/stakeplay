import { storage } from './server/storage.ts';

async function testAdminAccess() {
  try {
    // Make admin user an admin
    const user = await storage.makeUserAdmin('admin');
    console.log('Updated admin user:', user);
    
    // Verify the user is an admin
    const adminUser = await storage.getUserByUsername('admin');
    console.log('Admin user status:', adminUser);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminAccess();
