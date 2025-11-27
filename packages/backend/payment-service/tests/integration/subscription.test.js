const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Subscription } = require('../../src/models');
const { generateTestToken } = require('../helpers/testData');

// Mock Stripe service
jest.mock('../../src/services/stripe.service');

describe('Subscription Management', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await Subscription.deleteMany({});
    userId = new mongoose.Types.ObjectId();
    authToken = generateTestToken(userId, 'subscriber@test.com', 'learner');
  });

  describe('POST /api/v1/payments/subscriptions - Create Subscription', () => {
    describe('Success Cases', () => {
      it('should create a basic subscription', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'basic',
            billingCycle: 'monthly'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.subscription).toBeDefined();
        expect(response.body.data.subscription.plan).toBe('basic');
        expect(response.body.data.subscription.billingCycle).toBe('monthly');
        expect(response.body.data.subscription.status).toBe('active');
      });

      it('should create a pro subscription', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'pro',
            billingCycle: 'yearly'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.subscription.plan).toBe('pro');
        expect(response.body.data.subscription.billingCycle).toBe('yearly');
      });

      it('should default to monthly billing cycle', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'pro'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.subscription.billingCycle).toBe('monthly');
      });
    });

    describe('Validation Errors', () => {
      it('should reject subscription without plan', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            billingCycle: 'monthly'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/plan/i);
      });

      it('should reject invalid plan', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'invalid-plan',
            billingCycle: 'monthly'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/plan|valid/i);
      });

      it('should reject invalid billing cycle', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'pro',
            billingCycle: 'weekly'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/billingCycle|valid/i);
      });

      it('should reject if user already has active subscription', async () => {
        // Create existing subscription
        await Subscription.create({
          user: userId,
          plan: 'basic',
          status: 'active',
          billingCycle: 'monthly',
          price: 9.99,
          currency: 'EUR',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            plan: 'pro',
            billingCycle: 'monthly'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/already has|active subscription/i);
      });
    });

    describe('Authentication', () => {
      it('should reject without authentication', async () => {
        const response = await request(app)
          .post('/api/v1/payments/subscriptions')
          .send({
            plan: 'pro',
            billingCycle: 'monthly'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('GET /api/v1/payments/subscription - Get Subscription', () => {
    it('should return user subscription', async () => {
      // Create subscription
      const subscription = await Subscription.create({
        user: userId,
        plan: 'pro',
        status: 'active',
        billingCycle: 'monthly',
        price: 19.99,
        currency: 'EUR',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .get('/api/v1/payments/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.plan).toBe('pro');
      expect(response.body.data.status).toBe('active');
    });

    it('should return 404 if no subscription exists', async () => {
      const response = await request(app)
        .get('/api/v1/payments/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/no subscription|not found/i);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/payments/subscription')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/payments/subscription/cancel - Cancel Subscription', () => {
    it('should cancel active subscription', async () => {
      // Create active subscription
      await Subscription.create({
        user: userId,
        plan: 'pro',
        status: 'active',
        billingCycle: 'monthly',
        price: 19.99,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_test123',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/v1/payments/subscription/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Too expensive'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/cancelled|end of billing period/i);
    });

    it('should accept cancellation without reason', async () => {
      // Create active subscription
      await Subscription.create({
        user: userId,
        plan: 'basic',
        status: 'active',
        billingCycle: 'monthly',
        price: 9.99,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_test456',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/v1/payments/subscription/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if no active subscription', async () => {
      const response = await request(app)
        .post('/api/v1/payments/subscription/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'No longer needed'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/no active subscription/i);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payments/subscription/cancel')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
