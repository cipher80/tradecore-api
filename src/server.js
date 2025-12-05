// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import { testDbConnection, sequelize } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import adminUserRoutes from './routes/admin.users.routes.js';
import adminAccountRoutes from './routes/admin.accounts.routes.js';
import accountRoutes from './routes/account.routes.js';
import tradingRoutes from './routes/trading.routes.js';

// Register models
import './models/user.model.js';
import './models/practiceAccount.model.js';
import './models/accountTransaction.model.js';
import './models/order.model.js';
import './models/trade.model.js';
import './models/position.model.js';

import { ensureInitialAdmin } from './bootstrap/initialAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/admin/accounts', adminAccountRoutes);
app.use('/account', accountRoutes);
app.use('/trading', tradingRoutes);

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

  // In dev, you can temporarily set alter: true when adding new tables
  await sequelize.sync({ alter: false });

  await ensureInitialAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
