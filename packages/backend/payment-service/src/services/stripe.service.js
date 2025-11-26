const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class StripeService {
  // Create payment intent for course purchase
  async createPaymentIntent(amount, currency, metadata) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Retrieve payment intent
  async getPaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error(`Failed to retrieve payment intent ${paymentIntentId}:`, error);
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      return await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });
    } catch (error) {
      logger.error(`Failed to confirm payment intent ${paymentIntentId}:`, error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Create customer
  async createCustomer(email, name, metadata) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });

      logger.info(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Stripe customer creation failed:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  // Get or create customer
  async getOrCreateCustomer(userId, email, name) {
    try {
      // Search for existing customer
      const customers = await stripe.customers.list({
        email,
        limit: 1
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      // Create new customer
      return await this.createCustomer(email, name, { userId });
    } catch (error) {
      logger.error('Failed to get or create customer:', error);
      throw new Error(`Customer operation failed: ${error.message}`);
    }
  }

  // Create subscription
  async createSubscription(customerId, priceId, metadata) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      logger.info(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Stripe subscription creation failed:', error);
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  }

  // Get subscription
  async getSubscription(subscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      logger.error(`Failed to retrieve subscription ${subscriptionId}:`, error);
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      if (cancelAtPeriodEnd) {
        return await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      } else {
        return await stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw new Error(`Subscription cancellation failed: ${error.message}`);
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId) {
    try {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
    } catch (error) {
      logger.error(`Failed to reactivate subscription ${subscriptionId}:`, error);
      throw new Error(`Subscription reactivation failed: ${error.message}`);
    }
  }

  // Create refund
  async refundPayment(paymentIntentId, reason) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer'
      });

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error(`Failed to create refund for ${paymentIntentId}:`, error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  // Get payment method
  async getPaymentMethod(paymentMethodId) {
    try {
      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      logger.error(`Failed to retrieve payment method ${paymentMethodId}:`, error);
      throw new Error(`Failed to retrieve payment method: ${error.message}`);
    }
  }

  // Construct webhook event
  constructWebhookEvent(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw new Error('Webhook signature verification failed');
    }
  }
}

module.exports = new StripeService();