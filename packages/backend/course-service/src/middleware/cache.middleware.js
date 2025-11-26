const redisClient = require('../utils/redis-client');
const logger = require('../utils/logger');

/**
 * Cache middleware for GET requests
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 */
function cacheMiddleware(ttl = 3600) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if Redis not connected
    if (!redisClient.isConnected) {
      return next();
    }

    try {
      // Generate cache key from URL and query params
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      
      // Try to get cached data
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      logger.info(`Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        redisClient.set(cacheKey, data, ttl).catch(err => {
          logger.error('Failed to cache response:', err);
        });

        // Send the response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:/courses*')
 */
async function invalidateCache(pattern) {
  if (!redisClient.isConnected) return;

  try {
    // Note: In production, use Redis SCAN instead of KEYS for better performance
    const keys = await redisClient.client.keys(pattern);
    if (keys.length > 0) {
      await redisClient.client.del(keys);
      logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

module.exports = {
  cacheMiddleware,
  invalidateCache
};
