// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN || '1d',
    },
  );
}

export const AuthController = {
  // LOGIN ONLY
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User is disabled, contact admin',
        });
      }

      const passwordValid = await user.validatePassword(password);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to login',
      });
    }
  },

  // Current user info
  async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id);

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
      console.error('Get me error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
      });
    }
  },
};
