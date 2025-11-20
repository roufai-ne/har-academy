const express = require('express');
const courseController = require('../controllers/course.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/slug/:slug', courseController.getCourseBySlug);
router.get('/:id', courseController.getCourseById);
router.get('/:id/lessons', courseController.getCourseLessons);

// Protected routes
router.use(verifyToken);

// Student routes (authenticated users)
router.get('/:id/lessons/:lesson_id', courseController.getLessonDetails);
router.post('/:id/enroll', courseController.enrollInCourse);
router.get('/:id/progress', courseController.getCourseProgress);

// Instructor routes
router.post('/', requireRoles(['instructor', 'admin']), courseController.createCourse);
router.get('/instructor', requireRoles(['instructor', 'admin']), courseController.getInstructorCourses);
router.put('/:id', requireRoles(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', requireRoles(['instructor', 'admin']), courseController.deleteCourse);
router.post('/:id/publish', requireRoles(['instructor', 'admin']), courseController.publishCourse);
router.post('/:id/modules', requireRoles(['instructor', 'admin']), courseController.addModule);
router.post('/:id/modules/:module_id/lessons', requireRoles(['instructor', 'admin']), courseController.addLesson);
router.patch('/:id/modules/:module_id/lessons/:lesson_id', requireRoles(['instructor', 'admin']), courseController.updateLesson);
router.put('/:id/modules/order', requireRoles(['instructor', 'admin']), courseController.updateModuleOrder);
router.get('/:id/analytics', requireRoles(['instructor', 'admin']), courseController.getCourseAnalytics);

module.exports = router;