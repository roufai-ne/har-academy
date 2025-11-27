const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Transaction } = require('../../src/models');
const { generateTestToken } = require('../helpers/testData');

// Mock Stripe service
jest.mock('../../src/services/stripe.service');

describe('POST /api/v1/payments/purchase - Course Purchase', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await Transaction.deleteMany({});
    userId = new mongoose.Types.ObjectId();
    authToken = generateTestToken(userId, 'buyer@test.com', 'learner');
  });

  describe('Success Cases', () => {
    it('should create a course purchase with valid data', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId,
          amount: 49.99,
          currency: 'EUR'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('clientSecret');
      
      // Verify transaction was created
      const transaction = await Transaction.findById(response.body.data.transactionId);
      expect(transaction).toBeDefined();
      expect(transaction.user.toString()).toBe(userId.toString());
      expect(transaction.course.toString()).toBe(courseId);
      expect(transaction.amount).toBe(49.99);
      expect(transaction.type).toBe('course_purchase');
    });

    it('should default to EUR currency if not provided', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId,
          amount: 29.99
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      
      const transaction = await Transaction.findById(response.body.data.transactionId);
      expect(transaction.currency).toBe('EUR');
    });
  });

  describe('Validation Errors', () => {
    it('should reject purchase without courseId', async () => {
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 49.99
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/courseId/i);
    });

    it('should reject purchase without amount', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/amount/i);
    });

    it('should reject purchase with negative amount', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId,
          amount: -10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/positive|greater/i);
    });
  });

  describe('Authentication', () => {
    it('should reject purchase without authentication', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .send({
          courseId,
          amount: 49.99
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject purchase with invalid token', async () => {
      const courseId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post('/api/v1/payments/purchase')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          courseId,
          amount: 49.99
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
