const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const config = require('./config');
const { verifyToken, optionalAuth } = require('./middleware/auth');

const app = express();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'logs/gateway.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'api-gateway',
    uptime: process.uptime()
  });
});

// Service routes with proxy configuration
const createProxy = (target, pathRewrite) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req, res) => {
      // Forward user info if authenticated
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
      logger.info(`Proxying ${req.method} ${req.path} to ${target}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error:`, err);
      res.status(502).json({
        success: false,
        error: { message: 'Service unavailable' }
      });
    }
  });
};

// Auth routes (public + protected)
app.use('/api/auth', createProxy(
  config.services.authService,
  { '^/api/auth': '/api/v1/auth' }
));

// Course routes (public listing, protected actions)
app.use('/api/courses', optionalAuth, createProxy(
  config.services.courseService,
  { '^/api/courses': '/api/v1/courses' }
));

// Payment routes (protected)
app.use('/api/payments', verifyToken, createProxy(
  config.services.paymentService,
  { '^/api/payments': '/api/v1/payments' }
));

// AI routes (protected)
app.use('/api/ai', verifyToken, createProxy(
  config.services.aiService,
  { '^/api/ai': '/api/v1' }
));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Proxying to services:');
  logger.info(`  - Auth Service: ${config.services.authService}`);
  logger.info(`  - Course Service: ${config.services.courseService}`);
  logger.info(`  - Payment Service: ${config.services.paymentService}`);
  logger.info(`  - AI Service: ${config.services.aiService}`);
});

module.exports = app;
