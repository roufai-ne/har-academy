require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/har_payments',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceIds: {
      basic_monthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY,
      basic_yearly: process.env.STRIPE_PRICE_ID_BASIC_YEARLY,
      pro_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      pro_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
      premium_monthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
      premium_yearly: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  services: {
    courseServiceUrl: process.env.COURSE_SERVICE_URL || 'http://localhost:3001',
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3000'
  },
  serviceSecret: process.env.SERVICE_SECRET || 'service-to-service-secret'
};