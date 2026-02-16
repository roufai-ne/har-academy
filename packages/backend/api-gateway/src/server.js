const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const config = require('./config');

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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests from this IP' } }
});
app.use(limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many auth attempts, please try again later' } }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    uptime: process.uptime()
  });
});

// Service routes with proxy
const services = {
  auth: {
    target: config.services.authService,
    pathRewrite: { '^/api/v1/auth': '/api/v1/auth' }
  },
  courses: {
    target: config.services.courseService,
    pathRewrite: { '^/api/v1/courses': '/api/v1/courses' }
  },
  enrollments: {
    target: config.services.courseService,
    pathRewrite: { '^/api/v1/enrollments': '/api/v1/enrollments' }
  },
  categories: {
    target: config.services.courseService,
    pathRewrite: { '^/api/v1/categories': '/api/v1/categories' }
  },
  reviews: {
    target: config.services.courseService,
    pathRewrite: { '^/api/v1/reviews': '/api/v1/reviews' }
  },
  payments: {
    target: config.services.paymentService,
    pathRewrite: { '^/api/v1/payments': '/api/v1/payments' }
  },
  ai: {
    target: config.services.aiService,
    pathRewrite: { '^/api/v1/ai': '/api/v1' }
  }
};

// Shared proxy options
const createProxy = (name, serviceConfig) =>
  createProxyMiddleware({
    target: serviceConfig.target,
    changeOrigin: true,
    pathRewrite: serviceConfig.pathRewrite,
    logLevel: 'warn',
    timeout: 30000,
    proxyTimeout: 30000,
    onProxyReq: (proxyReq, req) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
      logger.info(`Proxying ${req.method} ${req.path}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${name}: ${err.message}`);
      res.status(502).json({
        success: false,
        error: { message: 'Backend service unavailable' }
      });
    }
  });

// Apply auth rate limiter to auth routes
app.use('/api/v1/auth', authLimiter, createProxy('auth', services.auth));

// Other proxies
Object.entries(services).forEach(([name, serviceConfig]) => {
  if (name === 'auth') return; // already registered above
  logger.info(`Setting up proxy for /api/v1/${name} -> ${serviceConfig.target}`);
  app.use(`/api/v1/${name}`, createProxy(name, serviceConfig));
});

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
  logger.info(`Proxying to services: ${Object.keys(services).join(', ')}`);
});

module.exports = app;
