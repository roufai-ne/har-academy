const mongoose = require('mongoose');

// Set test timeouts to 10 seconds
jest.setTimeout(10000);

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Close mongoose connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
});