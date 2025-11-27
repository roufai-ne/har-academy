// Test data generators for Course Service
const mongoose = require('mongoose');

const generateValidCourseData = (overrides = {}) => ({
  title: 'Introduction to Python',
  description: 'Learn Python programming from scratch with hands-on examples',
  domain: 'Python',
  stack: ['Python', 'Django'],
  price: {
    amount: 49.99,
    currency: 'EUR',
    pricing_model: 'one-time'
  },
  language: 'fr',
  level: 'Beginner',
  ...overrides
});

const generateCourseForDB = (instructorId, overrides = {}) => ({
  ...generateValidCourseData(overrides),
  slug: `test-course-${Date.now()}`,
  instructor_id: instructorId,
  instructor_name: 'Test Instructor',
  status: 'published',
  ...overrides
});

const generateModuleData = (courseId, overrides = {}) => ({
  course_id: courseId,
  title: 'Module 1: Introduction',
  description: 'This is an introduction module with comprehensive content',
  order: 1,
  ...overrides
});

const generateLessonData = (moduleId, overrides = {}) => ({
  module_id: moduleId,
  title: 'Lesson 1: Getting Started',
  description: 'Learn the basics in this introductory lesson',
  content: 'This is the lesson content with detailed explanations',
  type: 'video',
  order: 1,
  ...overrides
});

module.exports = {
  generateValidCourseData,
  generateCourseForDB,
  generateModuleData,
  generateLessonData
};
