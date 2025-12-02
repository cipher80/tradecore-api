// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import { testDbConnection, sequelize } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import adminUserRoutes from './routes/admin.users.routes.js';
import './models/user.model.js';
import { ensureInitialAdmin } from './bootstrap/initialAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/auth', authRoutes);

// Admin user management routes
app.use('/admin/users', adminUserRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

async function start() {
  await testDbConnection();
  await sequelize.sync({ alter: false });

  // bootstraps initial admin if not present
  await ensureInitialAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
