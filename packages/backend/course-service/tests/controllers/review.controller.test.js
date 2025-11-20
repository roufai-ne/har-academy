const mongoose = require('mongoose');
const {
  connect,
  clearDatabase,
  closeDatabase,
  testUsers,
  generateCourseData
} = require('../utils/test-setup');
const TestClient = require('../utils/test-client');
const { Course, Enrollment, Review } = require('../../src/models');

describe('Review Controller', () => {
  let studentClient;
  let adminClient;
  let course;
  let enrollment;

  beforeAll(async () => {
    await connect();
    studentClient = new TestClient(testUsers.student);
    adminClient = new TestClient(testUsers.admin);
  });

  beforeEach(async () => {
    course = await Course.create(generateCourseData({
      isPublished: true
    }));
    enrollment = await Enrollment.create({
      student: testUsers.student.id,
      course: course._id,
      status: 'completed',
      paymentId: 'test-payment'
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/reviews', () => {
    it('should create a new review for completed course', async () => {
      const reviewData = {
        courseId: course._id,
        rating: 5,
        title: 'Great Course',
        content: 'This course was very informative and well structured.'
      };

      const response = await studentClient.post('/api/v1/reviews', reviewData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student.toString()).toBe(testUsers.student.id.toString());
      expect(response.body.data.course.toString()).toBe(course._id.toString());
      expect(response.body.data.verified).toBe(true);
    });

    it('should not allow review without course completion', async () => {
      await Enrollment.findByIdAndUpdate(enrollment._id, { status: 'active' });

      const reviewData = {
        courseId: course._id,
        rating: 5,
        title: 'Great Course',
        content: 'This course was very informative.'
      };

      const response = await studentClient.post('/api/v1/reviews', reviewData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate reviews', async () => {
      const reviewData = {
        courseId: course._id,
        rating: 5,
        title: 'Great Course',
        content: 'This course was very informative.'
      };

      await studentClient.post('/api/v1/reviews', reviewData);
      const response = await studentClient.post('/api/v1/reviews', reviewData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/reviews/course/:courseId', () => {
    beforeEach(async () => {
      await Review.create([
        {
          course: course._id,
          student: testUsers.student.id,
          rating: 5,
          title: 'Review 1',
          content: 'Great course',
          status: 'approved'
        },
        {
          course: course._id,
          student: new mongoose.Types.ObjectId(),
          rating: 4,
          title: 'Review 2',
          content: 'Good course',
          status: 'approved'
        }
      ]);
    });

    it('should return course reviews with pagination', async () => {
      const response = await studentClient.get(
        `/api/v1/reviews/course/${course._id}?page=1&limit=1`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should support sorting options', async () => {
      const response = await studentClient.get(
        `/api/v1/reviews/course/${course._id}?sort=rating`
      );

      expect(response.status).toBe(200);
      expect(response.body.data[0].rating).toBe(5);
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        course: course._id,
        student: testUsers.student.id,
        rating: 4,
        title: 'Initial Review',
        content: 'Initial content',
        status: 'approved'
      });
    });

    it('should allow updating own review', async () => {
      const updates = {
        rating: 5,
        title: 'Updated Review',
        content: 'Updated content'
      };

      const response = await studentClient.put(
        `/api/v1/reviews/${review._id}`,
        updates
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
    });

    it('should not allow updating after 30 days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await Review.findByIdAndUpdate(review._id, { createdAt: oldDate });

      const response = await studentClient.put(
        `/api/v1/reviews/${review._id}`,
        { rating: 5 }
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/reviews/:id/helpful', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        course: course._id,
        student: testUsers.student.id,
        rating: 4,
        title: 'Test Review',
        content: 'Test content',
        status: 'approved'
      });
    });

    it('should mark review as helpful', async () => {
      const response = await studentClient.post(
        `/api/v1/reviews/${review._id}/helpful`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.helpful.count).toBe(1);
      expect(response.body.data.helpful.users).toContain(testUsers.student.id.toString());
    });

    it('should toggle helpful status', async () => {
      await studentClient.post(`/api/v1/reviews/${review._id}/helpful`);
      const response = await studentClient.post(
        `/api/v1/reviews/${review._id}/helpful`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.helpful.count).toBe(0);
      expect(response.body.data.helpful.users).not.toContain(testUsers.student.id.toString());
    });
  });

  describe('POST /api/v1/reviews/:id/report', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        course: course._id,
        student: new mongoose.Types.ObjectId(),
        rating: 4,
        title: 'Test Review',
        content: 'Test content',
        status: 'approved'
      });
    });

    it('should report a review', async () => {
      const response = await studentClient.post(
        `/api/v1/reviews/${review._id}/report`,
        { reason: 'Inappropriate content' }
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should prevent multiple reports from same user', async () => {
      await studentClient.post(
        `/api/v1/reviews/${review._id}/report`,
        { reason: 'Inappropriate content' }
      );

      const response = await studentClient.post(
        `/api/v1/reviews/${review._id}/report`,
        { reason: 'Spam' }
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should flag for moderation after multiple reports', async () => {
      const otherStudents = [
        new TestClient({ ...testUsers.student, id: new mongoose.Types.ObjectId() }),
        new TestClient({ ...testUsers.student, id: new mongoose.Types.ObjectId() }),
        new TestClient({ ...testUsers.student, id: new mongoose.Types.ObjectId() })
      ];

      await Promise.all(otherStudents.map(client => 
        client.post(
          `/api/v1/reviews/${review._id}/report`,
          { reason: 'Inappropriate content' }
        )
      ));

      const updatedReview = await Review.findById(review._id);
      expect(updatedReview.status).toBe('pending');
    });
  });

  describe('PUT /api/v1/reviews/:id/moderate', () => {
    let review;

    beforeEach(async () => {
      review = await Review.create({
        course: course._id,
        student: testUsers.student.id,
        rating: 4,
        title: 'Test Review',
        content: 'Test content',
        status: 'pending'
      });
    });

    it('should allow admin to moderate review', async () => {
      const moderationData = {
        status: 'rejected',
        reason: 'Violates community guidelines'
      };

      const response = await adminClient.put(
        `/api/v1/reviews/${review._id}/moderate`,
        moderationData
      );

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.moderation.reason).toBe(moderationData.reason);
    });

    it('should not allow non-admin to moderate', async () => {
      const response = await studentClient.put(
        `/api/v1/reviews/${review._id}/moderate`,
        { status: 'approved' }
      );

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});