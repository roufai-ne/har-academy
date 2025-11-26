const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  duration_minutes: {
    type: Number,
    default: 0
  },
  is_published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'modules'
});

// Indexes
moduleSchema.index({ course_id: 1, order: 1 });
moduleSchema.index({ is_published: 1 });

// Static method to get modules by course
moduleSchema.statics.findByCourse = function(courseId) {
  return this.find({ course_id: courseId }).sort({ order: 1 });
};

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
