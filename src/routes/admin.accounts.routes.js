// src/routes/admin.accounts.routes.js
import { Router } from 'express';
import { AdminAccountController } from '../controllers/admin.account.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

// List all accounts
router.get('/', AdminAccountController.listAccounts);

// Get account for a specific user
router.get('/:userId', AdminAccountController.getAccountByUser);

// Initialize account with starting virtual money
router.post('/:userId/init', AdminAccountController.initializeAccount);

// Top-up virtual money
router.post('/:userId/topup', AdminAccountController.topupAccount);

// Reset account balance (optionally newInitialAmount)
router.post('/:userId/reset', AdminAccountController.resetAccount);

export default router;
