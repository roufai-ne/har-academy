const logger = require('../utils/logger');

// In-memory rate limiter (use Redis in production for multi-instance)
const requestCounts = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts) {
    if (now - data.windowStart > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

function rateLimiter({ windowMs = 60 * 1000, maxRequests = 100, keyGenerator, message } = {}) {
  return (req, res, next) => {
    const key = keyGenerator
      ? keyGenerator(req)
      : (req.user?.user_id || req.ip);

    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      requestCounts.set(key, { count: 1, windowStart: now, windowMs });
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      logger.warn(`Rate limit exceeded for ${key}: ${entry.count}/${maxRequests}`);

      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        error: {
          message: message || 'Too many requests. Please try again later.',
          retryAfter
        }
      });
    }

    next();
  };
}

// Pre-configured limiters
const paymentLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many payment attempts. Please try again in 15 minutes.'
});

const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests. Please slow down.'
});

const webhookLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 200,
  keyGenerator: (req) => req.ip,
  message: 'Too many webhook requests.'
});

module.exports = {
  rateLimiter,
  paymentLimiter,
  apiLimiter,
  webhookLimiter
};
