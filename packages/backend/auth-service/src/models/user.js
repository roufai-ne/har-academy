const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format',
    },
  },
  password_hash: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar_url: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['learner', 'instructor', 'admin'],
    default: 'learner',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },
  language: {
    type: String,
    default: 'fr',
  },
  instructor_info: {
    bio: String,
    expertise_tags: [String],
    total_courses: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    verification_status: {
      type: String,
      enum: ['unverified', 'verified', 'rejected'],
      default: 'unverified',
    },
  },
  notification_settings: {
    email_notifications: {
      type: Boolean,
      default: true,
    },
    marketing_emails: {
      type: Boolean,
      default: false,
    },
    newsletter: {
      type: Boolean,
      default: true,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  last_login_at: Date,
  is_verified: {
    type: Boolean,
    default: false,
  },
  verification_token: String,
  reset_password_token: String,
  reset_password_expires: Date,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'instructor_info.expertise_tags': 1 });
userSchema.index({ reset_password_token: 1 });
userSchema.index({ verification_token: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password_hash')) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  this.updated_at = new Date();
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Method to generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      user_id: this._id,
      email: this.email,
      role: this.role,
      first_name: this.first_name,
      last_name: this.last_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      user_id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

// Method to return public profile
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    first_name: this.first_name,
    last_name: this.last_name,
    avatar_url: this.avatar_url,
    role: this.role,
    instructor_info: this.role === 'instructor' ? this.instructor_info : undefined,
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Alias for generateToken (used in controller)
userSchema.methods.generateAuthToken = userSchema.methods.generateToken;

const User = mongoose.model('User', userSchema);

module.exports = User;