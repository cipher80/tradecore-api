// src/routes/trading.routes.js
import { Router } from 'express';
import { TradingController } from '../controllers/trading.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// User must be logged in to trade
router.use(authenticate);

// Place order (BUY/SELL)
router.post('/orders', TradingController.placeOrder);

// My orders
router.get('/orders/me', TradingController.getMyOrders);

// My trades
router.get('/trades/me', TradingController.getMyTrades);

// My positions
router.get('/positions/me', TradingController.getMyPositions);

export default router;
