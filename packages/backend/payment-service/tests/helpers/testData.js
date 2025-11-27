const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate test JWT token
function generateTestToken(userId, email = 'test@example.com', role = 'learner') {
  return jwt.sign(
    {
      user_id: userId || new mongoose.Types.ObjectId().toString(),
      email,
      role
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

// Sample transaction data
const sampleTransaction = {
  user: new mongoose.Types.ObjectId(),
  type: 'course_purchase',
  amount: 49.99,
  currency: 'EUR',
  status: 'completed',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa'
  }
};

// Sample subscription data
const sampleSubscription = {
  user: new mongoose.Types.ObjectId(),
  plan: 'pro',
  status: 'active',
  billingCycle: 'monthly',
  price: 29.99,
  currency: 'EUR',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  autoRenew: true
};

// Sample course purchase request
const samplePurchaseRequest = {
  courseId: new mongoose.Types.ObjectId().toString(),
  amount: 49.99,
  currency: 'EUR'
};

// Sample subscription request
const sampleSubscriptionRequest = {
  plan: 'pro',
  billingCycle: 'monthly'
};

module.exports = {
  generateTestToken,
  sampleTransaction,
  sampleSubscription,
  samplePurchaseRequest,
  sampleSubscriptionRequest
};
