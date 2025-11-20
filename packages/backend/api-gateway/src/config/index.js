require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
    courseService: process.env.COURSE_SERVICE_URL || 'http://localhost:3001',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002',
    aiService: process.env.AI_SERVICE_URL || 'http://localhost:8001'
  }
};
