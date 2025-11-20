const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('./test-setup');

class TestClient {
  constructor(userData = null) {
    this.app = app;
    this.token = userData ? generateToken(userData) : null;
  }

  // GET request
  async get(url) {
    const req = request(this.app).get(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  // POST request
  async post(url, data) {
    const req = request(this.app).post(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req.send(data);
  }

  // PUT request
  async put(url, data) {
    const req = request(this.app).put(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req.send(data);
  }

  // DELETE request
  async delete(url) {
    const req = request(this.app).delete(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
}

module.exports = TestClient;