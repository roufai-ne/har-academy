const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonProgressSchema = new Schema({
  lessonId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,  // in seconds
    default: 0
  },
  lastAccessedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const moduleProgressSchema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  lessonsProgress: [lessonProgressSchema],
  completedLessons: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const enrollmentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'refunded'],
    default: 'active',
    index: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,  // percentage
    default: 0,
    index: true
  },
  modulesProgress: [moduleProgressSchema],
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date
    },
    certificateUrl: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: Date
  },
  paymentId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update progress calculation middleware
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('modulesProgress')) {
    const totalModules = this.modulesProgress.length;
    const totalCompletedLessons = this.modulesProgress.reduce((sum, module) => 
      sum + module.completedLessons, 0);
    const totalLessons = this.modulesProgress.reduce((sum, module) => 
      sum + module.totalLessons, 0);
    
    this.progress = totalLessons > 0 ? 
      (totalCompletedLessons / totalLessons) * 100 : 0;

    // Check if course is completed
    if (this.progress === 100 && !this.completedAt) {
      this.completedAt = new Date();
      this.status = 'completed';
    }
  }
  next();
});

// Method to update lesson progress
enrollmentSchema.methods.updateLessonProgress = async function(moduleId, lessonId, completed, timeSpent) {
  const moduleProgress = this.modulesProgress.find(mp => 
    mp.moduleId.toString() === moduleId.toString());
  
  if (moduleProgress) {
    const lessonProgress = moduleProgress.lessonsProgress.find(lp => 
      lp.lessonId.toString() === lessonId.toString());
    
    if (lessonProgress) {
      lessonProgress.completed = completed;
      lessonProgress.timeSpent += timeSpent;
      lessonProgress.lastAccessedAt = new Date();

      // Update completed lessons count
      moduleProgress.completedLessons = moduleProgress.lessonsProgress.filter(
        lp => lp.completed
      ).length;

      await this.save();
      return true;
    }
  }
  return false;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;