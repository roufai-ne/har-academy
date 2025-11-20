const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    reasons: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  moderation: {
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for unique review per user per course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Statics method to calculate and update course rating
reviewSchema.statics.calculateCourseRating = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId, status: 'approved' } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Course').findByIdAndUpdate(courseId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings
    });
  } else {
    await mongoose.model('Course').findByIdAndUpdate(courseId, {
      averageRating: 0,
      totalRatings: 0
    });
  }
};

// Post save middleware to update course rating
reviewSchema.post('save', async function() {
  await this.constructor.calculateCourseRating(this.course);
});

// Post remove middleware to update course rating
reviewSchema.post('remove', async function() {
  await this.constructor.calculateCourseRating(this.course);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;