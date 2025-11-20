require('dotenv').config();

const config = {
  app: {
    name: 'har-academy-course-service',
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/har-academy-courses',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003'
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'har-academy-courses'
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },
  cache: {
    ttl: process.env.CACHE_TTL || 3600,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    }
  },
  limits: {
    maxEnrollmentsPerUser: process.env.MAX_ENROLLMENTS_PER_USER || 10,
    maxCoursesPerInstructor: process.env.MAX_COURSES_PER_INSTRUCTOR || 50,
    maxModulesPerCourse: process.env.MAX_MODULES_PER_COURSE || 20,
    maxLessonsPerModule: process.env.MAX_LESSONS_PER_MODULE || 30
  }
};

module.exports = config;