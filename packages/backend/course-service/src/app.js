const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const connectDB = require('./utils/db');
const logger = require('./utils/logger');
const redisClient = require('./utils/redis-client');
const errorHandler = require('./middleware/error.middleware');
const routes = require('./routes');

// Create Express app
const app = express();

// Connect to MongoDB only if not in test mode or if explicitly needed
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  
  // Connect to Redis (optional, continues without it)
  redisClient.connect().then(() => {
    if (redisClient.isConnected) {
      logger.info('Redis connection established');
    } else {
      logger.warn('Redis not available, continuing without cache');
    }
  }).catch(err => {
    logger.warn('Redis connection failed, continuing without cache:', err.message);
  });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.app.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan(config.logging.format, { stream: logger.stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: config.app.name,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NotFoundError',
      message: 'The requested resource was not found'
    }
  });
});

// Error handler
app.use(errorHandler);

// Export app for testing
module.exports = app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const server = app.listen(config.app.port, () => {
    logger.info(`Server running in ${config.app.env} mode on port ${config.app.port}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}