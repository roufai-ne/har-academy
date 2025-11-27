const express = require('express');
const courseController = require('../controllers/course.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');
const { cacheMiddleware } = require('../middleware/cache.middleware');

const router = express.Router();

// Public routes (with cache)
router.get('/', cacheMiddleware(3600), courseController.getCourses); // Cache 1h
router.get('/slug/:slug', cacheMiddleware(1800), courseController.getCourseBySlug); // Cache 30min

// Public course detail routes (before verifyToken)
router.get('/:id/lessons', courseController.getCourseLessons);
router.get('/:id', courseController.getCourseById);

// Protected routes
router.use(verifyToken);

// Instructor routes (must be before /:id to avoid matching 'instructor' as an id)
router.get('/instructor', requireRoles(['instructor', 'admin']), courseController.getInstructorCourses);
router.post('/', requireRoles(['instructor', 'admin']), courseController.createCourse);
router.put('/:id', requireRoles(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', requireRoles(['instructor', 'admin']), courseController.deleteCourse);
router.post('/:id/publish', requireRoles(['instructor', 'admin']), courseController.publishCourse);
router.post('/:id/modules', requireRoles(['instructor', 'admin']), courseController.addModule);
router.patch('/:id/modules/:module_id', requireRoles(['instructor', 'admin']), courseController.updateModule);
router.delete('/:id/modules/:module_id', requireRoles(['instructor', 'admin']), courseController.deleteModule);
router.post('/:id/modules/:module_id/lessons', requireRoles(['instructor', 'admin']), courseController.addLesson);
router.patch('/:id/modules/:module_id/lessons/:lesson_id', requireRoles(['instructor', 'admin']), courseController.updateLesson);
router.delete('/:id/modules/:module_id/lessons/:lesson_id', requireRoles(['instructor', 'admin']), courseController.deleteLesson);
router.put('/:id/modules/order', requireRoles(['instructor', 'admin']), courseController.updateModuleOrder);
router.put('/:id/modules/:module_id', requireRoles(['instructor', 'admin']), courseController.updateModule);

// Student routes (authenticated users)
router.get('/:id/lessons/:lesson_id', courseController.getLessonDetails);
router.post('/:id/enroll', courseController.enrollInCourse);
router.get('/:id/progress', courseController.getCourseProgress);
router.get('/:id/analytics', requireRoles(['instructor', 'admin']), courseController.getCourseAnalytics);

module.exports = router;