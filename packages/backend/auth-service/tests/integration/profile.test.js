const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/user');
const jwt = require('jsonwebtoken');

describe('Profile Management Integration Tests', () => {
  let mongoServer;
  let authToken;
  const testPassword = 'Test1234!';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create a test user and get auth token
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'profile@test.com',
        password: testPassword,
        first_name: 'Profile',
        last_name: 'User',
        role: 'learner'
      });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'profile@test.com',
        password: testPassword
      });

    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/v1/auth/me', () => {
    describe('Success Cases', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('profile@test.com');
        expect(response.body.data.user).not.toHaveProperty('password_hash');
      });

      it('should include user preferences', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.user).toHaveProperty('preferences');
        expect(response.body.data.user.preferences).toHaveProperty('language');
      });

      it('should include instructor info for instructor role', async () => {
        // Register instructor
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: 'instructor@test.com',
            password: testPassword,
            first_name: 'Instructor',
            last_name: 'User',
            role: 'instructor'
          });

        // Login
        const loginResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'instructor@test.com', password: testPassword });

        const instructorToken = loginResponse.body.data.token;

        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${instructorToken}`)
          .expect(200);

        expect(response.body.data.user).toHaveProperty('instructor_info');
      });
    });

    describe('Authentication Errors', () => {
      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/token|authorization/i);
      });

      it('should reject request with invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid.token.here')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject request with malformed authorization header', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', authToken) // Missing "Bearer " prefix
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject request with expired token', async () => {
        const expiredToken = jwt.sign(
          { userId: 'test123', email: 'test@test.com', role: 'learner' },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '0s' }
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/expired|invalid/i);
      });
    });

    describe('User Not Found', () => {
      it('should return 401 if user no longer exists (security: prevents user enumeration)', async () => {
        // Delete the user after getting token
        await User.deleteOne({ email: 'profile@test.com' });

        const validToken = jwt.sign(
          { userId: new mongoose.Types.ObjectId().toString(), email: 'profile@test.com', role: 'learner' },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/invalid token|user deactivated/i);
      });
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    let updateAuthToken;

    beforeEach(async () => {
      await User.deleteMany({});

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'update@test.com',
          password: testPassword,
          first_name: 'Update',
          last_name: 'Test',
          role: 'learner'
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'update@test.com',
          password: testPassword
        });

      updateAuthToken = loginResponse.body.data.token;
    });

    describe('Success Cases', () => {
      it('should update first_name successfully', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ first_name: 'Updated' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.first_name).toBe('Updated');
      });

      it('should update last_name successfully', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ last_name: 'NewLastName' })
          .expect(200);

        expect(response.body.data.user.last_name).toBe('NewLastName');
      });

      it('should update avatar_url successfully', async () => {
        const avatarUrl = 'https://example.com/avatar.jpg';

        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ avatar_url: avatarUrl })
          .expect(200);

        expect(response.body.data.user.avatar_url).toBe(avatarUrl);
      });

      it('should update language preference', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ language: 'en' })
          .expect(200);

        expect(response.body.data.user.preferences.language).toBe('en');
      });

      it('should update multiple fields at once', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({
            first_name: 'Multi',
            last_name: 'Update',
            language: 'en'
          })
          .expect(200);

        expect(response.body.data.user.first_name).toBe('Multi');
        expect(response.body.data.user.last_name).toBe('Update');
        expect(response.body.data.user.preferences.language).toBe('en');
      });
    });

    describe('Validation Errors', () => {
      it('should reject update with invalid email format', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ email: 'invalid-email' })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should ignore attempt to change email', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ email: 'newemail@test.com', first_name: 'Updated' });

        // Either ignore email change (200) or reject it (400)
        if (response.status === 200) {
          expect(response.body.data.user.email).toBe('update@test.com');
        } else {
          expect(response.status).toBe(400);
        }
      });

      it('should ignore attempt to change role', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${updateAuthToken}`)
          .send({ role: 'instructor', first_name: 'Updated' });

        if (response.status === 200) {
          expect(response.body.data.user.role).toBe('learner');
        } else {
          expect(response.status).toBe(400);
        }
      });
    });

    describe('Authentication Required', () => {
      it('should reject update without token', async () => {
        const response = await request(app)
          .put('/api/v1/auth/profile')
          .send({ first_name: 'Updated' })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
