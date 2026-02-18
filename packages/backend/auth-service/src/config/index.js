require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

// Validate required secrets in production
if (nodeEnv === 'production') {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27019/har_auth',
  jwt: {
    secret: process.env.JWT_SECRET || (nodeEnv !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : undefined),
    refreshSecret: process.env.JWT_REFRESH_SECRET || (nodeEnv !== 'production' ? 'dev-only-refresh-secret-do-not-use-in-prod' : undefined),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@har-academy.com',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  }
};