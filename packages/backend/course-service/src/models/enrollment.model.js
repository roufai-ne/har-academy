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
    default: null
  }
}, {
  timestamps: true
});

// Compound index for unique enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update progress calculation middleware
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('modulesProgress')) {
    const totalCompletedLessons = this.modulesProgress.reduce((sum, module) =>
      sum + module.completedLessons, 0);
    const totalLessons = this.modulesProgress.reduce((sum, module) =>
      sum + module.totalLessons, 0);

    this.progress = totalLessons > 0 ?
      Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

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
    let lessonProgress = moduleProgress.lessonsProgress.find(lp =>
      lp.lessonId.toString() === lessonId.toString());

    if (lessonProgress) {
      lessonProgress.completed = completed;
      lessonProgress.timeSpent += timeSpent || 0;
      lessonProgress.lastAccessedAt = new Date();
    } else {
      // Add new lesson progress entry if not found
      moduleProgress.lessonsProgress.push({
        lessonId,
        completed,
        timeSpent: timeSpent || 0,
        lastAccessedAt: new Date()
      });
    }

    // Update completed lessons count
    moduleProgress.completedLessons = moduleProgress.lessonsProgress.filter(
      lp => lp.completed
    ).length;

    this.lastAccessedAt = new Date();
    await this.save();
    return true;
  }
  return false;
};

// Method to initialize progress from modules and lessons
enrollmentSchema.methods.initializeProgress = async function(modules) {
  const Module = mongoose.model('Module');
  const Lesson = mongoose.model('Lesson');

  const populatedModules = await Promise.all(
    modules.map(async (moduleId) => {
      const mod = await Module.findById(moduleId);
      if (!mod) return null;
      const lessons = await Lesson.find({ module_id: moduleId });
      return { module: mod, lessons };
    })
  );

  this.modulesProgress = populatedModules
    .filter(Boolean)
    .map(({ module, lessons }) => ({
      moduleId: module._id,
      lessonsProgress: lessons.map(lesson => ({
        lessonId: lesson._id,
        completed: false,
        timeSpent: 0
      })),
      completedLessons: 0,
      totalLessons: lessons.length
    }));

  return this;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
