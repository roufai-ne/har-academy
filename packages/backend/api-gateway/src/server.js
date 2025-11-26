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
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

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
  payments: {
    target: config.services.paymentService,
    pathRewrite: { '^/api/v1/payments': '/api/v1/payments' }
  },
  ai: {
    target: config.services.aiService,
    pathRewrite: { '^/api/v1/ai': '/api/v1' }
  }
};

// Create proxies
Object.entries(services).forEach(([name, serviceConfig]) => {
  console.log(`Setting up proxy for /api/v1/${name} -> ${serviceConfig.target}`);
  app.use(
    `/api/v1/${name}`,
    createProxyMiddleware({
      target: serviceConfig.target,
      changeOrigin: true,
      pathRewrite: serviceConfig.pathRewrite,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${serviceConfig.target}${proxyReq.path}`);
        
        // Re-stream the body if it exists
        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
        
        logger.info(`Proxying ${req.method} ${req.path} to ${name} service`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy Response] Status: ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.log(`[Proxy Error] ${err.message}`);
        logger.error(`Proxy error for ${name} service:`, err);
        res.status(502).json({
          success: false,
          error: { message: `Service ${name} unavailable` }
        });
      }
    })
  );
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
