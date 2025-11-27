const app = require('./app');
const { connectDB } = require('./models');
const config = require('./config');
const logger = require('./utils/logger');
const redisClient = require('./utils/redis-client');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connection established');

    // Connect to Redis (optional, continues without it)
    await redisClient.connect();
    if (redisClient.isConnected) {
      logger.info('Redis connection established');
    } else {
      logger.warn('Redis not available, continuing without cache');
    }

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Auth Service running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await redisClient.disconnect();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
