// src/routes/account.routes.js
import { Router } from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// User can only read their own account
router.get('/me', AccountController.getMyAccount);
router.get('/me/transactions', AccountController.getMyTransactions);

export default router;
