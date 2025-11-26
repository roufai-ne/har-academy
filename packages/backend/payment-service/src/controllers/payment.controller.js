const { Transaction, Subscription } = require('../models');
const stripeService = require('../services/stripe.service');
const axios = require('axios');
const logger = require('../utils/logger');

class PaymentController {
  // Create payment intent for course purchase
  async createCoursePurchase(req, res) {
    try {
      const { courseId, amount, currency = 'EUR' } = req.body;
      const userId = req.user.id;

      // Create transaction record
      const transaction = new Transaction({
        user: userId,
        course: courseId,
        type: 'course_purchase',
        amount,
        currency,
        status: 'pending'
      });

      // Create Stripe payment intent
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        currency,
        {
          userId,
          courseId,
          transactionId: transaction._id.toString()
        }
      );

      transaction.stripePaymentIntentId = paymentIntent.id;
      await transaction.save();

      res.status(201).json({
        success: true,
        data: {
          transactionId: transaction._id,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      });
    } catch (error) {
      logger.error('Course purchase creation failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Create subscription
  async createSubscription(req, res) {
    try {
      const { plan, billingCycle = 'monthly' } = req.body;
      const userId = req.user.id;

      // Check for existing active subscription
      const existing = await Subscription.findActiveByUser(userId);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: { message: 'User already has an active subscription' }
        });
      }

      // Get plan pricing
      const planPricing = {
        basic: { monthly: 9.99, yearly: 99.99 },
        pro: { monthly: 19.99, yearly: 199.99 },
        enterprise: { monthly: 49.99, yearly: 499.99 }
      };

      const price = planPricing[plan][billingCycle];
      const stripePriceId = process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`];

      // Create or get Stripe customer
      const customer = await stripeService.getOrCreateCustomer(
        userId,
        req.user.email,
        req.user.name
      );

      // Create Stripe subscription
      const stripeSubscription = await stripeService.createSubscription(
        customer.id,
        stripePriceId,
        { userId, plan }
      );

      // Create subscription record
      const subscription = new Subscription({
        user: userId,
        plan,
        billingCycle,
        price,
        currency: 'EUR',
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customer.id,
        stripePriceId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        status: stripeSubscription.status
      });

      await subscription.save();

      res.status(201).json({
        success: true,
        data: {
          subscription,
          clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret
        }
      });
    } catch (error) {
      logger.error('Subscription creation failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get user transactions
  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { user: userId };
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
    } catch (error) {
      logger.error('Failed to fetch transactions:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get user subscription
  async getSubscription(req, res) {
    try {
      const userId = req.user.id;
      const subscription = await Subscription.findOne({ user: userId }).sort({ createdAt: -1 });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: { message: 'No subscription found' }
        });
      }

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      logger.error('Failed to fetch subscription:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      const { reason } = req.body;

      const subscription = await Subscription.findActiveByUser(userId);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: { message: 'No active subscription found' }
        });
      }

      await stripeService.cancelSubscription(subscription.stripeSubscriptionId, true);
      await subscription.cancel(reason);

      res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of billing period',
        data: subscription
      });
    } catch (error) {
      logger.error('Subscription cancellation failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get user entitlements (purchased courses and subscription)
  async getUserEntitlements(req, res) {
    try {
      const userId = req.params.userId;
      
      // Check authorization - users can only view their own or admins can view any
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Unauthorized to view these entitlements' }
        });
      }

      // Get active subscription
      const subscription = await Subscription.findOne({ 
        user: userId,
        status: { $in: ['active', 'trialing'] }
      });

      // Get completed course purchases
      const transactions = await Transaction.find({
        user: userId,
        type: 'course_purchase',
        status: 'completed'
      }).select('course amount currency completedAt');

      // Get course IDs
      const purchasedCourseIds = transactions.map(t => t.course);

      res.json({
        success: true,
        data: {
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
          } : null,
          purchasedCourses: purchasedCourseIds,
          transactions: transactions,
          hasActiveSubscription: !!subscription
        }
      });
    } catch (error) {
      logger.error('Failed to fetch entitlements:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Refund transaction
  async refundTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Transaction not found' }
        });
      }

      // Check ownership
      if (transaction.user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Unauthorized to refund this transaction' }
        });
      }

      // Check if transaction is refundable
      if (transaction.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only completed transactions can be refunded' }
        });
      }

      if (transaction.status === 'refunded') {
        return res.status(400).json({
          success: false,
          error: { message: 'Transaction already refunded' }
        });
      }

      // Check 14-day refund window
      const daysSincePurchase = Math.floor((Date.now() - transaction.completedAt) / (1000 * 60 * 60 * 24));
      if (daysSincePurchase > 14) {
        return res.status(400).json({
          success: false,
          error: { message: 'Refund period expired. Refunds are only available within 14 days of purchase.' }
        });
      }

      // Process refund with Stripe
      if (transaction.stripePaymentIntentId) {
        await stripeService.refundPayment(transaction.stripePaymentIntentId, reason);
      }

      // Update transaction
      transaction.status = 'refunded';
      transaction.refundReason = reason;
      transaction.refundedAt = new Date();
      await transaction.save();

      // Revoke course access if applicable
      if (transaction.course) {
        try {
          await axios.delete(
            `${process.env.COURSE_SERVICE_URL}/api/v1/enrollments/${transaction.course}`,
            {
              headers: {
                'X-Service-Auth': process.env.SERVICE_SECRET,
                'X-User-Id': userId
              }
            }
          );
        } catch (error) {
          logger.error('Failed to revoke course access:', error);
        }
      }

      res.json({
        success: true,
        message: 'Transaction refunded successfully',
        data: transaction
      });
    } catch (error) {
      logger.error('Refund failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Webhook handler
  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature'];

    try {
      const event = stripeService.constructWebhookEvent(req.body, signature);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (transaction) {
      await transaction.markCompleted();

      // Notify course service to grant access
      if (transaction.course) {
        try {
          await axios.post(
            `${process.env.COURSE_SERVICE_URL}/api/v1/enrollments`,
            {
              courseId: transaction.course,
              paymentId: transaction._id
            },
            {
              headers: {
                'X-Service-Auth': process.env.SERVICE_SECRET
              }
            }
          );
        } catch (error) {
          logger.error('Failed to create enrollment:', error);
        }
      }
    }
  }

  async handlePaymentFailed(paymentIntent) {
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (transaction) {
      await transaction.markFailed(paymentIntent.last_payment_error?.message);
    }
  }

  async handleSubscriptionUpdated(subscription) {
    const sub = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (sub) {
      sub.status = subscription.status;
      sub.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      sub.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      sub.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      await sub.save();
    }
  }

  async handleSubscriptionDeleted(subscription) {
    const sub = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (sub) {
      sub.status = 'expired';
      await sub.save();
    }
  }
}

module.exports = new PaymentController();