const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const paymentRoutes = require('./routes/payment.routes');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : (config.nodeEnv === 'production' ? [] : ['http://localhost:3000', 'http://localhost:5173']),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Webhook route needs raw body (before JSON parsing)
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting on API routes
app.use('/api/v1/payments', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// Routes
app.use('/api/v1/payments', paymentRoutes);

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

module.exports = app;
