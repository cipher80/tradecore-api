// src/controllers/admin.user.controller.js
import { User } from '../models/user.model.js';

export const AdminUserController = {
  // GET /admin/users  → list all users
  async listUsers(req, res) {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: users.map((u) => u.toJSON()),
      });
    } catch (err) {
      console.error('List users error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to list users',
      });
    }
  },

  // GET /admin/users/:id → get single user
  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (err) {
      console.error('Get user by id error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
      });
    }
  },

  // POST /admin/users → create user (admin or normal)
  async createUser(req, res) {
    const { email, password, role = 'user', isActive = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: user, admin',
      });
    }

    try {
      const existing = await User.findOne({ where: { email } });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      const newUser = await User.create({
        email,
        password, // will be hashed by model hook
        role,
        isActive,
      });

      return res.status(201).json({
        success: true,
        data: newUser.toJSON(),
      });
    } catch (err) {
      console.error('Create user error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  },

  // PATCH /admin/users/:id/status → enable / disable user
  async updateUserStatus(req, res) {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // prevent disabling yourself (optional safety)
      if (user.id === req.user.id && isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot disable your own account',
        });
      }

      user.isActive = isActive;
      await user.save();

      return res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (err) {
      console.error('Update user status error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user status',
      });
    }
  },

  // PATCH /admin/users/:id/role → change user role
  async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: user, admin',
      });
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // optional: block downgrading the last remaining admin
      if (user.role === 'admin' && role === 'user') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot downgrade the last remaining admin',
          });
        }
      }

      user.role = role;
      await user.save();

      return res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (err) {
      console.error('Update user role error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user role',
      });
    }
  },
};
