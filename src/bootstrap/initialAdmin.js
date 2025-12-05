// src/bootstrap/initialAdmin.js
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

export async function ensureInitialAdmin() {
  const adminCount = await User.count({ where: { role: 'admin' } });

  if (adminCount > 0) {
    console.log(`✅ Admin already exists (count = ${adminCount}). Skipping bootstrap.`);
    return;
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ No admin exists and ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env');
    console.error('   Please set them to auto-create the initial admin.');
    return;
  }

  try {
    const adminUser = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // will be hashed by model hook
      role: 'admin',
    });

    console.log('🚀 Initial admin user created:');
    console.log(`   email:    ${adminUser.email}`);
    console.log('   password: (from ADMIN_PASSWORD env var)');
  } catch (err) {
    console.error('❌ Failed to create initial admin:', err.message);
  }
}
