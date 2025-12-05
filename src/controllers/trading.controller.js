// src/controllers/trading.controller.js
import { TradingService } from '../services/trading.service.js';
import { Order } from '../models/order.model.js';
import { Trade } from '../models/trade.model.js';
import { Position } from '../models/position.model.js';

export const TradingController = {
  // POST /trading/orders
  async placeOrder(req, res) {
    try {
      const { symbol, segment, side, quantity, price, orderType } = req.body;

      const result = await TradingService.placeOrder({
        userId: req.user.id,
        symbol,
        segment,
        side,
        quantity,
        price,
        orderType,
      });

      return res.status(201).json({
        success: true,
        data: {
          order: result.order,
          trade: result.trade,
          position: result.position,
          account: result.account,
        },
      });
    } catch (err) {
      console.error('Place order error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to place order',
      });
    }
  },

  // GET /trading/orders/me
  async getMyOrders(req, res) {
    try {
      const orders = await Order.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (err) {
      console.error('Get my orders error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
      });
    }
  },

  // GET /trading/trades/me
  async getMyTrades(req, res) {
    try {
      const trades = await Trade.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: trades,
      });
    } catch (err) {
      console.error('Get my trades error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch trades',
      });
    }
  },

  // GET /trading/positions/me
  async getMyPositions(req, res) {
    try {
      const positions = await Position.findAll({
        where: { userId: req.user.id },
        order: [['symbol', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        data: positions,
      });
    } catch (err) {
      console.error('Get my positions error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch positions',
      });
    }
  },
};
