require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

// Validate required secrets in production
if (nodeEnv === 'production') {
  const required = ['JWT_SECRET', 'SERVICE_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  port: process.env.PORT || 3003,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/har_payments',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceIds: {
      basic_monthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY,
      basic_yearly: process.env.STRIPE_PRICE_ID_BASIC_YEARLY,
      pro_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      pro_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
      enterprise_monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
      enterprise_yearly: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || (nodeEnv !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : undefined),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  services: {
    courseServiceUrl: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  },
  serviceSecret: process.env.SERVICE_SECRET || (nodeEnv !== 'production' ? 'dev-only-service-secret-do-not-use-in-prod' : undefined)
};