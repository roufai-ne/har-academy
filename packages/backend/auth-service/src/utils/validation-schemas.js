const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
    }),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  role: Joi.string().valid('learner', 'instructor').default('learner'),
  language: Joi.string().valid('fr', 'en').default('fr'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  avatar_url: Joi.string().uri(),
  language: Joi.string().valid('fr', 'en'),
  instructor_info: Joi.object({
    bio: Joi.string(),
    expertise: Joi.array().items(Joi.string()),
    experience_years: Joi.number(),
  }),
});

const changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};