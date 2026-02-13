const { Transaction, Subscription } = require('../models');
const stripeService = require('../services/stripe.service');
const config = require('../config');
const axios = require('axios');
const logger = require('../utils/logger');

const PLAN_PRICING = {
  basic: { monthly: 9.99, yearly: 99.99 },
  pro: { monthly: 19.99, yearly: 199.99 },
  enterprise: { monthly: 49.99, yearly: 499.99 }
};

class PaymentController {
  // Create payment intent for course purchase
  async createCoursePurchase(req, res) {
    try {
      const { courseId, amount, currency = 'EUR' } = req.body;
      const userId = req.user.user_id;

      // Check for duplicate pending transaction
      const existingPending = await Transaction.findOne({
        user: userId,
        course: courseId,
        status: 'pending'
      });
      if (existingPending) {
        return res.json({
          success: true,
          data: {
            transactionId: existingPending._id,
            clientSecret: null,
            paymentIntentId: existingPending.stripePaymentIntentId,
            message: 'Existing pending transaction found'
          }
        });
      }

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

      logger.info(`Course purchase created: transaction ${transaction._id} for user ${userId}`);

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
      const userId = req.user.user_id;

      // Check for existing active subscription
      const existing = await Subscription.findActiveByUser(userId);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: { message: 'User already has an active subscription. Use upgrade/downgrade instead.' }
        });
      }

      const price = PLAN_PRICING[plan][billingCycle];
      const stripePriceId = config.stripe.priceIds[`${plan}_${billingCycle}`]
        || process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`];

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

      // Create a transaction record for the subscription
      const transaction = new Transaction({
        user: userId,
        type: 'subscription',
        amount: price,
        currency: 'EUR',
        status: 'pending',
        subscription: subscription._id,
        stripePaymentIntentId: stripeSubscription.latest_invoice?.payment_intent?.id
      });
      await transaction.save();

      logger.info(`Subscription created: ${subscription._id} (${plan}/${billingCycle}) for user ${userId}`);

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

  // Upgrade or downgrade subscription
  async changeSubscription(req, res) {
    try {
      const { plan, billingCycle } = req.body;
      const userId = req.user.user_id;

      const currentSub = await Subscription.findActiveByUser(userId);
      if (!currentSub) {
        return res.status(404).json({
          success: false,
          error: { message: 'No active subscription found' }
        });
      }

      if (currentSub.plan === plan && (!billingCycle || currentSub.billingCycle === billingCycle)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Already on this plan' }
        });
      }

      const newBillingCycle = billingCycle || currentSub.billingCycle;
      const newPrice = PLAN_PRICING[plan][newBillingCycle];
      const newStripePriceId = config.stripe.priceIds[`${plan}_${newBillingCycle}`]
        || process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}_${newBillingCycle.toUpperCase()}`];

      // Update Stripe subscription
      const stripeSubscription = await stripeService.getSubscription(currentSub.stripeSubscriptionId);
      const updatedStripeSub = await stripeService.updateSubscription(
        currentSub.stripeSubscriptionId,
        stripeSubscription.items.data[0].id,
        newStripePriceId
      );

      // Update local subscription
      currentSub.plan = plan;
      currentSub.billingCycle = newBillingCycle;
      currentSub.price = newPrice;
      currentSub.stripePriceId = newStripePriceId;
      currentSub.currentPeriodStart = new Date(updatedStripeSub.current_period_start * 1000);
      currentSub.currentPeriodEnd = new Date(updatedStripeSub.current_period_end * 1000);
      await currentSub.save();

      logger.info(`Subscription ${currentSub._id} changed to ${plan}/${newBillingCycle} for user ${userId}`);

      res.json({
        success: true,
        message: `Subscription changed to ${plan} (${newBillingCycle})`,
        data: currentSub
      });
    } catch (error) {
      logger.error('Subscription change failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Reactivate cancelled subscription
  async reactivateSubscription(req, res) {
    try {
      const userId = req.user.user_id;

      const subscription = await Subscription.findOne({
        user: userId,
        cancelAtPeriodEnd: true,
        status: 'active'
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: { message: 'No subscription pending cancellation found' }
        });
      }

      await stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
      await subscription.reactivate();

      logger.info(`Subscription ${subscription._id} reactivated for user ${userId}`);

      res.json({
        success: true,
        message: 'Subscription reactivated',
        data: subscription
      });
    } catch (error) {
      logger.error('Subscription reactivation failed:', error);
      res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get user transactions with date range filtering
  async getTransactions(req, res) {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;

      const query = { user: userId };
      if (status) query.status = status;
      if (type) query.type = type;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Transaction.countDocuments(query)
      ]);

      // Calculate total spent
      const totalSpent = await Transaction.aggregate([
        { $match: { user: transactions.length > 0 ? transactions[0].user : null, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      res.json({
        success: true,
        data: transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        },
        summary: {
          totalSpent: totalSpent[0]?.total || 0
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
      const userId = req.user.user_id;
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
      const userId = req.user.user_id;
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

      logger.info(`Subscription ${subscription._id} cancelled for user ${userId}`);

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
      if (req.user.user_id !== userId && req.user.role !== 'admin') {
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
          transactions,
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

  // Verify if user has access to a specific course
  async verifyEnrollment(req, res) {
    try {
      const { userId, courseId } = req.query;

      if (!userId || !courseId) {
        return res.status(400).json({
          success: false,
          error: { message: 'userId and courseId query params are required' }
        });
      }

      // Check active subscription
      const subscription = await Subscription.findOne({
        user: userId,
        status: { $in: ['active', 'trialing'] },
        currentPeriodEnd: { $gt: new Date() }
      });

      // Check course purchase
      const purchase = await Transaction.findOne({
        user: userId,
        course: courseId,
        type: 'course_purchase',
        status: 'completed'
      });

      const hasAccess = !!subscription || !!purchase;
      let accessType = null;
      if (purchase) accessType = 'purchase';
      else if (subscription) accessType = 'subscription';

      res.json({
        success: true,
        data: {
          hasAccess,
          accessType,
          expiresAt: subscription ? subscription.currentPeriodEnd : null
        }
      });
    } catch (error) {
      logger.error('Verify enrollment failed:', error);
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
      const userId = req.user.user_id;
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
      if (transaction.status === 'refunded') {
        return res.status(400).json({
          success: false,
          error: { message: 'Transaction already refunded' }
        });
      }

      if (transaction.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only completed transactions can be refunded' }
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
      await transaction.refund(reason);

      // Revoke course access if applicable
      if (transaction.course) {
        try {
          const courseServiceUrl = config.services.courseServiceUrl || process.env.COURSE_SERVICE_URL;
          await axios.delete(
            `${courseServiceUrl}/api/v1/enrollments/service/${transaction.course}/revoke`,
            {
              headers: {
                'X-Service-Auth': config.serviceSecret || process.env.SERVICE_SECRET,
                'X-User-Id': transaction.user.toString()
              }
            }
          );
        } catch (error) {
          logger.error('Failed to revoke course access:', error.message);
        }
      }

      logger.info(`Transaction ${transactionId} refunded for user ${userId}`);

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

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoiceFailed(event.data.object);
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

      // Store payment method info
      if (paymentIntent.payment_method) {
        try {
          const pm = await stripeService.getPaymentMethod(paymentIntent.payment_method);
          transaction.paymentMethod = {
            type: pm.type,
            last4: pm.card?.last4,
            brand: pm.card?.brand
          };
          await transaction.save();
        } catch (err) {
          logger.warn('Could not retrieve payment method details:', err.message);
        }
      }

      // Notify course service to grant access
      if (transaction.course) {
        try {
          const courseServiceUrl = config.services.courseServiceUrl || process.env.COURSE_SERVICE_URL;
          await axios.post(
            `${courseServiceUrl}/api/v1/enrollments/service/enroll`,
            {
              courseId: transaction.course.toString(),
              paymentId: transaction._id.toString(),
              userId: transaction.user.toString()
            },
            {
              headers: {
                'X-Service-Auth': config.serviceSecret || process.env.SERVICE_SECRET
              }
            }
          );
          logger.info(`Enrollment created for user ${transaction.user} in course ${transaction.course}`);
        } catch (error) {
          logger.error('Failed to create enrollment:', error.message);
        }
      }
    }
  }

  async handlePaymentFailed(paymentIntent) {
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (transaction) {
      await transaction.markFailed(paymentIntent.last_payment_error?.message || 'Payment failed');
      logger.info(`Payment failed for transaction ${transaction._id}`);
    }
  }

  async handleSubscriptionCreated(stripeSubscription) {
    logger.info(`Subscription created in Stripe: ${stripeSubscription.id}`);
    // The subscription is already created in our DB during createSubscription()
    // This handler is for subscriptions created directly in Stripe dashboard
    const existing = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (!existing && stripeSubscription.metadata?.userId) {
      const sub = new Subscription({
        user: stripeSubscription.metadata.userId,
        plan: stripeSubscription.metadata.plan || 'basic',
        billingCycle: stripeSubscription.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
        price: (stripeSubscription.items.data[0]?.plan?.amount || 0) / 100,
        currency: (stripeSubscription.currency || 'EUR').toUpperCase(),
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        status: stripeSubscription.status
      });
      await sub.save();
      logger.info(`Subscription synced from Stripe: ${sub._id}`);
    }
  }

  async handleSubscriptionUpdated(stripeSubscription) {
    const sub = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (sub) {
      sub.status = stripeSubscription.status;
      sub.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      sub.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      sub.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

      // Update plan if it changed (via Stripe dashboard)
      if (stripeSubscription.items?.data[0]?.plan) {
        const interval = stripeSubscription.items.data[0].plan.interval;
        sub.billingCycle = interval === 'year' ? 'yearly' : 'monthly';
        sub.price = (stripeSubscription.items.data[0].plan.amount || 0) / 100;
      }

      await sub.save();
      logger.info(`Subscription updated: ${sub._id}`);
    }
  }

  async handleSubscriptionDeleted(stripeSubscription) {
    const sub = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (sub) {
      sub.status = 'expired';
      await sub.save();
      logger.info(`Subscription expired: ${sub._id}`);
    }
  }

  async handleChargeRefunded(charge) {
    // Find transaction by stripe charge ID or payment intent
    const transaction = await Transaction.findOne({
      $or: [
        { stripeChargeId: charge.id },
        { stripePaymentIntentId: charge.payment_intent }
      ]
    });

    if (transaction && transaction.status !== 'refunded') {
      await transaction.refund('Refunded via Stripe');

      // Revoke course access
      if (transaction.course) {
        try {
          const courseServiceUrl = config.services.courseServiceUrl || process.env.COURSE_SERVICE_URL;
          await axios.delete(
            `${courseServiceUrl}/api/v1/enrollments/service/${transaction.course}/revoke`,
            {
              headers: {
                'X-Service-Auth': config.serviceSecret || process.env.SERVICE_SECRET,
                'X-User-Id': transaction.user.toString()
              }
            }
          );
        } catch (error) {
          logger.error('Failed to revoke course access on charge refund:', error.message);
        }
      }

      logger.info(`Charge refunded: transaction ${transaction._id}`);
    }
  }

  async handleInvoicePaid(invoice) {
    // Handle subscription renewal payments
    if (invoice.subscription) {
      const sub = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (sub) {
        sub.status = 'active';
        await sub.save();

        // Create transaction record for renewal
        const transaction = new Transaction({
          user: sub.user,
          type: 'subscription',
          amount: invoice.amount_paid / 100,
          currency: (invoice.currency || 'EUR').toUpperCase(),
          status: 'completed',
          completedAt: new Date(),
          subscription: sub._id,
          stripePaymentIntentId: invoice.payment_intent
        });
        await transaction.save();

        logger.info(`Invoice paid for subscription ${sub._id}, transaction ${transaction._id}`);
      }
    }
  }

  async handleInvoiceFailed(invoice) {
    if (invoice.subscription) {
      const sub = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (sub) {
        sub.status = 'past_due';
        await sub.save();
        logger.info(`Invoice failed for subscription ${sub._id}, marked as past_due`);
      }
    }
  }
}

module.exports = new PaymentController();
