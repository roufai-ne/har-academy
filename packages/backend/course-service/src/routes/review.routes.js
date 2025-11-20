const express = require('express');
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/course/:courseId', reviewController.getCourseReviews);

// Protected routes
router.use(verifyToken);

// Student routes
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markReviewHelpful);
router.post('/:id/report', reviewController.reportReview);

// Admin routes
router.put('/:id/moderate', requireRoles(['admin']), reviewController.moderateReview);

module.exports = router;