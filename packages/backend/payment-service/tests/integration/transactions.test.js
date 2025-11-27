const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Transaction, Subscription } = require('../../src/models');
const { generateTestToken } = require('../helpers/testData');

describe('Transaction and Entitlement Management', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

  beforeEach(async () => {
    await Transaction.deleteMany({});
    await Subscription.deleteMany({});
    
    userId = new mongoose.Types.ObjectId();
    authToken = generateTestToken(userId, 'user@test.com', 'learner');
    
    adminId = new mongoose.Types.ObjectId();
    adminToken = generateTestToken(adminId, 'admin@test.com', 'admin');
  });

  describe('GET /api/v1/payments/transactions - Get Transactions', () => {
    it('should return user transactions', async () => {
      // Create test transactions
      await Transaction.create([
        {
          user: userId,
          type: 'course_purchase',
          course: new mongoose.Types.ObjectId(),
          amount: 49.99,
          currency: 'EUR',
          status: 'completed'
        },
        {
          user: userId,
          type: 'course_purchase',
          course: new mongoose.Types.ObjectId(),
          amount: 29.99,
          currency: 'EUR',
          status: 'pending'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/payments/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should filter transactions by status', async () => {
      // Create transactions with different statuses
      await Transaction.create([
        {
          user: userId,
          type: 'course_purchase',
          course: new mongoose.Types.ObjectId(),
          amount: 49.99,
          currency: 'EUR',
          status: 'completed'
        },
        {
          user: userId,
          type: 'course_purchase',
          course: new mongoose.Types.ObjectId(),
          amount: 29.99,
          currency: 'EUR',
          status: 'pending'
        },
        {
          user: userId,
          type: 'course_purchase',
          course: new mongoose.Types.ObjectId(),
          amount: 39.99,
          currency: 'EUR',
          status: 'completed'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/payments/transactions?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(t => t.status === 'completed')).toBe(true);
    });

    it('should paginate transactions', async () => {
      // Create 15 transactions
      const transactions = Array.from({ length: 15 }, (_, i) => ({
        user: userId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 10 + i,
        currency: 'EUR',
        status: 'completed'
      }));
      
      await Transaction.create(transactions);

      const response = await request(app)
        .get('/api/v1/payments/transactions?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.currentPage).toBe('2');
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should return empty array if no transactions', async () => {
      const response = await request(app)
        .get('/api/v1/payments/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/payments/transactions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/payments/user/:userId/entitlements - Get Entitlements', () => {
    it('should return user entitlements including subscription and courses', async () => {
      // Create subscription
      await Subscription.create({
        user: userId,
        plan: 'pro',
        status: 'active',
        billingCycle: 'monthly',
        price: 19.99,
        currency: 'EUR',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Create completed course purchases
      const courseId1 = new mongoose.Types.ObjectId();
      const courseId2 = new mongoose.Types.ObjectId();
      
      await Transaction.create([
        {
          user: userId,
          type: 'course_purchase',
          course: courseId1,
          amount: 49.99,
          currency: 'EUR',
          status: 'completed',
          completedAt: new Date()
        },
        {
          user: userId,
          type: 'course_purchase',
          course: courseId2,
          amount: 39.99,
          currency: 'EUR',
          status: 'completed',
          completedAt: new Date()
        }
      ]);

      const response = await request(app)
        .get(`/api/v1/payments/user/${userId}/entitlements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription).toBeDefined();
      expect(response.body.data.subscription.plan).toBe('pro');
      expect(response.body.data.purchasedCourses).toHaveLength(2);
      expect(response.body.data.hasActiveSubscription).toBe(true);
    });

    it('should return entitlements without subscription', async () => {
      const courseId = new mongoose.Types.ObjectId();
      
      await Transaction.create({
        user: userId,
        type: 'course_purchase',
        course: courseId,
        amount: 49.99,
        currency: 'EUR',
        status: 'completed',
        completedAt: new Date()
      });

      const response = await request(app)
        .get(`/api/v1/payments/user/${userId}/entitlements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription).toBeNull();
      expect(response.body.data.purchasedCourses).toHaveLength(1);
      expect(response.body.data.hasActiveSubscription).toBe(false);
    });

    it('should allow admin to view any user entitlements', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      
      await Transaction.create({
        user: otherUserId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'completed',
        completedAt: new Date()
      });

      const response = await request(app)
        .get(`/api/v1/payments/user/${otherUserId}/entitlements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.purchasedCourses).toHaveLength(1);
    });

    it('should forbid users from viewing other users entitlements', async () => {
      const otherUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/payments/user/${otherUserId}/entitlements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/unauthorized/i);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/user/${userId}/entitlements`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/payments/transactions/:transactionId/refund - Refund Transaction', () => {
    it('should refund a completed transaction', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'completed',
        stripePaymentIntentId: 'pi_test123',
        completedAt: new Date()
      });

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${transaction._id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Course not as expected'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/refund/i);
    });

    it('should allow admin to refund any transaction', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'completed',
        stripePaymentIntentId: 'pi_test456',
        completedAt: new Date()
      });

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${transaction._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Customer complaint'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should forbid refunding other users transactions', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const transaction = await Transaction.create({
        user: otherUserId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'completed',
        stripePaymentIntentId: 'pi_test789',
        completedAt: new Date()
      });

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${transaction._id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Unauthorized attempt'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/unauthorized/i);
    });

    it('should reject refunding non-completed transactions', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'pending'
      });

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${transaction._id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Changed my mind'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/only completed/i);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${fakeId}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Test'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/not found/i);
    });

    it('should require authentication', async () => {
      const transaction = await Transaction.create({
        user: userId,
        type: 'course_purchase',
        course: new mongoose.Types.ObjectId(),
        amount: 49.99,
        currency: 'EUR',
        status: 'completed'
      });

      const response = await request(app)
        .post(`/api/v1/payments/transactions/${transaction._id}/refund`)
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
