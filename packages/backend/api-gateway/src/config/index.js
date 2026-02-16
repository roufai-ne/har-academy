require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  const required = ['JWT_SECRET', 'CORS_ORIGIN'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv,
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
      : (nodeEnv === 'production' ? [] : ['http://localhost:3000', 'http://localhost:5173']),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600
  },
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    courseService: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
    aiService: process.env.AI_SERVICE_URL || 'http://localhost:5000'
  }
};
