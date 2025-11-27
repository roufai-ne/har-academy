const { Course, Enrollment, Review } = require('../models');
const { generateUniqueSlug, paginateResults, formatError } = require('../utils/helpers');

class CourseController {
  // Create a new course
  async createCourse(req, res) {
    try {
      console.log('Create course request:', { body: req.body, user: req.user });
      
      const { title, description, domain, level, price, status } = req.body;
      const slug = await generateUniqueSlug(Course, title);

      const course = new Course({
        title,
        description,
        domain,
        category: domain, // For compatibility
        level,
        price,
        status: status || 'draft',
        slug,
        instructor_id: req.user.user_id || req.user.id || req.user._id,
        instructor_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Instructor'
      });

      await course.save();

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
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

      console.log('getCourses query params:', req.query);

      const query = { status: 'published' };

      if (category) query.category = category;
      if (level) query.level = level;
      if (domain) query.domain = domain;
      if (priceMin || priceMax) {
        query.price = {};
        if (priceMin) query.price.$gte = Number(priceMin);
        if (priceMax) query.price.$lte = Number(priceMax);
      }
      if (search) {
        query.$text = { $search: search };
      }

      console.log('getCourses query:', query);

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const { results, pagination } = await paginateResults(
        Course,
        query,
        page,
        limit,
        [],
        sort
      );

      console.log('getCourses results:', results.length);

      res.json({
        success: true,
        data: {
          courses: results
        },
        pagination
      });
    } catch (error) {
      console.error('getCourses error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course by slug
  async getCourseBySlug(req, res) {
    try {
      console.log('getCourseBySlug:', req.params.slug);
      
      const course = await Course.findOne({ slug: req.params.slug });

      if (!course) {
        console.log('Course not found by slug:', req.params.slug);
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      console.log('Course found:', course._id);

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('getCourseBySlug error:', error);
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
      console.error('Error fetching course:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course lessons
  async getCourseLessons(req, res) {
    try {
      console.log('getCourseLessons for course:', req.params.id);
      
      const { Module, Lesson } = require('../models');
      const modules = await Module.find({ course_id: req.params.id }).sort('order');
      
      console.log('Found modules:', modules.length);

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await Lesson.find({ module_id: module._id }).sort('order');
          console.log(`Module ${module._id} has ${lessons.length} lessons`);
          return {
            ...module.toObject(),
            lessons
          };
        })
      );

      console.log('Returning modules with lessons:', modulesWithLessons.length);

      res.json({
        success: true,
        data: {
          modules: modulesWithLessons
        }
      });
    } catch (error) {
      console.error('getCourseLessons error:', error);
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
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      const existingEnrollment = await Enrollment.findOne({
        course: req.params.id,
        student: req.user.user_id
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          error: { message: 'Already enrolled in this course' }
        });
      }

      const enrollment = await Enrollment.create({
        course: req.params.id,
        student: req.user.user_id,
        enrolledAt: new Date()
      });

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

  // Get course progress
  async getCourseProgress(req, res) {
    try {
      const enrollment = await Enrollment.findOne({
        course: req.params.id,
        student: req.user.user_id
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

      // Check if there are any enrollments
      const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete course with active enrollments' }
        });
      }

      await Promise.all([
        Course.deleteOne({ _id: course._id }),
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

  // Publish course
  async publishCourse(req, res) {
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
          error: { message: 'Not authorized to publish this course' }
        });
      }

      course.status = 'published';
      course.published_at = new Date();
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

      if (course.instructor_id.toString() !== req.user.user_id) {
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

  // Add module to course
  async addModule(req, res) {
    try {
      console.log('addModule request:', { 
        courseId: req.params.id, 
        body: req.body, 
        user: req.user 
      });

      const { title, description, order } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course) {
        console.log('Course not found');
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }

      console.log('Course found:', {
        id: course._id,
        instructor_id: course.instructor_id,
        user_id: req.user.user_id
      });

      if (course.instructor_id.toString() !== req.user.user_id) {
        console.log('Authorization failed');
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this course' }
        });
      }

      // Create a new Module document
      const { Module } = require('../models');
      const module = await Module.create({
        course_id: course._id,
        title,
        description: description || '',
        order: order || course.modules.length + 1
      });

      // Add module ID to course
      course.modules.push(module._id);
      await course.save();

      console.log('Module added successfully');

      res.status(201).json({
        success: true,
        data: module
      });
    } catch (error) {
      console.error('addModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Add lesson to module
  async addLesson(req, res) {
    try {
      console.log('addLesson request:', { 
        courseId: req.params.id, 
        moduleId: req.params.module_id,
        body: req.body 
      });

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

      // Check if module exists
      const { Module, Lesson } = require('../models');
      const module = await Module.findById(req.params.module_id);
      
      if (!module || module.course_id.toString() !== req.params.id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      // Get current lessons count for order
      const lessonsCount = await Lesson.countDocuments({ module_id: req.params.module_id });

      // Create lesson
      const lesson = await Lesson.create({
        module_id: req.params.module_id,
        title,
        description: description || '',
        content: content || '',
        type: type || 'video',
        video: video || null,
        order: order || lessonsCount + 1
      });

      console.log('Lesson added successfully');

      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('addLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update module
  async updateModule(req, res) {
    try {
      console.log('updateModule request:', { 
        courseId: req.params.id, 
        moduleId: req.params.module_id,
        body: req.body 
      });

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

      // Update module fields
      if (req.body.title) module.title = req.body.title;
      if (req.body.description !== undefined) module.description = req.body.description;
      if (req.body.order !== undefined) module.order = req.body.order;
      if (req.body.duration_minutes !== undefined) module.duration_minutes = req.body.duration_minutes;
      if (req.body.is_published !== undefined) module.is_published = req.body.is_published;

      await module.save();

      console.log('Module updated successfully');

      res.json({
        success: true,
        data: module
      });
    } catch (error) {
      console.error('updateModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete module
  async deleteModule(req, res) {
    try {
      console.log('deleteModule request:', { 
        courseId: req.params.id, 
        moduleId: req.params.module_id
      });

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

      // Delete all lessons in this module
      await Lesson.deleteMany({ module_id: req.params.module_id });

      // Delete the module
      await Module.findByIdAndDelete(req.params.module_id);

      // Remove module ID from course
      course.modules = course.modules.filter(id => id.toString() !== req.params.module_id);
      await course.save();

      console.log('Module deleted successfully');

      res.json({
        success: true,
        message: 'Module and its lessons deleted successfully'
      });
    } catch (error) {
      console.error('deleteModule error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update lesson
  async updateLesson(req, res) {
    try {
      console.log('updateLesson request:', { 
        courseId: req.params.id, 
        moduleId: req.params.module_id,
        lessonId: req.params.lesson_id,
        body: req.body 
      });

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

      // Update lesson fields
      if (req.body.title) lesson.title = req.body.title;
      if (req.body.description !== undefined) lesson.description = req.body.description;
      if (req.body.content !== undefined) lesson.content = req.body.content;
      if (req.body.type) lesson.type = req.body.type;
      if (req.body.video !== undefined) lesson.video = req.body.video;
      if (req.body.order !== undefined) lesson.order = req.body.order;
      if (req.body.quiz_id !== undefined) lesson.quiz_id = req.body.quiz_id;
      if (req.body.resource_urls !== undefined) lesson.resource_urls = req.body.resource_urls;

      await lesson.save();

      console.log('Lesson updated successfully');

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('updateLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete lesson
  async deleteLesson(req, res) {
    try {
      console.log('deleteLesson request:', { 
        courseId: req.params.id, 
        moduleId: req.params.module_id,
        lessonId: req.params.lesson_id
      });

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

      // Delete the lesson
      await Lesson.findByIdAndDelete(req.params.lesson_id);

      console.log('Lesson deleted successfully');

      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      console.error('deleteLesson error:', error);
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update lesson
  async updateLesson_OLD(req, res) {
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

      const module = course.modules.id(req.params.module_id);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: { message: 'Module not found' }
        });
      }

      const lesson = module.lessons.id(req.params.lesson_id);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lesson not found' }
        });
      }

      // Update lesson fields
      Object.assign(lesson, req.body);
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
      const query = { instructor_id: req.user.user_id };

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

      if (course.instructor_id.toString() !== req.user.user_id) {
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
}

module.exports = new CourseController();