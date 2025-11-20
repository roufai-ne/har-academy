const { Course, Enrollment, Review } = require('../models');
const { generateUniqueSlug, paginateResults, formatError } = require('../utils/helpers');

class CourseController {
  // Create a new course
  async createCourse(req, res) {
    try {
      const { title, description, category, level, price } = req.body;
      const slug = await generateUniqueSlug(Course, title);

      const course = new Course({
        ...req.body,
        slug,
        instructor: req.user.id
      });

      await course.save();

      res.status(201).json({
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

  // Get all courses with pagination and filters
  async getCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        level,
        search,
        priceMin,
        priceMax,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isPublished: true };

      if (category) query.category = category;
      if (level) query.level = level;
      if (priceMin || priceMax) {
        query.price = {};
        if (priceMin) query.price.$gte = Number(priceMin);
        if (priceMax) query.price.$lte = Number(priceMax);
      }
      if (search) {
        query.$text = { $search: search };
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      const populate = [
        { path: 'instructor', select: 'name avatar' }
      ];

      const { results, pagination } = await paginateResults(
        Course,
        query,
        page,
        limit,
        populate,
        sort
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

  // Get course by slug
  async getCourseBySlug(req, res) {
    try {
      const course = await Course.findOne({ slug: req.params.slug })
        .populate('instructor', 'name avatar bio')
        .populate({
          path: 'reviews',
          populate: {
            path: 'student',
            select: 'name avatar'
          }
        });

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

      if (course.instructor.toString() !== req.user.id) {
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

      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to delete this course' }
        });
      }

      // Check if there are any enrollments
      const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete course with active enrollments' }
        });
      }

      await Promise.all([
        course.remove(),
        Review.deleteMany({ course: course._id })
      ]);

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

  // Update module order
  async updateModuleOrder(req, res) {
    try {
      const { moduleIds } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      // Reorder modules
      const orderedModules = moduleIds.map((id, index) => {
        const module = course.modules.id(id);
        if (module) {
          module.order = index + 1;
        }
        return module;
      }).filter(Boolean);

      course.modules = orderedModules;
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

  // Get instructor courses
  async getInstructorCourses(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const query = { instructor: req.user.id };

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

      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to view analytics' }
        });
      }

      const enrollments = await Enrollment.find({ course: course._id });
      const reviews = await Review.find({ course: course._id });

      const analytics = {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        averageProgress: enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length,
        totalReviews: reviews.length,
        averageRating: course.averageRating,
        revenue: enrollments.length * course.price
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course by ID
  async getCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id)
        .populate('instructor_id', 'first_name last_name avatar_url');

      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      res.json({
        success: true,
        data: { course }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get all lessons of a course
  async getCourseLessons(req, res) {
    try {
      const { id } = req.params;
      const { Module, Lesson } = require('../models');

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      const modules = await Module.find({ course_id: id }).sort({ order: 1 });

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await Lesson.find({ module_id: module._id })
            .sort({ order: 1 })
            .select('-content');

          return {
            ...module.toObject(),
            lessons
          };
        })
      );

      res.json({
        success: true,
        data: {
          course: {
            _id: course._id,
            title: course.title
          },
          modules: modulesWithLessons
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get lesson details
  async getLessonDetails(req, res) {
    try {
      const { id: courseId, lesson_id: lessonId } = req.params;
      const { Lesson } = require('../models');

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      // Check access
      const isInstructor = course.instructor_id && course.instructor_id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isInstructor && !isAdmin) {
        const enrollment = await Enrollment.findOne({
          student: req.user.id,
          course: courseId,
          status: 'active'
        });

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            error: { message: 'Not enrolled in this course' }
          });
        }
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' }
        });
      }

      res.json({
        success: true,
        data: { lesson }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Enroll in course
  async enrollInCourse(req, res) {
    try {
      const { id: courseId } = req.params;
      const { Module, Lesson } = require('../models');

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
          error: { message: 'Course is not published' }
        });
      }

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

      const modules = await Module.find({ course_id: courseId }).sort({ order: 1 });
      const modulesProgress = await Promise.all(
        modules.map(async (module) => {
          const lessons = await Lesson.find({ module_id: module._id });
          const lessonsProgress = lessons.map(lesson => ({
            lessonId: lesson._id,
            completed: false,
            timeSpent: 0
          }));

          return {
            moduleId: module._id,
            lessonsProgress,
            completedLessons: 0,
            totalLessons: lessons.length
          };
        })
      );

      const enrollment = await Enrollment.create({
        student: req.user.id,
        course: courseId,
        status: 'active',
        progress: 0,
        modulesProgress,
        paymentId: req.body.paymentId || 'FREE'
      });

      course.enrollments_count += 1;
      await course.save();

      res.status(201).json({
        success: true,
        data: { enrollment }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Get course progress
  async getCourseProgress(req, res) {
    try {
      const { id: courseId } = req.params;

      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId
      })
      .populate('course', 'title image_url');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Not enrolled in this course' }
        });
      }

      res.json({
        success: true,
        data: {
          enrollment,
          progress: enrollment.progress,
          status: enrollment.status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
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

      const instructorId = course.instructor_id || course.instructor;
      if (instructorId && instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized' }
        });
      }

      const moduleCount = await Module.countDocuments({ course_id: course._id });
      if (moduleCount === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot publish course with no modules' }
        });
      }

      const lessonCount = await Lesson.countDocuments({
        module_id: { $in: await Module.find({ course_id: course._id }).distinct('_id') }
      });

      if (lessonCount === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot publish course with no lessons' }
        });
      }

      course.status = 'published';
      course.published_at = new Date();
      await course.save();

      res.json({
        success: true,
        data: { course }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Add module to course
  async addModule(req, res) {
    try {
      const { title, description, order } = req.body;
      const { Module } = require('../models');
      const courseId = req.params.id;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      const instructorId = course.instructor_id || course.instructor;
      if (instructorId && instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized' }
        });
      }

      const moduleCount = await Module.countDocuments({ course_id: courseId });
      const moduleOrder = order || moduleCount + 1;

      const module = await Module.create({
        course_id: courseId,
        title,
        description,
        order: moduleOrder
      });

      res.status(201).json({
        success: true,
        data: { module }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Add lesson to module
  async addLesson(req, res) {
    try {
      const { title, description, type, content, video, order } = req.body;
      const { id: courseId, module_id: moduleId } = req.params;
      const { Module, Lesson } = require('../models');

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      const instructorId = course.instructor_id || course.instructor;
      if (instructorId && instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized' }
        });
      }

      const module = await Module.findById(moduleId);
      if (!module || module.course_id.toString() !== courseId) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found in this course' }
        });
      }

      const lessonCount = await Lesson.countDocuments({ module_id: moduleId });
      const lessonOrder = order || lessonCount + 1;

      const lesson = await Lesson.create({
        module_id: moduleId,
        title,
        description,
        type: type || 'video',
        content,
        video,
        order: lessonOrder
      });

      course.total_lessons += 1;
      if (video?.duration_seconds) {
        course.total_duration_hours += video.duration_seconds / 3600;
      }
      await course.save();

      res.status(201).json({
        success: true,
        data: { lesson }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Update lesson
  async updateLesson(req, res) {
    try {
      const { id: courseId, module_id: moduleId, lesson_id: lessonId } = req.params;
      const updates = req.body;
      const { Lesson } = require('../models');

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      const instructorId = course.instructor_id || course.instructor;
      if (instructorId && instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized' }
        });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson || lesson.module_id.toString() !== moduleId) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found in this module' }
        });
      }

      Object.assign(lesson, updates);
      await lesson.save();

      res.json({
        success: true,
        data: { lesson }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

module.exports = new CourseController();