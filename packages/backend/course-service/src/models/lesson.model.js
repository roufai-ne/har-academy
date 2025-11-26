const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  duration_seconds: {
    type: Number,
    required: true,
    min: 0
  },
  transcript: {
    type: String,
    default: ''
  },
  thumbnail_url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}, { _id: false });

const lessonSchema = new Schema({
  module_id: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
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
  content: {
    type: String,
    default: ''
  },
  video: {
    type: videoSchema,
    default: null
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment'],
    default: 'video'
  },
  quiz_id: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  resource_urls: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }],
  order: {
    type: Number,
    required: true,
    default: 1
  },
  is_published: {
    type: Boolean,
    default: false
  },
  is_free_preview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'lessons'
});

// Indexes
lessonSchema.index({ module_id: 1, order: 1 });
lessonSchema.index({ is_published: 1 });
lessonSchema.index({ type: 1 });

// Virtual for duration in minutes (from video.duration_seconds)
lessonSchema.virtual('duration_minutes').get(function() {
  if (this.video && this.video.duration_seconds) {
    return Math.ceil(this.video.duration_seconds / 60);
  }
  return 0;
});

// Static method to get lessons by module
lessonSchema.statics.findByModule = function(moduleId) {
  return this.find({ module_id: moduleId }).sort({ order: 1 });
};

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
