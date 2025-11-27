const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/user');

describe('POST /api/v1/auth/login', () => {
  let mongoServer;
  let testUser;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a test user before each test
    testUser = new User({
      email: 'test@example.com',
      password_hash: testPassword, // Will be hashed by pre-save hook
      first_name: 'Test',
      last_name: 'User',
      role: 'learner'
    });
    await testUser.save();
  });

  afterEach(async () => {
    // Clean up database after each test
    await User.deleteMany({});
  });

  describe('Success Cases', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return valid JWT token on successful login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        })
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should include user role in response', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        })
        .expect(200);

      expect(response.body.data.user.role).toBe('learner');
    });

    it('should update last_login_at timestamp', async () => {
      const beforeLogin = new Date();

      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        })
        .expect(200);

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.last_login_at).toBeDefined();
      expect(new Date(user.last_login_at).getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('Validation Errors', () => {
    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: testPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/email/i);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/password/i);
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: testPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication Errors', () => {
    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/invalid credentials|email or password/i);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/invalid credentials|email or password/i);
    });

    it('should not reveal whether email exists in error message', async () => {
      // Security best practice: same error for both non-existent email and wrong password
      const response1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        });

      const response2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response1.body.error.message).toBe(response2.body.error.message);
    });
  });

  describe('Account Status', () => {
    it('should reject login for suspended user', async () => {
      // Register user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'suspended@example.com',
          password: testPassword,
          first_name: 'Suspended',
          last_name: 'User'
        });

      // Update user status to suspended
      const suspendedUser = await User.findOne({ email: 'suspended@example.com' });
      suspendedUser.status = 'suspended';
      await suspendedUser.save();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'suspended@example.com',
          password: testPassword
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/suspended|deactivate|account/i);
    });

    it('should allow login for active user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: testPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Case Insensitivity', () => {
    it('should login with case-insensitive email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: testPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com'); // Stored in lowercase
    });
  });
});
