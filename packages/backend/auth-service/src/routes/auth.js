const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth-middleware');
const AuthService = require('../services/auth-service');
const { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} = require('../utils/validation-schemas');
const { CustomError } = require('../utils/errors');

const router = express.Router();

// Rate limiting for auth endpoints (5 attempts per 10 minutes)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts, please try again later',
    },
  },
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    console.log('Register request received:', req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      throw new CustomError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    console.log('Validation passed, calling AuthService.register');
    const result = await AuthService.register(value);
    console.log('Registration successful');
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.log('Registration error:', err.message);
    next(err);
  }
});

// Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log('Login validation error:', error.details[0].message);
      throw new CustomError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    console.log('Validation passed, calling AuthService.login');
    const result = await AuthService.login(value.email, value.password);
    console.log('Login successful');
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.log('Login error:', err.message);
    next(err);
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh Token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      throw new CustomError('Refresh token required', 400, 'MISSING_TOKEN');
    }

    const result = await AuthService.refreshToken(refresh_token);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// Get Profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const profile = await AuthService.getUserProfile(req.user._id);
    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (err) {
    next(err);
  }
});

// Update Profile
router.patch('/profile', authenticateToken, async (req, res, next) => {
  try {
    console.log('PATCH /profile called with:', { 
      userId: req.user?._id, 
      body: req.body,
      headers: req.headers 
    });
    
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      throw new CustomError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const profile = await AuthService.updateProfile(req.user._id, value);
    console.log('Profile updated successfully');
    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (err) {
    console.log('Error updating profile:', err.message);
    next(err);
  }
});

// Change Password
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    console.log('Change password request received:', { userId: req.user?._id, body: req.body });
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      throw new CustomError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    console.log('Calling AuthService.changePassword');
    await AuthService.changePassword(req.user._id, value.old_password, value.new_password);
    console.log('Password changed successfully');
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.log('Change password error:', err.message);
    next(err);
  }
});

// Request Password Reset
router.post('/request-password-reset', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new CustomError('Email required', 400, 'MISSING_EMAIL');
    }

    await AuthService.requestPasswordReset(email);
    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent',
    });
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      throw new CustomError('Token and new password required', 400, 'MISSING_FIELDS');
    }

    await AuthService.resetPassword(token, new_password);
    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
});

// Get Public Profile
router.get('/users/:id', async (req, res, next) => {
  try {
    const profile = await AuthService.getUserProfile(req.params.id);
    res.json({
      success: true,
      data: { user: profile },
    });
  } catch (err) {
    next(err);
  }
});

// Verify JWT
router.get('/verify-jwt', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user_id: req.user._id,
    },
  });
});

module.exports = router;