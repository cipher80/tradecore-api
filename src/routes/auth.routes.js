// src/routes/auth.routes.js
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// LOGIN
router.post('/login', AuthController.login);

// CURRENT USER
router.get('/me', authenticate, AuthController.getMe);

export default router;
