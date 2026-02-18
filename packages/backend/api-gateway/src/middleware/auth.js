const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config');

const nodeEnv = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || (nodeEnv !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : undefined);
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// JWT verification middleware — local verify first, remote fallback
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' }
      });
    }

    // Try local JWT verification first (faster, no network call)
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      req.user = {
        user_id: decoded.user_id,
        id: decoded.user_id,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    } catch (localErr) {
      // If local verification fails, try remote auth service
      try {
        const response = await axios.get(
          `${config.services.authService}/api/v1/auth/verify-jwt`,
          { headers: { 'Authorization': `Bearer ${token}` }, timeout: 3000 }
        );

        if (response.data.success) {
          req.user = response.data.data.user;
          return next();
        }
      } catch (remoteErr) {
        // Both local and remote failed
      }

      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' }
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
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = {
      user_id: decoded.user_id,
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };
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
