const { Course, Enrollment, Review } = require('../models');
const { generateUniqueSlug, paginateResults, formatError } = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../config');

class CourseController {
  // Create a new course
  async createCourse(req, res) {
    try {
      const instructorId = req.user.user_id || req.user.id || req.user._id;

      // Enforce max courses per instructor
      const instructorCourseCount = await Course.countDocuments({ instructor_id: instructorId });
      if (instructorCourseCount >= config.limits.maxCoursesPerInstructor) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum of ${config.limits.maxCoursesPerInstructor} courses per instructor reached` }
        });
      }

      const { title, description, domain, level, price, status } = req.body;
      const slug = await generateUniqueSlug(Course, title);

      const course = new Course({
        title,
        description,
        domain,
        category: domain,
        level,
        price,
        status: status || 'draft',
        slug,
        instructor_id: instructorId,
        instructor_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Instructor'
      });

      await course.save();

      logger.info(`Course created: ${course._id} by instructor ${instructorId}`);

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      logger.error('Error creating course:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get all courses with pagination and filters
  async getCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        level,
        domain,
        search,
        priceMin,
        priceMax,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { status: 'published' };

      if (category) query.category = category;
      if (level) query.level = level;
      if (domain) query.domain = domain;
      if (priceMin || priceMax) {
        query['price.amount'] = {};
        if (priceMin) query['price.amount'].$gte = Number(priceMin);
        if (priceMax) query['price.amount'].$lte = Number(priceMax);
      }
      if (search) {
        query.$text = { $search: search };
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const { results, pagination } = await paginateResults(
        Course,
        query,
        page,
        limit,
        [],
        sort
      );

      res.json({
        success: true,
        data: {
          courses: results
        },
        pagination
      });
    } catch (error) {
      logger.error('getCourses error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course by slug
  async getCourseBySlug(req, res) {
    try {
      const course = await Course.findOne({ slug: req.params.slug });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      logger.error('getCourseBySlug error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course by ID
  async getCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      logger.error('Error fetching course:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course lessons
  async getCourseLessons(req, res) {
    try {
      const { Module, Lesson } = require('../models');
      const modules = await Module.find({ course_id: req.params.id }).sort('order');

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await Lesson.find({ module_id: module._id }).sort('order');
          return {
            ...module.toObject(),
            lessons
          };
        })
      );

      res.json({
        success: true,
        data: {
          modules: modulesWithLessons
        }
      });
    } catch (error) {
      logger.error('getCourseLessons error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get lesson details
  async getLessonDetails(req, res) {
    try {
      const { Lesson } = require('../models');
      const lesson = await Lesson.findById(req.params.lesson_id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' }
        });
      }

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Enroll in course
  async enrollInCourse(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const course = await Course.findById(req.params.id);

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

      const existingEnrollment = await Enrollment.findOne({
        course: req.params.id,
        student: userId
      });

      if (existingEnrollment) {
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
        course: req.params.id,
        student: userId,
        enrolledAt: new Date()
      });

      // Initialize progress tracking from course modules
      await enrollment.initializeProgress(course.modules);
      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(req.params.id, { $inc: { enrollments_count: 1 } });

      logger.info(`User ${userId} enrolled in course ${req.params.id}`);

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

  // Get course progress
  async getCourseProgress(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const enrollment = await Enrollment.findOne({
        course: req.params.id,
        student: userId
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Not enrolled in this course' }
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

  // Update course
  async updateCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      if (req.body.title && req.body.title !== course.title) {
        req.body.slug = await generateUniqueSlug(Course, req.body.title, course._id);
      }

      Object.assign(course, req.body);
      await course.save();

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete course
  async deleteCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to delete this course' }
        });
      }

      // Check if there are any active enrollments
      const enrollmentCount = await Enrollment.countDocuments({
        course: course._id,
        status: { $in: ['active', 'completed'] }
      });
      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete course with active enrollments' }
        });
      }

      const { Module, Lesson } = require('../models');

      await Promise.all([
        Course.deleteOne({ _id: course._id }),
        Module.deleteMany({ course_id: course._id }),
        Lesson.deleteMany({ module_id: { $in: course.modules } }),
        Review.deleteMany({ course: course._id }),
        Enrollment.deleteMany({ course: course._id })
      ]);

      logger.info(`Course deleted: ${course._id}`);

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Publish course
  async publishCourse(req, res) {
    try {
      const { Module, Lesson } = require('../models');
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to publish this course' }
        });
      }

      if (course.status === 'published') {
        return res.status(400).json({
          success: false,
          error: { message: 'Course is already published' }
        });
      }

      // Validate course has at least one module with at least one lesson
      const modules = await Module.find({ course_id: course._id });
      if (modules.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Course must have at least one module to be published' }
        });
      }

      const lessonCount = await Lesson.countDocuments({
        module_id: { $in: modules.map(m => m._id) }
      });
      if (lessonCount === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Course must have at least one lesson to be published' }
        });
      }

      // Update course stats
      course.status = 'published';
      course.published_at = new Date();
      course.total_lessons = lessonCount;

      // Calculate total duration
      const lessons = await Lesson.find({
        module_id: { $in: modules.map(m => m._id) }
      });
      const totalSeconds = lessons.reduce((sum, l) => sum + (l.video?.duration_seconds || 0), 0);
      course.total_duration_hours = Math.round((totalSeconds / 3600) * 100) / 100;

      await course.save();

      logger.info(`Course published: ${course._id}`);

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update module order
  async updateModuleOrder(req, res) {
    try {
      const { moduleIds } = req.body;
      const { Module } = require('../models');
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      // Update order for each module
      await Promise.all(
        moduleIds.map((id, index) =>
          Module.findByIdAndUpdate(id, { order: index + 1 })
        )
      );

      // Update modules array in course
      course.modules = moduleIds;
      await course.save();

      const updatedModules = await Module.find({ course_id: course._id }).sort('order');

      res.json({
        success: true,
        data: { modules: updatedModules }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Add module to course
  async addModule(req, res) {
    try {
      const { title, description, order } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      // Enforce max modules per course
      if (course.modules.length >= config.limits.maxModulesPerCourse) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum of ${config.limits.maxModulesPerCourse} modules per course reached` }
        });
      }

      const { Module } = require('../models');
      const module = await Module.create({
        course_id: course._id,
        title,
        description: description || '',
        order: order || course.modules.length + 1
      });

      course.modules.push(module._id);
      await course.save();

      logger.info(`Module ${module._id} added to course ${course._id}`);

      res.status(201).json({
        success: true,
        data: module
      });
    } catch (error) {
      logger.error('addModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Add lesson to module
  async addLesson(req, res) {
    try {
      const { title, description, content, type, video, order } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      const { Module, Lesson } = require('../models');
      const module = await Module.findById(req.params.module_id);

      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      // Enforce max lessons per module
      const lessonsCount = await Lesson.countDocuments({ module_id: req.params.module_id });
      if (lessonsCount >= config.limits.maxLessonsPerModule) {
        return res.status(400).json({
          success: false,
          error: { message: `Maximum of ${config.limits.maxLessonsPerModule} lessons per module reached` }
        });
      }

      const lesson = await Lesson.create({
        module_id: req.params.module_id,
        title,
        description: description || '',
        content: content || '',
        type: type || 'video',
        video: video || null,
        order: order || lessonsCount + 1
      });

      logger.info(`Lesson ${lesson._id} added to module ${req.params.module_id}`);

      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      logger.error('addLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update module
  async updateModule(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      const { Module } = require('../models');
      const module = await Module.findById(req.params.module_id);

      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      if (req.body.title) module.title = req.body.title;
      if (req.body.description !== undefined) module.description = req.body.description;
      if (req.body.order !== undefined) module.order = req.body.order;
      if (req.body.duration_minutes !== undefined) module.duration_minutes = req.body.duration_minutes;
      if (req.body.is_published !== undefined) module.is_published = req.body.is_published;

      await module.save();

      res.json({
        success: true,
        data: module
      });
    } catch (error) {
      logger.error('updateModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete module
  async deleteModule(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      const { Module, Lesson } = require('../models');
      const module = await Module.findById(req.params.module_id);

      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      await Lesson.deleteMany({ module_id: req.params.module_id });
      await Module.findByIdAndDelete(req.params.module_id);

      course.modules = course.modules.filter(id => id.toString() !== req.params.module_id);
      await course.save();

      logger.info(`Module ${req.params.module_id} deleted from course ${req.params.id}`);

      res.json({
        success: true,
        message: 'Module and its lessons deleted successfully'
      });
    } catch (error) {
      logger.error('deleteModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update lesson
  async updateLesson(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      const { Module, Lesson } = require('../models');
      const module = await Module.findById(req.params.module_id);

      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      const lesson = await Lesson.findById(req.params.lesson_id);

      if (!lesson || lesson.module_id.toString() !== req.params.module_id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' }
        });
      }

      if (req.body.title) lesson.title = req.body.title;
      if (req.body.description !== undefined) lesson.description = req.body.description;
      if (req.body.content !== undefined) lesson.content = req.body.content;
      if (req.body.type) lesson.type = req.body.type;
      if (req.body.video !== undefined) lesson.video = req.body.video;
      if (req.body.order !== undefined) lesson.order = req.body.order;
      if (req.body.quiz_id !== undefined) lesson.quiz_id = req.body.quiz_id;
      if (req.body.resource_urls !== undefined) lesson.resource_urls = req.body.resource_urls;
      if (req.body.is_published !== undefined) lesson.is_published = req.body.is_published;
      if (req.body.is_free_preview !== undefined) lesson.is_free_preview = req.body.is_free_preview;

      await lesson.save();

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      logger.error('updateLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete lesson
  async deleteLesson(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      const { Module, Lesson } = require('../models');
      const module = await Module.findById(req.params.module_id);

      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      const lesson = await Lesson.findById(req.params.lesson_id);

      if (!lesson || lesson.module_id.toString() !== req.params.module_id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' }
        });
      }

      await Lesson.findByIdAndDelete(req.params.lesson_id);

      logger.info(`Lesson ${req.params.lesson_id} deleted from module ${req.params.module_id}`);

      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      logger.error('deleteLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get instructor courses
  async getInstructorCourses(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = { instructor_id: req.user.user_id };
      if (status) query.status = status;

      const { results, pagination } = await paginateResults(
        Course,
        query,
        page,
        limit
      );

      res.json({
        success: true,
        data: results,
        pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course analytics
  async getCourseAnalytics(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor_id.toString() !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to view analytics' }
        });
      }

      const enrollments = await Enrollment.find({ course: course._id });
      const reviews = await Review.find({ course: course._id, status: 'approved' });

      const activeEnrollments = enrollments.filter(e => e.status === 'active');
      const completedEnrollments = enrollments.filter(e => e.status === 'completed');

      const analytics = {
        totalEnrollments: enrollments.length,
        activeEnrollments: activeEnrollments.length,
        completedEnrollments: completedEnrollments.length,
        completionRate: enrollments.length > 0
          ? Math.round((completedEnrollments.length / enrollments.length) * 100)
          : 0,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)
          : 0,
        totalReviews: reviews.length,
        averageRating: course.average_rating || 0,
        revenue: enrollments.filter(e => e.status !== 'refunded').length * (course.price?.amount || 0)
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('getCourseAnalytics error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }
}

module.exports = new CourseController();
