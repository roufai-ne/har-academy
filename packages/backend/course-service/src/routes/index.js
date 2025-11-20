const express = require('express');
const courseRoutes = require('./course.routes');
const enrollmentRoutes = require('./enrollment.routes');
const reviewRoutes = require('./review.routes');
const categoryRoutes = require('./category.routes');

const router = express.Router();

router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;