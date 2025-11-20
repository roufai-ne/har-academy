const { Enrollment, Course } = require('../models');
const { formatError } = require('../utils/helpers');

class EnrollmentController {
  // Enroll in a course
  async enrollInCourse(req, res) {
    try {
      const { courseId, paymentId } = req.body;
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          error: { message: 'Already enrolled in this course' }
        });
      }

      // Create module progress tracking
      const modulesProgress = course.modules.map(module => ({
        moduleId: module._id,
        lessonsProgress: module.lessons.map(lesson => ({
          lessonId: lesson._id,
          completed: false
        })),
        completedLessons: 0,
        totalLessons: module.lessons.length
      }));

      const enrollment = new Enrollment({
        student: req.user.id,
        course: courseId,
        modulesProgress,
        paymentId
      });

      await enrollment.save();

      // Update course enrollment count
      course.enrollmentCount += 1;
      await course.save();

      res.status(201).json({
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

  // Get student's enrollments
  async getMyEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.find({ student: req.user.id })
        .populate('course', 'title thumbnail')
        .sort('-enrolledAt');

      res.json({
        success: true,
        data: enrollments
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
      const enrollment = await Enrollment.findById(req.params.id)
        .populate('course')
        .populate('student', 'name email');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      // Check authorization
      if (enrollment.student._id.toString() !== req.user.id &&
          enrollment.course.instructor.toString() !== req.user.id) {
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
      const { moduleId, lessonId, completed, timeSpent } = req.body;
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== req.user.id) {
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
        data: enrollment
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
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== req.user.id) {
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
        // Generate certificate logic here
        enrollment.certificate = {
          issued: true,
          issuedAt: new Date(),
          certificateUrl: 'URL_TO_GENERATED_CERTIFICATE' // Replace with actual generation logic
        };
        await enrollment.save();
      }

      res.json({
        success: true,
        data: enrollment.certificate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Cancel enrollment
  async cancelEnrollment(req, res) {
    try {
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Enrollment not found' }
        });
      }

      if (enrollment.student.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to cancel this enrollment' }
        });
      }

      // Only allow cancellation within 24 hours of enrollment
      const enrollmentTime = new Date(enrollment.enrolledAt).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceEnrollment = (currentTime - enrollmentTime) / (1000 * 60 * 60);

      if (hoursSinceEnrollment > 24) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cancellation period has expired' }
        });
      }

      enrollment.status = 'refunded';
      await enrollment.save();

      // Update course enrollment count
      const course = await Course.findById(enrollment.course);
      course.enrollmentCount -= 1;
      await course.save();

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
}

module.exports = new EnrollmentController();