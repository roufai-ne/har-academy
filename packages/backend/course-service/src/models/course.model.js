const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  short_description: {
    type: String,
    maxlength: 500
  },
  domain: {
    type: String,
    enum: ['Excel', 'R', 'Python', 'Other'],
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
    index: true
  },
  stack: [{
    type: String,
    trim: true
  }],
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    pricing_model: {
      type: String,
      enum: ['one-time', 'subscription'],
      default: 'one-time'
    }
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  instructor_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'Module'
  }],
  total_lessons: {
    type: Number,
    default: 0
  },
  total_duration_hours: {
    type: Number,
    default: 0
  },
  enrollments_count: {
    type: Number,
    default: 0,
    index: true
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  reviews_count: {
    type: Number,
    default: 0
  },
  keywords: [{
    type: String,
    trim: true
  }],
  image_url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  category: {
    type: String,
    required: false,
    index: true
  },
  language: {
    type: String,
    default: 'fr'
  },
  published_at: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'courses'
});

// Indexes
courseSchema.index({ title: 'text', description: 'text', keywords: 'text' });
courseSchema.index({ domain: 1, status: 1 });
courseSchema.index({ 'price.pricing_model': 1 });
courseSchema.index({ stack: 1 });
courseSchema.index({ instructor_id: 1, status: 1 });
courseSchema.index({ average_rating: -1, enrollments_count: -1 }); // For sorting popular courses

// Pre-save middleware to generate slug from title
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static method to find published courses
courseSchema.statics.findPublished = function(filters = {}) {
  return this.find({ ...filters, status: 'published' });
};

// Static method to find by instructor
courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor_id: instructorId }).sort({ created_at: -1 });
};

// Method to publish course
courseSchema.methods.publish = async function() {
  if (this.total_lessons === 0) {
    throw new Error('Cannot publish course with no lessons');
  }
  this.status = 'published';
  this.published_at = new Date();
  return this.save();
};

// Method to archive course
courseSchema.methods.archive = async function() {
  this.status = 'archived';
  return this.save();
};

// Virtual for final price (considering pricing model)
courseSchema.virtual('final_price').get(function() {
  return this.price.amount;
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
