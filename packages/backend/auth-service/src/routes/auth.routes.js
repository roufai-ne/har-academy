const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Rate limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many attempts, please try again later' } }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many password reset attempts, please try again later' } }
});

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).required(),
  role: Joi.string().valid('learner', 'instructor').default('learner'),
  language: Joi.string().valid('fr', 'en').default('fr')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  avatar_url: Joi.string().uri({ scheme: ['http', 'https'] }).max(2048),
  language: Joi.string().valid('fr', 'en'),
  instructor_info: Joi.object({
    bio: Joi.string().max(1000),
    expertise_tags: Joi.array().items(Joi.string().max(50)).max(20)
    // NOTE: verification_status removed — only admins should change this
  }),
  notification_settings: Joi.object({
    email_notifications: Joi.boolean(),
    marketing_emails: Joi.boolean(),
    newsletter: Joi.boolean()
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

const resetRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  newPassword: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Public routes (with rate limiting on sensitive endpoints)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/request-password-reset', passwordResetLimiter, validate(resetRequestSchema), authController.requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.get('/verify-jwt', authController.verifyJWT);

// Public profile
router.get('/users/:id', authController.getPublicProfile);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

module.exports = router;