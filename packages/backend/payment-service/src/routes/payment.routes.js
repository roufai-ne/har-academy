const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const purchaseSchema = Joi.object({
  courseId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('EUR')
});

const subscriptionSchema = Joi.object({
  plan: Joi.string().valid('basic', 'pro', 'enterprise').required(),
  billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly')
});

const changeSubscriptionSchema = Joi.object({
  plan: Joi.string().valid('basic', 'pro', 'enterprise').required(),
  billingCycle: Joi.string().valid('monthly', 'yearly')
});

const cancelSchema = Joi.object({
  reason: Joi.string().max(500)
});

const refundSchema = Joi.object({
  reason: Joi.string().max(500)
});

// Webhook route (no auth, raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Verify enrollment (inter-service, no user auth required)
router.get('/verify-enrollment', paymentController.verifyEnrollment);

// Protected routes
router.post('/purchase', authenticate, validate(purchaseSchema), paymentController.createCoursePurchase);
router.post('/subscriptions', authenticate, validate(subscriptionSchema), paymentController.createSubscription);
router.put('/subscription/change', authenticate, validate(changeSubscriptionSchema), paymentController.changeSubscription);
router.post('/subscription/reactivate', authenticate, paymentController.reactivateSubscription);
router.get('/transactions', authenticate, paymentController.getTransactions);
router.get('/subscription', authenticate, paymentController.getSubscription);
router.get('/user/:userId/entitlements', authenticate, paymentController.getUserEntitlements);
router.post('/subscription/cancel', authenticate, validate(cancelSchema), paymentController.cancelSubscription);
router.post('/transactions/:transactionId/refund', authenticate, validate(refundSchema), paymentController.refundTransaction);

module.exports = router;
