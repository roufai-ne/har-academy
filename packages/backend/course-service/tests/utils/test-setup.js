const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');

let mongoServer;

// Connect to the in-memory database
module.exports.connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

// Clear all test data after every test
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

// Remove and close the db and server
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

// Generate test JWT tokens
module.exports.generateToken = (userData) => {
  return jwt.sign(userData, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Test user data
module.exports.testUsers = {
  admin: {
    id: new mongoose.Types.ObjectId(),
    name: 'Admin User',
    email: 'admin@haracademy.com',
    role: 'admin'
  },
  instructor: {
    id: new mongoose.Types.ObjectId(),
    name: 'Test Instructor',
    email: 'instructor@haracademy.com',
    role: 'instructor'
  },
  student: {
    id: new mongoose.Types.ObjectId(),
    name: 'Test Student',
    email: 'student@haracademy.com',
    role: 'student'
  }
};

// Test data generators
module.exports.generateCourseData = (overrides = {}) => ({
  title: 'Test Course',
  description: 'This is a test course description that meets the minimum length requirement',
  category: new mongoose.Types.ObjectId(),
  level: 'beginner',
  price: 99.99,
  instructor: this.testUsers.instructor.id,
  thumbnail: 'https://example.com/thumbnail.jpg',
  tags: ['test', 'programming'],
  prerequisites: ['Basic programming knowledge'],
  learningOutcomes: ['Understand testing principles'],
  isPublished: false,
  ...overrides
});

module.exports.generateModuleData = (overrides = {}) => ({
  title: 'Test Module',
  description: 'This is a test module description that meets the minimum length requirement',
  order: 1,
  isPublished: false,
  ...overrides
});

module.exports.generateLessonData = (overrides = {}) => ({
  title: 'Test Lesson',
  description: 'This is a test lesson description that meets the minimum length requirement',
  content: 'This is the lesson content',
  duration: 30,
  resourceUrls: ['https://example.com/resource.pdf'],
  order: 1,
  isPublished: false,
  ...overrides
});

module.exports.generateCategoryData = (overrides = {}) => ({
  name: 'Test Category',
  description: 'This is a test category description',
  slug: 'test-category',
  icon: 'https://example.com/icon.png',
  color: '#FF0000',
  isActive: true,
  order: 1,
  ...overrides
});