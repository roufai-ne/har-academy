const mongoose = require('mongoose');
const {
  connect,
  clearDatabase,
  closeDatabase,
  testUsers,
  generateCourseData
} = require('../utils/test-setup');
const TestClient = require('../utils/test-client');
const { Course, Enrollment } = require('../../src/models');

describe('Enrollment Controller', () => {
  let studentClient;
  let course;

  beforeAll(async () => {
    await connect();
    studentClient = new TestClient(testUsers.student);
  });

  beforeEach(async () => {
    course = await Course.create(generateCourseData({
      isPublished: true
    }));
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/enrollments', () => {
    it('should create a new enrollment', async () => {
      const enrollmentData = {
        courseId: course._id,
        paymentId: 'test-payment-id'
      };

      const response = await studentClient.post('/api/v1/enrollments', enrollmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student.toString()).toBe(testUsers.student.id.toString());
      expect(response.body.data.course.toString()).toBe(course._id.toString());
    });

    it('should prevent duplicate enrollments', async () => {
      const enrollmentData = {
        courseId: course._id,
        paymentId: 'test-payment-id'
      };

      await studentClient.post('/api/v1/enrollments', enrollmentData);
      const response = await studentClient.post('/api/v1/enrollments', enrollmentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await studentClient.post('/api/v1/enrollments', {});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('GET /api/v1/enrollments/my', () => {
    beforeEach(async () => {
      await Enrollment.create([
        {
          student: testUsers.student.id,
          course: course._id,
          paymentId: 'payment-1'
        },
        {
          student: testUsers.student.id,
          course: new mongoose.Types.ObjectId(),
          paymentId: 'payment-2'
        }
      ]);
    });

    it('should return student\'s enrollments', async () => {
      const response = await studentClient.get('/api/v1/enrollments/my');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(
        enrollment => enrollment.student.toString() === testUsers.student.id.toString()
      )).toBe(true);
    });
  });

  describe('GET /api/v1/enrollments/:id', () => {
    let enrollment;

    beforeEach(async () => {
      enrollment = await Enrollment.create({
        student: testUsers.student.id,
        course: course._id,
        paymentId: 'test-payment'
      });
    });

    it('should return enrollment details', async () => {
      const response = await studentClient.get(`/api/v1/enrollments/${enrollment._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(enrollment._id.toString());
    });

    it('should not allow access to other student\'s enrollment', async () => {
      const otherStudent = new TestClient({
        ...testUsers.student,
        id: new mongoose.Types.ObjectId()
      });

      const response = await otherStudent.get(`/api/v1/enrollments/${enrollment._id}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/enrollments/:id/progress', () => {
    let enrollment;

    beforeEach(async () => {
      const courseWithModules = await Course.create({
        ...generateCourseData(),
        modules: [{
          title: 'Test Module',
          description: 'Test Description',
          lessons: [{
            title: 'Test Lesson',
            description: 'Test Description',
            content: 'Test Content',
            duration: 30
          }]
        }]
      });

      enrollment = await Enrollment.create({
        student: testUsers.student.id,
        course: courseWithModules._id,
        paymentId: 'test-payment',
        modulesProgress: [{
          moduleId: courseWithModules.modules[0]._id,
          lessonsProgress: [{
            lessonId: courseWithModules.modules[0].lessons[0]._id,
            completed: false
          }],
          completedLessons: 0,
          totalLessons: 1
        }]
      });
    });

    it('should update lesson progress', async () => {
      const progressData = {
        moduleId: enrollment.modulesProgress[0].moduleId,
        lessonId: enrollment.modulesProgress[0].lessonsProgress[0].lessonId,
        completed: true,
        timeSpent: 1800
      };

      const response = await studentClient.put(
        `/api/v1/enrollments/${enrollment._id}/progress`,
        progressData
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modulesProgress[0].completedLessons).toBe(1);
    });

    it('should not allow updating other student\'s progress', async () => {
      const otherStudent = new TestClient({
        ...testUsers.student,
        id: new mongoose.Types.ObjectId()
      });

      const response = await otherStudent.put(
        `/api/v1/enrollments/${enrollment._id}/progress`,
        { completed: true }
      );

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/enrollments/:id/certificate', () => {
    let enrollment;

    beforeEach(async () => {
      enrollment = await Enrollment.create({
        student: testUsers.student.id,
        course: course._id,
        paymentId: 'test-payment',
        progress: 100
      });
    });

    it('should generate certificate for completed course', async () => {
      const response = await studentClient.get(
        `/api/v1/enrollments/${enrollment._id}/certificate`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('certificateUrl');
    });

    it('should not generate certificate for incomplete course', async () => {
      await Enrollment.findByIdAndUpdate(enrollment._id, { progress: 50 });

      const response = await studentClient.get(
        `/api/v1/enrollments/${enrollment._id}/certificate`
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/enrollments/:id/cancel', () => {
    let enrollment;

    beforeEach(async () => {
      enrollment = await Enrollment.create({
        student: testUsers.student.id,
        course: course._id,
        paymentId: 'test-payment',
        enrolledAt: new Date()
      });
    });

    it('should allow cancellation within 24 hours', async () => {
      const response = await studentClient.post(
        `/api/v1/enrollments/${enrollment._id}/cancel`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedEnrollment = await Enrollment.findById(enrollment._id);
      expect(updatedEnrollment.status).toBe('refunded');
    });

    it('should not allow cancellation after 24 hours', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);
      
      await Enrollment.findByIdAndUpdate(enrollment._id, {
        enrolledAt: oldDate
      });

      const response = await studentClient.post(
        `/api/v1/enrollments/${enrollment._id}/cancel`
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});