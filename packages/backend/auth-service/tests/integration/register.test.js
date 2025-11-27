const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/user');

describe('POST /api/v1/auth/register', () => {
  let mongoServer;

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

  afterEach(async () => {
    // Clean up database after each test
    await User.deleteMany({});
  });

  describe('Success Cases', () => {
    it('should register a new learner successfully', async () => {
      const userData = {
        email: 'learner@test.com',
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe',
        role: 'learner'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('learner');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should register a new instructor successfully', async () => {
      const userData = {
        email: 'instructor@test.com',
        password: 'Password123!',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'instructor'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('instructor');
      expect(response.body.data.user.instructor_info).toBeDefined();
    });

    it('should default to learner role if not specified', async () => {
      const userData = {
        email: 'default@test.com',
        password: 'Password123!',
        first_name: 'Default',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.role).toBe('learner');
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'secure@test.com',
        password: 'Password123!',
        first_name: 'Secure',
        last_name: 'User'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(userData.password);
      expect(user.password_hash.length).toBeGreaterThan(50); // bcrypt hash length
    });
  });

  describe('Validation Errors', () => {
    it('should reject registration with missing email', async () => {
      const userData = {
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/email/i);
    });

    it('should reject registration with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/email/i);
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'weak',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/password/i);
    });

    it('should reject registration with missing first_name', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'Password123!',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with missing last_name', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'Password123!',
        first_name: 'John'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Duplicate Email', () => {
    it('should reject registration with existing email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'Password123!',
        first_name: 'First',
        last_name: 'User'
      };

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/already exists|duplicate/i);
    });
  });

  describe('JWT Token', () => {
    it('should return valid JWT token', async () => {
      const userData = {
        email: 'jwt@test.com',
        password: 'Password123!',
        first_name: 'JWT',
        last_name: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
  });
});
