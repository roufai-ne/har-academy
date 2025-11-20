const mongoose = require('mongoose');
const {
  connect,
  clearDatabase,
  closeDatabase,
  testUsers,
  generateCourseData
} = require('../utils/test-setup');
const TestClient = require('../utils/test-client');
const { Course } = require('../../src/models');

describe('Course Controller', () => {
  let adminClient;
  let instructorClient;
  let studentClient;
  let publicClient;

  beforeAll(async () => {
    await connect();
    adminClient = new TestClient(testUsers.admin);
    instructorClient = new TestClient(testUsers.instructor);
    studentClient = new TestClient(testUsers.student);
    publicClient = new TestClient();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/courses', () => {
    it('should create a new course when instructor is authenticated', async () => {
      const courseData = generateCourseData();
      const response = await instructorClient.post('/api/v1/courses', courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(courseData.title);
      expect(response.body.data.instructor.toString()).toBe(testUsers.instructor.id.toString());
    });

    it('should not allow students to create courses', async () => {
      const courseData = generateCourseData();
      const response = await studentClient.post('/api/v1/courses', courseData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required course fields', async () => {
      const invalidData = { title: 'Test' }; // Missing required fields
      const response = await instructorClient.post('/api/v1/courses', invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('GET /api/v1/courses', () => {
    beforeEach(async () => {
      const courses = [
        generateCourseData({ title: 'Course 1', isPublished: true }),
        generateCourseData({ title: 'Course 2', isPublished: true }),
        generateCourseData({ title: 'Draft Course', isPublished: false })
      ];
      await Course.insertMany(courses);
    });

    it('should return published courses', async () => {
      const response = await publicClient.get('/api/v1/courses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(course => course.isPublished)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await publicClient.get('/api/v1/courses?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should support filtering by category', async () => {
      const category = new mongoose.Types.ObjectId();
      await Course.create(generateCourseData({ 
        category, 
        isPublished: true,
        title: 'Category Course'
      }));

      const response = await publicClient.get(`/api/v1/courses?category=${category}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Category Course');
    });
  });

  describe('GET /api/v1/courses/slug/:slug', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create(generateCourseData({
        title: 'Test Course',
        isPublished: true
      }));
    });

    it('should return course details by slug', async () => {
      const response = await publicClient.get(`/api/v1/courses/slug/${course.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(course._id.toString());
    });

    it('should return 404 for non-existent course', async () => {
      const response = await publicClient.get('/api/v1/courses/slug/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create(generateCourseData({
        instructor: testUsers.instructor.id
      }));
    });

    it('should allow instructor to update their course', async () => {
      const updates = { title: 'Updated Course Title' };
      const response = await instructorClient.put(
        `/api/v1/courses/${course._id}`,
        updates
      );

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(updates.title);
    });

    it('should not allow other instructors to update the course', async () => {
      const otherInstructor = new TestClient({
        ...testUsers.instructor,
        id: new mongoose.Types.ObjectId()
      });

      const response = await otherInstructor.put(
        `/api/v1/courses/${course._id}`,
        { title: 'Unauthorized Update' }
      );

      expect(response.status).toBe(403);
    });

    it('should generate new slug when title is updated', async () => {
      const updates = { title: 'New Course Title' };
      const response = await instructorClient.put(
        `/api/v1/courses/${course._id}`,
        updates
      );

      expect(response.status).toBe(200);
      expect(response.body.data.slug).toBe('new-course-title');
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create(generateCourseData({
        instructor: testUsers.instructor.id
      }));
    });

    it('should allow instructor to delete their course', async () => {
      const response = await instructorClient.delete(
        `/api/v1/courses/${course._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedCourse = await Course.findById(course._id);
      expect(deletedCourse).toBeNull();
    });

    it('should not allow unauthorized deletion', async () => {
      const response = await studentClient.delete(
        `/api/v1/courses/${course._id}`
      );

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/courses/instructor', () => {
    beforeEach(async () => {
      await Course.insertMany([
        generateCourseData({ 
          instructor: testUsers.instructor.id,
          title: 'Instructor Course 1'
        }),
        generateCourseData({ 
          instructor: testUsers.instructor.id,
          title: 'Instructor Course 2'
        }),
        generateCourseData({ 
          instructor: new mongoose.Types.ObjectId(),
          title: 'Other Course'
        })
      ]);
    });

    it('should return only instructor\'s courses', async () => {
      const response = await instructorClient.get('/api/v1/courses/instructor');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(
        course => course.instructor.toString() === testUsers.instructor.id.toString()
      )).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await instructorClient.get('/api/v1/courses/instructor?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/courses/:id/analytics', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create(generateCourseData({
        instructor: testUsers.instructor.id
      }));
    });

    it('should return course analytics to instructor', async () => {
      const response = await instructorClient.get(
        `/api/v1/courses/${course._id}/analytics`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEnrollments');
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('revenue');
    });

    it('should not allow unauthorized access to analytics', async () => {
      const response = await studentClient.get(
        `/api/v1/courses/${course._id}/analytics`
      );

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});