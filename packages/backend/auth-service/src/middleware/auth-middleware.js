const jwt = require('jsonwebtoken');
const { CustomError } = require('../utils/errors');
const logger = require('../utils/logger');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new CustomError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.status !== 'active') {
      throw new CustomError('User account is not active', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new CustomError('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      next(new CustomError('Token expired', 401));
    } else {
      next(err);
    }
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new CustomError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};