const { Enrollment, Course, Module, Lesson } = require('../models');
const { formatError } = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../config');
const crypto = require('crypto');

class EnrollmentController {
  // Enroll in a course
  async enrollInCourse(req, res) {
    try {
      const { courseId, paymentId } = req.body;
      const userId = req.user.user_id || req.user.id;
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.status !== 'published') {
        return res.status(400).json({
          success: false,
          error: { message: 'Course is not available for enrollment' }
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });

      if (existingEnrollment) {
        // If previously refunded, reactivate
        if (existingEnrollment.status === 'refunded') {
          existingEnrollment.status = 'active';
          existingEnrollment.enrolledAt = new Date();
          existingEnrollment.paymentId = paymentId || null;
          await existingEnrollment.initializeProgress(course.modules);
          await existingEnrollment.save();

          await Course.findByIdAndUpdate(courseId, { $inc: { enrollments_count: 1 } });

          return res.status(201).json({
            success: true,
            data: existingEnrollment
          });
        }

        return res.status(400).json({
          success: false,
          error: { message: 'Already enrolled in this course' }
        });
      }

      // Enforce max enrollments per user
      const userEnrollmentCount = await Enrollment.countDocuments({
        student: userId,
        status: 'active'
      });
      if (userEnrollmentCount >= config.limits.maxEnrollmentsPerUser) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum of ${config.limits.maxEnrollmentsPerUser} active enrollments reached` }
        });
      }

      const enrollment = new Enrollment({
        student: userId,
        course: courseId,
        paymentId: paymentId || null
      });

      // Initialize module progress tracking
      await enrollment.initializeProgress(course.modules);
      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollments_count: 1 } });

      logger.info(`User ${userId} enrolled in course ${courseId}`);

      res.status(201).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      logger.error('enrollInCourse error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Inter-service enrollment (called by payment service after successful payment)
  async serviceEnroll(req, res) {
    try {
      const serviceAuth = req.headers['x-service-auth'];
      if (serviceAuth !== (process.env.SERVICE_SECRET || 'service-to-service-secret')) {
        return res.status(403).json({
          success: false,
          error: { message: 'Invalid service authentication' }
        });
      }

      const { courseId, paymentId, userId } = req.body;
      const studentId = userId || req.headers['x-user-id'];

      if (!courseId || !studentId) {
        return res.status(400).json({
          success: false,
          error: { message: 'courseId and userId are required' }
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      // Check for existing enrollment
      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing && existing.status !== 'refunded') {
        return res.json({
          success: true,
          data: existing,
          message: 'Already enrolled'
        });
      }

      let enrollment;
      if (existing && existing.status === 'refunded') {
        existing.status = 'active';
        existing.enrolledAt = new Date();
        existing.paymentId = paymentId ? paymentId.toString() : null;
        await existing.initializeProgress(course.modules);
        await existing.save();
        enrollment = existing;
      } else {
        enrollment = new Enrollment({
          student: studentId,
          course: courseId,
          paymentId: paymentId ? paymentId.toString() : null
        });
        await enrollment.initializeProgress(course.modules);
        await enrollment.save();
      }

      await Course.findByIdAndUpdate(courseId, { $inc: { enrollments_count: 1 } });

      logger.info(`Service enrollment: user ${studentId} in course ${courseId} (payment: ${paymentId})`);

      res.status(201).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      logger.error('serviceEnroll error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Inter-service revoke enrollment (called by payment service on refund)
  async serviceRevoke(req, res) {
    try {
      const serviceAuth = req.headers['x-service-auth'];
      if (serviceAuth !== (process.env.SERVICE_SECRET || 'service-to-service-secret')) {
        return res.status(403).json({
          success: false,
          error: { message: 'Invalid service authentication' }
        });
      }

      const courseId = req.params.courseId;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'X-User-Id header is required' }
        });
      }

      const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      enrollment.status = 'refunded';
      await enrollment.save();

      await Course.findByIdAndUpdate(courseId, { $inc: { enrollments_count: -1 } });

      logger.info(`Service revoke: user ${userId} enrollment in course ${courseId} revoked`);

      res.json({
        success: true,
        message: 'Enrollment revoked successfully'
      });
    } catch (error) {
      logger.error('serviceRevoke error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get student's enrollments
  async getMyEnrollments(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { student: userId };
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [enrollments, total] = await Promise.all([
        Enrollment.find(query)
          .populate('course', 'title slug image_url domain level price total_lessons total_duration_hours average_rating')
          .sort('-enrolledAt')
          .skip(skip)
          .limit(parseInt(limit)),
        Enrollment.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get enrollment details
  async getEnrollmentDetails(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const enrollment = await Enrollment.findById(req.params.id)
        .populate('course');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      // Check authorization
      if (enrollment.student.toString() !== userId &&
          enrollment.course?.instructor_id?.toString() !== userId &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to view this enrollment' }
        });
      }

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update lesson progress
  async updateLessonProgress(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const { moduleId, lessonId, completed, timeSpent } = req.body;
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this enrollment' }
        });
      }

      const updated = await enrollment.updateLessonProgress(moduleId, lessonId, completed, timeSpent);

      if (!updated) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid module or lesson ID' }
        });
      }

      res.json({
        success: true,
        data: {
          progress: enrollment.progress,
          status: enrollment.status,
          modulesProgress: enrollment.modulesProgress
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Generate/get course certificate
  async getCertificate(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const enrollment = await Enrollment.findById(req.params.id)
        .populate('course', 'title domain instructor_name');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to access this certificate' }
        });
      }

      if (enrollment.progress < 100) {
        return res.status(400).json({
          success: false,
          error: { message: 'Course not completed yet' }
        });
      }

      if (!enrollment.certificate.issued) {
        const certId = crypto.randomBytes(16).toString('hex');
        const certificateUrl = `/api/v1/certificates/${certId}`;

        enrollment.certificate = {
          issued: true,
          issuedAt: new Date(),
          certificateUrl
        };
        await enrollment.save();

        logger.info(`Certificate generated for user ${userId}, course ${enrollment.course._id}`);
      }

      res.json({
        success: true,
        data: {
          certificate: enrollment.certificate,
          course: enrollment.course ? {
            title: enrollment.course.title,
            domain: enrollment.course.domain,
            instructor: enrollment.course.instructor_name
          } : null,
          completedAt: enrollment.completedAt
        }
      });
    } catch (error) {
      logger.error('getCertificate error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Cancel enrollment
  async cancelEnrollment(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to cancel this enrollment' }
        });
      }

      if (enrollment.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only active enrollments can be cancelled' }
        });
      }

      // Only allow cancellation within 24 hours of enrollment
      const hoursSinceEnrollment = (Date.now() - new Date(enrollment.enrolledAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceEnrollment > 24) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cancellation period has expired (24 hours)' }
        });
      }

      enrollment.status = 'dropped';
      await enrollment.save();

      await Course.findByIdAndUpdate(enrollment.course, { $inc: { enrollments_count: -1 } });

      logger.info(`Enrollment ${req.params.id} cancelled by user ${userId}`);

      res.json({
        success: true,
        message: 'Enrollment cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Verify enrollment access (inter-service or public check)
  async verifyAccess(req, res) {
    try {
      const { userId, courseId } = req.query;

      if (!userId || !courseId) {
        return res.status(400).json({
          success: false,
          error: { message: 'userId and courseId query params are required' }
        });
      }

      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: { $in: ['active', 'completed'] }
      });

      const course = await Course.findById(courseId);
      const isFree = course && (course.price?.amount === 0 || course.price?.pricing_model === 'free');

      res.json({
        success: true,
        data: {
          hasAccess: !!enrollment || isFree,
          accessType: enrollment ? 'enrollment' : (isFree ? 'free' : null),
          enrollment: enrollment ? {
            id: enrollment._id,
            status: enrollment.status,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt
          } : null
        }
      });
    } catch (error) {
      logger.error('verifyAccess error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }
}

module.exports = new EnrollmentController();
