const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path[0]] = detail.message;
      });

      return res.status(400).json({
        success: false,
        error: {
          type: 'ValidationError',
          errors
        }
      });
    }

    next();
  };
};

// Course validation schemas
const courseSchema = Joi.object({
  title: Joi.string().required().min(5).max(100),
  description: Joi.string().required().min(20).max(2000),
  category: Joi.string().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  price: Joi.number().min(0).required(),
  thumbnail: Joi.string().uri(),
  tags: Joi.array().items(Joi.string()),
  prerequisites: Joi.array().items(Joi.string()),
  learningOutcomes: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean()
});

const moduleSchema = Joi.object({
  title: Joi.string().required().min(5).max(100),
  description: Joi.string().required().min(20).max(1000),
  order: Joi.number(),
  isPublished: Joi.boolean()
});

const lessonSchema = Joi.object({
  title: Joi.string().required().min(5).max(100),
  description: Joi.string().required().min(20).max(1000),
  content: Joi.string().required(),
  duration: Joi.number().required().min(1),
  resourceUrls: Joi.array().items(Joi.string().uri()),
  order: Joi.number(),
  isPublished: Joi.boolean()
});

// Enrollment validation schemas
const enrollmentSchema = Joi.object({
  courseId: Joi.string().required(),
  paymentId: Joi.string().required()
});

const progressSchema = Joi.object({
  moduleId: Joi.string().required(),
  lessonId: Joi.string().required(),
  completed: Joi.boolean().required(),
  timeSpent: Joi.number().min(0).required()
});

// Review validation schemas
const reviewSchema = Joi.object({
  courseId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  title: Joi.string().required().min(5).max(100),
  content: Joi.string().required().min(20).max(1000)
});

const moderationSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reason: Joi.string().when('status', {
    is: 'rejected',
    then: Joi.string().required().min(10),
    otherwise: Joi.string().optional()
  })
});

// Category validation schemas
const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().required().min(10).max(500),
  icon: Joi.string().uri(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  parent: Joi.string(),
  order: Joi.number(),
  isActive: Joi.boolean(),
  metadata: Joi.object({
    seoTitle: Joi.string(),
    seoDescription: Joi.string(),
    seoKeywords: Joi.array().items(Joi.string())
  })
});

module.exports = {
  validate,
  schemas: {
    course: courseSchema,
    module: moduleSchema,
    lesson: lessonSchema,
    enrollment: enrollmentSchema,
    progress: progressSchema,
    review: reviewSchema,
    moderation: moderationSchema,
    category: categorySchema
  }
};