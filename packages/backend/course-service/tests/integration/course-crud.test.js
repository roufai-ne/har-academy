const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { generateValidCourseData, generateCourseForDB } = require('../helpers/testData');

describe('Course CRUD Integration Tests', () => {
  let mongoServer;
  let instructorToken, studentToken, adminToken;
  let instructorId, studentId, adminId;
  let courseId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Generate test tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    instructorId = new mongoose.Types.ObjectId().toString();
    studentId = new mongoose.Types.ObjectId().toString();
    adminId = new mongoose.Types.ObjectId().toString();

    instructorToken = jwt.sign(
      { user_id: instructorId, email: 'instructor@test.com', role: 'instructor' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      { user_id: studentId, email: 'student@test.com', role: 'learner' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { user_id: adminId, email: 'admin@test.com', role: 'admin' },
      jwtSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /api/v1/courses', () => {
    it('should create course as instructor', async () => {
      const courseData = generateValidCourseData();

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(courseData.title);
    });

    it('should create course as admin', async () => {
      const courseData = generateValidCourseData();

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject course without title', async () => {
      const courseData = generateValidCourseData({ title: undefined });

      await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(400);
    });

    it('should reject course without token', async () => {
      const courseData = generateValidCourseData();

      await request(app)
        .post('/api/v1/courses')
        .send(courseData)
        .expect(401);
    });

    it('should reject course creation from student', async () => {
      const courseData = generateValidCourseData();

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(courseData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/courses', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      await Course.create([
        generateCourseForDB(instructorId, {
          title: 'Python Basics',
          slug: 'python-basics-1',
          domain: 'Python',
          level: 'Beginner'
        }),
        generateCourseForDB(instructorId, {
          title: 'Excel Advanced',
          slug: 'excel-advanced-1',
          domain: 'Excel',
          level: 'Advanced'
        }),
        generateCourseForDB(instructorId, {
          title: 'R Programming',
          slug: 'r-programming-1',
          domain: 'R',
          level: 'Intermediate',
          status: 'draft'
        })
      ]);
    });

    it('should list published courses', async () => {
      const response = await request(app)
        .get('/api/v1/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(2); // Only published
    });

    it('should filter courses by domain', async () => {
      const response = await request(app)
        .get('/api/v1/courses?domain=Python')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(1);
      expect(response.body.data.courses[0].domain).toBe('Python');
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;
    });

    it('should get course by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${courseId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(courseId.toString());
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/courses/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;
    });

    it('should update course as owner', async () => {
      const response = await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should reject update from student', async () => {
      await request(app)
        .put(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;
    });

    it('should delete course as owner', async () => {
      const response = await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject deletion from student', async () => {
      await request(app)
        .delete(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/courses/:id/publish', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`,
        status: 'draft',
        total_lessons: 5 // Needs lessons to publish
      }));
      courseId = course._id;
    });

    it('should publish course as owner', async () => {
      const response = await request(app)
        .post(`/api/v1/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
    });

    it('should reject publish from student', async () => {
      await request(app)
        .post(`/api/v1/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });
});
