// src/services/trading.service.js
import { sequelize } from '../config/database.js';
import { PracticeAccount } from '../models/practiceAccount.model.js';
import { AccountTransaction } from '../models/accountTransaction.model.js';
import { Order } from '../models/order.model.js';
import { Trade } from '../models/trade.model.js';
import { Position } from '../models/position.model.js';

function toNumber(val) {
  return Number(val || 0);
}

export const TradingService = {
  /**
   * Place an order and execute it immediately (full fill).
   * Long-only: user must have sufficient balance for BUY and sufficient quantity for SELL.
   */
  async placeOrder(params) {
    const {
      userId,
      side, // 'buy' | 'sell'
      symbol,
      segment, // 'NSEFO' | 'MCX'
      quantity,
      price,
      orderType = 'market',
    } = params;

    const qty = Number(quantity);
    const px = Number(price);

    if (!userId) {
      throw new Error('UserId is required');
    }
    if (!symbol || !segment || !side || !qty || !px) {
      throw new Error('symbol, segment, side, quantity and price are required');
    }
    if (!['buy', 'sell'].includes(side)) {
      throw new Error('Invalid side');
    }
    if (!['NSEFO', 'MCX'].includes(segment)) {
      throw new Error('Invalid segment');
    }
    if (!['market', 'limit'].includes(orderType)) {
      throw new Error('Invalid orderType');
    }
    if (qty <= 0 || px <= 0) {
      throw new Error('Quantity and price must be positive');
    }

    return sequelize.transaction(async (t) => {
      // 1. Lock practice account
      const account = await PracticeAccount.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!account || !account.isActive) {
        throw new Error('Practice account not found or inactive');
      }

      const currentBalance = toNumber(account.currentBalance);

      // 2. Lock position (if exists)
      let position = await Position.findOne({
        where: { userId, symbol, segment },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const grossAmount = +(px * qty).toFixed(2);
      const charges = 0; // extend later
      let netAmount = 0;

      // 3. Check rules & update position
      if (side === 'buy') {
        netAmount = -(grossAmount + charges); // debit

        if (currentBalance + netAmount < 0) {
          throw new Error('Insufficient virtual balance');
        }

        if (!position) {
          position = await Position.create(
            {
              userId,
              symbol,
              segment,
              netQuantity: qty,
              avgBuyPrice: px,
              realizedPnl: 0,
            },
            { transaction: t },
          );
        } else {
          const oldQty = toNumber(position.netQuantity);
          const oldAvg = toNumber(position.avgBuyPrice);

          const newQty = oldQty + qty;
          const newAvg =
            newQty > 0
              ? (oldAvg * oldQty + px * qty) / newQty
              : 0;

          position.netQuantity = newQty;
          position.avgBuyPrice = newAvg.toFixed(2);
          await position.save({ transaction: t });
        }
      } else {
        // SELL
        if (!position || toNumber(position.netQuantity) < qty) {
          throw new Error('Not enough quantity to sell');
        }

        netAmount = grossAmount - charges; // credit

        const oldQty = toNumber(position.netQuantity);
        const oldAvg = toNumber(position.avgBuyPrice);
        const newQty = oldQty - qty;

        const realizedForTrade = +( (px - oldAvg) * qty ).toFixed(2);
        const existingRealized = toNumber(position.realizedPnl);

        position.netQuantity = newQty;
        position.realizedPnl = (existingRealized + realizedForTrade).toFixed(2);

        if (newQty === 0) {
          position.avgBuyPrice = 0;
        }

        await position.save({ transaction: t });
      }

      // 4. Update account balance
      const newBalance = +(currentBalance + netAmount).toFixed(2);
      account.currentBalance = newBalance;
      await account.save({ transaction: t });

      // 5. Create order (filled)
      const order = await Order.create(
        {
          userId,
          side,
          symbol,
          segment,
          quantity: qty,
          price: px,
          orderType,
          status: 'filled',
          filledQuantity: qty,
          avgFillPrice: px,
        },
        { transaction: t },
      );

      // 6. Create trade
      const trade = await Trade.create(
        {
          orderId: order.id,
          userId,
          side,
          symbol,
          segment,
          quantity: qty,
          price: px,
          grossAmount,
          charges,
          netAmount,
        },
        { transaction: t },
      );

      // 7. Create account transaction record
      await AccountTransaction.create(
        {
          accountId: account.id,
          type: netAmount >= 0 ? 'credit' : 'debit',
          source: 'trade_pnl',
          amount: Math.abs(netAmount),
          balanceAfter: newBalance,
          note: `Trade ${side.toUpperCase()} ${symbol} x ${qty} @ ${px}`,
        },
        { transaction: t },
      );

      return { order, trade, position, account };
    });
  },
};
