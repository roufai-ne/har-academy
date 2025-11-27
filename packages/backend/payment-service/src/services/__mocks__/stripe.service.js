// Mock Stripe service for testing
const stripeService = {
  createPaymentIntent: jest.fn((amount, currency, metadata) => {
    return Promise.resolve({
      id: `pi_test_${Date.now()}`,
      client_secret: `pi_test_${Date.now()}_secret`,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      status: 'requires_payment_method'
    });
  }),

  getPaymentIntent: jest.fn((paymentIntentId) => {
    return Promise.resolve({
      id: paymentIntentId,
      status: 'succeeded',
      amount: 4999,
      currency: 'eur'
    });
  }),

  confirmPaymentIntent: jest.fn((paymentIntentId, paymentMethodId) => {
    return Promise.resolve({
      id: paymentIntentId,
      status: 'succeeded',
      payment_method: paymentMethodId
    });
  }),

  createCustomer: jest.fn((email, name, metadata) => {
    return Promise.resolve({
      id: `cus_test_${Date.now()}`,
      email,
      name,
      metadata
    });
  }),

  getOrCreateCustomer: jest.fn((userId, email, name) => {
    return Promise.resolve({
      id: `cus_test_${userId}`,
      email,
      name
    });
  }),

  createSubscription: jest.fn((customerId, priceId, metadata) => {
    const now = Math.floor(Date.now() / 1000);
    return Promise.resolve({
      id: `sub_test_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_start: now,
      current_period_end: now + 30 * 24 * 60 * 60,
      latest_invoice: {
        payment_intent: {
          client_secret: `pi_test_${Date.now()}_secret`
        }
      },
      metadata
    });
  }),

  cancelSubscription: jest.fn((subscriptionId, atPeriodEnd = true) => {
    return Promise.resolve({
      id: subscriptionId,
      status: atPeriodEnd ? 'active' : 'canceled',
      cancel_at_period_end: atPeriodEnd
    });
  }),

  createRefund: jest.fn((paymentIntentId, reason) => {
    return Promise.resolve({
      id: `re_test_${Date.now()}`,
      payment_intent: paymentIntentId,
      amount: 4999,
      status: 'succeeded',
      reason
    });
  }),

  constructEvent: jest.fn((payload, signature, webhookSecret) => {
    // Return mock event
    return {
      id: `evt_test_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test123',
          status: 'succeeded'
        }
      }
    };
  })
};

module.exports = stripeService;
