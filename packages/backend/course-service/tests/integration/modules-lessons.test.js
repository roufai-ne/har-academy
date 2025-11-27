const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { generateCourseForDB, generateModuleData, generateLessonData } = require('../helpers/testData');

describe('Modules & Lessons Integration Tests', () => {
  let mongoServer;
  let instructorToken, studentToken;
  let instructorId, studentId;
  let courseId, moduleId, lessonId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    instructorId = new mongoose.Types.ObjectId().toString();
    studentId = new mongoose.Types.ObjectId().toString();

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

  describe('POST /api/v1/courses/:id/modules', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;
    });

    it('should create module in course as owner', async () => {
      const moduleData = {
        title: 'Module 1: Introduction',
        description: 'This is an introduction module with comprehensive content',
        order: 1
      };

      const response = await request(app)
        .post(`/api/v1/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(moduleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(moduleData.title);
    });

    it('should reject module creation from student', async () => {
      const moduleData = {
        title: 'Module 1: Introduction',
        description: 'This is an introduction module with comprehensive content',
        order: 1
      };

      await request(app)
        .post(`/api/v1/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(moduleData)
        .expect(403);
    });
  });

  describe('PUT /api/v1/courses/:id/modules/:module_id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;
    });

    it('should update module as owner', async () => {
      const response = await request(app)
        .put(`/api/v1/courses/${courseId}/modules/${moduleId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ title: 'Updated Module Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Module Title');
    });

    it('should reject update from student', async () => {
      await request(app)
        .put(`/api/v1/courses/${courseId}/modules/${moduleId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated Module Title' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/courses/:id/modules/:module_id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;
    });

    it('should delete module as owner', async () => {
      const response = await request(app)
        .delete(`/api/v1/courses/${courseId}/modules/${moduleId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject deletion from student', async () => {
      await request(app)
        .delete(`/api/v1/courses/${courseId}/modules/${moduleId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/courses/:id/modules/:module_id/lessons', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;
    });

    it('should create lesson in module as owner', async () => {
      const lessonData = {
        title: 'Lesson 1: Getting Started',
        description: 'Learn the basics in this introductory lesson',
        content: 'This is the lesson content with detailed explanations',
        type: 'video',
        order: 1
      };

      const response = await request(app)
        .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(lessonData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(lessonData.title);
    });

    it('should reject lesson creation from student', async () => {
      const lessonData = {
        title: 'Lesson 1: Getting Started',
        description: 'Learn the basics in this introductory lesson',
        content: 'This is the lesson content with detailed explanations',
        type: 'video',
        order: 1
      };

      await request(app)
        .post(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(lessonData)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/courses/:id/modules/:module_id/lessons/:lesson_id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      const Lesson = require('../../src/models/lesson.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;

      const lesson = await Lesson.create(generateLessonData(moduleId));
      lessonId = lesson._id;
    });

    it('should update lesson as owner', async () => {
      const response = await request(app)
        .patch(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ title: 'Updated Lesson Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Lesson Title');
    });

    it('should reject update from student', async () => {
      await request(app)
        .patch(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated Lesson Title' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/courses/:id/modules/:module_id/lessons/:lesson_id', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      const Lesson = require('../../src/models/lesson.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;

      const lesson = await Lesson.create(generateLessonData(moduleId));
      lessonId = lesson._id;
    });

    it('should delete lesson as owner', async () => {
      const response = await request(app)
        .delete(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject deletion from student', async () => {
      await request(app)
        .delete(`/api/v1/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/courses/:id/lessons', () => {
    beforeEach(async () => {
      const Course = require('../../src/models/course.model');
      const Module = require('../../src/models/module.model');
      const Lesson = require('../../src/models/lesson.model');
      
      const course = await Course.create(generateCourseForDB(instructorId, {
        slug: `test-course-${Date.now()}`
      }));
      courseId = course._id;

      const module = await Module.create(generateModuleData(courseId));
      moduleId = module._id;

      await Lesson.create([
        generateLessonData(moduleId, { title: 'Lesson 1', order: 1 }),
        generateLessonData(moduleId, { title: 'Lesson 2', order: 2 })
      ]);
    });

    it('should list all modules with their lessons', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${courseId}/lessons`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('modules');
    });
  });
});
