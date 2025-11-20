const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
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
  avatar_url: Joi.string().uri(),
  language: Joi.string().valid('fr', 'en'),
  instructor_info: Joi.object({
    bio: Joi.string().max(1000),
    expertise_tags: Joi.array().items(Joi.string()),
    verification_status: Joi.string().valid('unverified', 'verified', 'rejected')
  }),
  notification_settings: Joi.object({
    email_notifications: Joi.boolean(),
    marketing_emails: Joi.boolean(),
    newsletter: Joi.boolean()
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const resetRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/request-password-reset', validate(resetRequestSchema), authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/verify-jwt', authController.verifyJWT);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;