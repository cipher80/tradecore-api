// src/routes/admin.users.routes.js
import { Router } from 'express';
import { AdminUserController } from '../controllers/admin.user.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All routes here require admin
router.use(authenticate, requireAdmin);

// List all users
router.get('/', AdminUserController.listUsers);

// Get one user by id
router.get('/:id', AdminUserController.getUserById);

// Create a new user
router.post('/', AdminUserController.createUser);

// Update user status (enable/disable)
router.patch('/:id/status', AdminUserController.updateUserStatus);

// Update user role (user/admin)
router.patch('/:id/role', AdminUserController.updateUserRole);

export default router;
