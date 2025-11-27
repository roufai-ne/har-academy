const { User } = require('../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, role = 'learner', language = 'fr' } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { message: 'Email already exists' }
        });
      }

      // Create verification token
      const verification_token = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = new User({
        email,
        password_hash: password, // will be hashed by pre-save hook
        first_name,
        last_name,
        role,
        language,
        verification_token,
        instructor_info: role === 'instructor' ? {
          bio: '',
          expertise_tags: [],
          total_courses: 0,
          rating: 0,
          verification_status: 'unverified'
        } : undefined
      });

      await user.save();

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      logger.info(`User registered: ${user.email}`);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }

      // Check if active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: { message: 'Account is deactivated or suspended' }
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }

      // Update last login
      user.last_login_at = new Date();
      await user.save();

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get current user
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.user_id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Failed to fetch user:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Update profile
  async updateProfile(req, res) {
    try {
      const { first_name, last_name, avatar_url, language, instructor_info, notification_settings } = req.body;

      const user = await User.findById(req.user.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Update fields
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (avatar_url) user.avatar_url = avatar_url;
      if (language) user.language = language;
      
      // Update instructor info if user is instructor
      if (instructor_info && user.role === 'instructor') {
        user.instructor_info = {
          ...user.instructor_info,
          ...instructor_info
        };
      }

      // Update notification settings
      if (notification_settings) {
        user.notification_settings = {
          ...user.notification_settings,
          ...notification_settings
        };
      }

      await user.save();

      logger.info(`Profile updated: ${user.email}`);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Profile update failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Current password is incorrect' }
        });
      }

      // Update password
      user.password_hash = newPassword; // will be hashed by pre-save hook
      await user.save();

      logger.info(`Password changed: ${user.email}`);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      logger.error('Password change failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return res.json({
          success: true,
          message: 'If the email exists, a reset link will be sent'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.reset_password_token = resetToken;
      user.reset_password_expires = new Date(Date.now() + 3600000); // 1 hour

      await user.save();

      // TODO: Send email with reset link
      logger.info(`Password reset requested: ${user.email}`);

      res.json({
        success: true,
        message: 'If the email exists, a reset link will be sent',
        // For testing only - remove in production
        resetToken: config.nodeEnv === 'development' ? resetToken : undefined
      });
    } catch (error) {
      logger.error('Password reset request failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        reset_password_token: token,
        reset_password_expires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid or expired reset token' }
        });
      }

      // Update password
      user.password_hash = newPassword;
      user.reset_password_token = null;
      user.reset_password_expires = null;

      await user.save();

      logger.info(`Password reset completed: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Password reset failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const user = await User.findOne({ verification_token: token });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid verification token' }
        });
      }

      user.is_verified = true;
      user.verification_token = null;
      await user.save();

      logger.info(`Email verified: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Verify JWT token
  async verifyJWT(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'No token provided' }
        });
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid token' }
        });
      }

      res.json({
        success: true,
        data: { 
          valid: true,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`
          }
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid token' }
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token required' }
        });
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid refresh token' }
        });
      }

      const newToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }
  }
}

module.exports = new AuthController();
