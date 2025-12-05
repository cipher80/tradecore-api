// src/controllers/admin.account.controller.js
import { User } from '../models/user.model.js';
import { PracticeAccount } from '../models/practiceAccount.model.js';
import { AccountTransaction } from '../models/accountTransaction.model.js';
import { sequelize } from '../config/database.js';

export const AdminAccountController = {
  // GET /admin/accounts  → list all practice accounts
  async listAccounts(req, res) {
    try {
      const accounts = await PracticeAccount.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role', 'isActive'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (err) {
      console.error('List accounts error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to list accounts',
      });
    }
  },

  // GET /admin/accounts/:userId  → get account for a user
  async getAccountByUser(req, res) {
    const { userId } = req.params;

    try {
      const account = await PracticeAccount.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role', 'isActive'],
          },
        ],
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Practice account not found for this user',
        });
      }

      return res.status(200).json({
        success: true,
        data: account,
      });
    } catch (err) {
      console.error('Get account error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch account',
      });
    }
  },

  // POST /admin/accounts/:userId/init → create practice account
  async initializeAccount(req, res) {
    const { userId } = req.params;
    const { initialAmount } = req.body;

    const amountNum = Number(initialAmount);
    if (!initialAmount || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'initialAmount must be a positive number',
      });
    }

    const t = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const existing = await PracticeAccount.findOne({
        where: { userId },
        transaction: t,
      });

      if (existing) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Practice account already exists for this user',
        });
      }

      const account = await PracticeAccount.create(
        {
          userId: user.id,
          initialAmount: amountNum,
          currentBalance: amountNum,
        },
        { transaction: t },
      );

      await AccountTransaction.create(
        {
          accountId: account.id,
          type: 'credit',
          source: 'admin_topup',
          amount: amountNum,
          balanceAfter: amountNum,
          note: 'Initial funding',
        },
        { transaction: t },
      );

      await t.commit();

      return res.status(201).json({
        success: true,
        data: account,
      });
    } catch (err) {
      console.error('Initialize account error:', err);
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize account',
      });
    }
  },

  // POST /admin/accounts/:userId/topup → add more virtual money
  async topupAccount(req, res) {
    const { userId } = req.params;
    const { amount, note } = req.body;

    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a positive number',
      });
    }

    const t = await sequelize.transaction();

    try {
      const account = await PracticeAccount.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!account) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Practice account not found for this user',
        });
      }

      const current = Number(account.currentBalance);
      const newBalance = current + amountNum;

      account.currentBalance = newBalance;
      await account.save({ transaction: t });

      await AccountTransaction.create(
        {
          accountId: account.id,
          type: 'credit',
          source: 'admin_topup',
          amount: amountNum,
          balanceAfter: newBalance,
          note: note || 'Admin top-up',
        },
        { transaction: t },
      );

      await t.commit();

      return res.status(200).json({
        success: true,
        data: account,
      });
    } catch (err) {
      console.error('Topup account error:', err);
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: 'Failed to top-up account',
      });
    }
  },

  // POST /admin/accounts/:userId/reset → reset balance (optionally new initial amount)
  async resetAccount(req, res) {
    const { userId } = req.params;
    const { newInitialAmount } = req.body;

    const t = await sequelize.transaction();

    try {
      const account = await PracticeAccount.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!account) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Practice account not found for this user',
        });
      }

      const oldBalance = Number(account.currentBalance);
      let newInitial = account.initialAmount;
      if (newInitialAmount !== undefined) {
        const val = Number(newInitialAmount);
        if (isNaN(val) || val < 0) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: 'newInitialAmount must be a non-negative number',
          });
        }
        newInitial = val;
      }

      account.initialAmount = newInitial;
      account.currentBalance = newInitial;
      await account.save({ transaction: t });

      const diff = Number(newInitial) - oldBalance;
      const type = diff >= 0 ? 'credit' : 'debit';

      await AccountTransaction.create(
        {
          accountId: account.id,
          type,
          source: 'admin_adjust',
          amount: Math.abs(diff),
          balanceAfter: newInitial,
          note: 'Reset account balance',
        },
        { transaction: t },
      );

      await t.commit();

      return res.status(200).json({
        success: true,
        data: account,
      });
    } catch (err) {
      console.error('Reset account error:', err);
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: 'Failed to reset account',
      });
    }
  },
};
