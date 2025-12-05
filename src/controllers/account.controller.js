// src/controllers/account.controller.js
import { PracticeAccount } from '../models/practiceAccount.model.js';
import { AccountTransaction } from '../models/accountTransaction.model.js';

export const AccountController = {
  // GET /account/me → my practice account
  async getMyAccount(req, res) {
    try {
      const account = await PracticeAccount.findOne({
        where: { userId: req.user.id },
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Practice account not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: account,
      });
    } catch (err) {
      console.error('Get my account error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch account',
      });
    }
  },

  // GET /account/me/transactions → my transactions
  async getMyTransactions(req, res) {
    try {
      const account = await PracticeAccount.findOne({
        where: { userId: req.user.id },
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Practice account not found',
        });
      }

      const transactions = await AccountTransaction.findAll({
        where: { accountId: account.id },
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (err) {
      console.error('Get my transactions error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
      });
    }
  },
};
