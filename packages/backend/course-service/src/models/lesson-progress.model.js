const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonProgressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lesson_id: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
    index: true
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  module_id: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress_percent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  time_spent_seconds: {
    type: Number,
    default: 0,
    min: 0
  },
  last_position_seconds: {
    type: Number,
    default: 0,
    min: 0
  },
  completed_at: {
    type: Date,
    default: null
  },
  quiz_score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'lesson_progress'
});

// Compound indexes
lessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });
lessonProgressSchema.index({ user_id: 1, course_id: 1 });
lessonProgressSchema.index({ user_id: 1, module_id: 1 });
lessonProgressSchema.index({ status: 1 });

// Pre-save middleware to set completed_at
lessonProgressSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completed_at) {
    this.completed_at = new Date();
  }
  next();
});

// Static method to get user's course progress
lessonProgressSchema.statics.getCourseProgress = async function(userId, courseId) {
  const progress = await this.find({ user_id: userId, course_id: courseId });
  
  const totalLessons = progress.length;
  const completedLessons = progress.filter(p => p.status === 'completed').length;
  const totalTimeSpent = progress.reduce((sum, p) => sum + p.time_spent_seconds, 0);
  const averageProgress = progress.reduce((sum, p) => sum + p.progress_percent, 0) / (totalLessons || 1);

  return {
    totalLessons,
    completedLessons,
    completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    totalTimeSpentSeconds: totalTimeSpent,
    averageProgress
  };
};

// Static method to get user's module progress
lessonProgressSchema.statics.getModuleProgress = async function(userId, moduleId) {
  const progress = await this.find({ user_id: userId, module_id: moduleId });
  
  const totalLessons = progress.length;
  const completedLessons = progress.filter(p => p.status === 'completed').length;

  return {
    totalLessons,
    completedLessons,
    completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  };
};

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);

module.exports = LessonProgress;
