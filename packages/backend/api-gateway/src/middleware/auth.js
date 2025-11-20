const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config');

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' }
      });
    }

    // Verify token with auth service
    try {
      const response = await axios.get(`${config.services.authService}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        req.user = response.data.data.user;
        next();
      } else {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid token' }
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token verification failed' }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error' }
    });
  }
};

// Role-based access control
const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const response = await axios.get(`${config.services.authService}/api/v1/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      req.user = response.data.data.user;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

module.exports = {
  verifyToken,
  requireRoles,
  optionalAuth
};
