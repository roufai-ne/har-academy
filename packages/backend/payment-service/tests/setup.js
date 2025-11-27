const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start MongoMemoryServer:', error.message);
    // If MongoMemoryServer fails, tests should fail
    throw error;
  }
}, 60000); // Increase timeout for downloading MongoDB binary

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clear database between tests
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

