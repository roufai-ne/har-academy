const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../../src/services/auth-service');
const User = require('../../src/models/user');
const { CustomError } = require('../../src/utils/errors');

// Mock User model
jest.mock('../../src/models/user');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'User',
    };

    it('should successfully register a new user', async () => {
      const mockSavedUser = {
        _id: 'user123',
        ...mockUserData,
        save: jest.fn().mockResolvedValue(this),
        getPublicProfile: jest.fn(() => ({ id: 'user123' })),
        generateToken: jest.fn(() => 'token123'),
        generateRefreshToken: jest.fn(() => 'refresh123'),
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockSavedUser);

      const result = await AuthService.register(mockUserData);

      expect(mockSavedUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        user: { id: 'user123' },
        token: 'token123',
        refresh_token: 'refresh123',
      });
      expect(User.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
    });

    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValue({ email: mockUserData.email });

      await expect(AuthService.register(mockUserData)).rejects.toThrow(CustomError);
      expect(User.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
    });
  });

  describe('login', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      status: 'active',
      comparePassword: jest.fn(),
      save: jest.fn(),
      getPublicProfile: jest.fn(() => ({ id: 'user123' })),
      generateToken: jest.fn(() => 'token123'),
      generateRefreshToken: jest.fn(() => 'refresh123'),
    };

    it('should successfully login a user', async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      const result = await AuthService.login('test@example.com', 'Test123!');

      expect(result).toEqual({
        user: { id: 'user123' },
        token: 'token123',
        refresh_token: 'refresh123',
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(AuthService.login('test@example.com', 'Test123!')).rejects.toThrow(CustomError);
    });

    it('should throw error if user is not active', async () => {
      User.findOne.mockResolvedValue({ ...mockUser, status: 'suspended' });

      await expect(AuthService.login('test@example.com', 'Test123!')).rejects.toThrow(CustomError);
    });

    it('should throw error if password is incorrect', async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await expect(AuthService.login('test@example.com', 'Test123!')).rejects.toThrow(CustomError);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if user exists', async () => {
      const mockUser = {
        _id: 'user123',
        getPublicProfile: jest.fn(() => ({ id: 'user123' })),
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await AuthService.getUserProfile('user123');

      expect(result).toEqual({ id: 'user123' });
      expect(User.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(AuthService.getUserProfile('user123')).rejects.toThrow(CustomError);
    });
  });

  describe('updateProfile', () => {
    const mockUpdateData = {
      first_name: 'Updated',
      last_name: 'User',
    };

    it('should successfully update user profile', async () => {
      const mockUser = {
        _id: 'user123',
        save: jest.fn(),
        getPublicProfile: jest.fn(() => ({ id: 'user123', ...mockUpdateData })),
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await AuthService.updateProfile('user123', mockUpdateData);

      expect(result).toEqual({ id: 'user123', ...mockUpdateData });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(AuthService.updateProfile('user123', mockUpdateData)).rejects.toThrow(CustomError);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn(() => true),
        save: jest.fn(),
      };

      User.findById.mockResolvedValue(mockUser);

      const result = await AuthService.changePassword('user123', 'oldPass', 'newPass');

      expect(result).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if old password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn(() => false),
      };

      User.findById.mockResolvedValue(mockUser);

      await expect(AuthService.changePassword('user123', 'wrongPass', 'newPass')).rejects.toThrow(CustomError);
    });
  });
});