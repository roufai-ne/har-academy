const { Review, Course, Enrollment } = require('../models');
const { formatError } = require('../utils/helpers');

const MAX_PAGE_LIMIT = 100;

// Helper to consistently extract user ID from JWT payload
function getUserId(user) {
  return user.user_id || user.id || user._id;
}

class ReviewController {
  // Create a review
  async createReview(req, res) {
    try {
      const { courseId, rating, title, content } = req.body;
      const userId = getUserId(req.user);

      // Check if user is enrolled and completed the course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
        status: 'completed'
      });

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          error: { message: 'Must complete the course before reviewing' }
        });
      }

      // Check if user already reviewed
      const existingReview = await Review.findOne({
        student: userId,
        course: courseId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: { message: 'You have already reviewed this course' }
        });
      }

      const review = new Review({
        course: courseId,
        student: userId,
        rating,
        title,
        content,
        verified: true // Auto-verify since we checked enrollment
      });

      await review.save();

      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get course reviews
  async getCourseReviews(req, res) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10, sort = 'newest' } = req.query;

      const sortOptions = {
        newest: { createdAt: -1 },
        helpful: { 'helpful.count': -1 },
        rating: { rating: -1 }
      };

      // Validate sort parameter
      const sortOption = sortOptions[sort] || sortOptions.newest;

      // Enforce pagination limits
      const safePage = Math.max(1, parseInt(page) || 1);
      const safeLimit = Math.min(Math.max(1, parseInt(limit) || 10), MAX_PAGE_LIMIT);

      const reviews = await Review.find({
        course: courseId,
        status: 'approved'
      })
        .populate('student', 'name avatar')
        .sort(sortOption)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit);

      const total = await Review.countDocuments({
        course: courseId,
        status: 'approved'
      });

      res.json({
        success: true,
        data: reviews,
        pagination: {
          currentPage: safePage,
          totalPages: Math.ceil(total / safeLimit),
          totalReviews: total
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const userId = getUserId(req.user);
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          error: { message: 'Review not found' }
        });
      }

      if (review.student.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to update this review' }
        });
      }

      // Only allow updates within 30 days of posting
      const reviewAge = (new Date() - review.createdAt) / (1000 * 60 * 60 * 24);
      if (reviewAge > 30) {
        return res.status(400).json({
          success: false,
          error: { message: 'Review can only be updated within 30 days of posting' }
        });
      }

      const { rating, title, content } = req.body;
      if (rating !== undefined) review.rating = rating;
      if (title !== undefined) review.title = title;
      if (content !== undefined) review.content = content;

      await review.save();

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const userId = getUserId(req.user);
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          error: { message: 'Review not found' }
        });
      }

      if (review.student.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not authorized to delete this review' }
        });
      }

      await Review.deleteOne({ _id: review._id });

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Mark review as helpful
  async markReviewHelpful(req, res) {
    try {
      const userId = getUserId(req.user);
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          error: { message: 'Review not found' }
        });
      }

      // Check if user already marked as helpful
      const userIndex = review.helpful.users.indexOf(userId);

      if (userIndex === -1) {
        review.helpful.users.push(userId);
        review.helpful.count += 1;
      } else {
        review.helpful.users.splice(userIndex, 1);
        review.helpful.count -= 1;
      }

      await review.save();

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Report review
  async reportReview(req, res) {
    try {
      const userId = getUserId(req.user);
      const review = await Review.findById(req.params.id);
      const { reason } = req.body;

      if (!review) {
        return res.status(404).json({
          success: false,
          error: { message: 'Review not found' }
        });
      }

      // Check if user already reported
      if (review.reported.users.includes(userId)) {
        return res.status(400).json({
          success: false,
          error: { message: 'You have already reported this review' }
        });
      }

      review.reported.users.push(userId);
      review.reported.count += 1;
      review.reported.reasons.push({
        user: userId,
        reason
      });

      // Auto-flag for moderation if reported multiple times
      if (review.reported.count >= 3) {
        review.status = 'pending';
      }

      await review.save();

      res.json({
        success: true,
        message: 'Review reported successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Moderate review (admin only)
  async moderateReview(req, res) {
    try {
      const userId = getUserId(req.user);
      const review = await Review.findById(req.params.id);
      const { status, reason } = req.body;

      if (!review) {
        return res.status(404).json({
          success: false,
          error: { message: 'Review not found' }
        });
      }

      review.status = status;
      review.moderation = {
        moderatedBy: userId,
        moderatedAt: new Date(),
        reason
      };

      await review.save();

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }
}

module.exports = new ReviewController();
