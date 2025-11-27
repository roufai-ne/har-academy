const User = require('../models/user');
const { CustomError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  static async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new CustomError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    const user = new User({
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || 'learner',
      language: userData.language || 'fr',
      password_hash: userData.password, // Will be hashed by mongoose middleware
    });
    
    // Explicitly mark password_hash as modified to trigger pre-save hook
    // Only call markModified if using a real mongoose document (mocks may not implement it)
    if (typeof user.markModified === 'function') {
      user.markModified('password_hash');
    }

    await user.save();
    logger.info('New user registered:', { userId: user._id, email: user.email });

    const token = user.generateToken();
    const refresh_token = user.generateRefreshToken();

    return {
      user: user.getPublicProfile(),
      token,
      refresh_token,
    };
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      throw new CustomError('Account is not active', 403, 'ACCOUNT_INACTIVE');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new CustomError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    user.last_login_at = new Date();
    await user.save();

    logger.info('User logged in:', { userId: user._id, email: user.email });

    const token = user.generateToken();
    const refresh_token = user.generateRefreshToken();

    return {
      user: user.getPublicProfile(),
      token,
      refresh_token,
    };
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user_id);

      if (!user || user.status !== 'active') {
        throw new CustomError('Invalid token', 401, 'INVALID_TOKEN');
      }

      return {
        valid: true,
        user_id: user._id,
      };
    } catch (err) {
      throw new CustomError('Invalid token', 401, 'INVALID_TOKEN');
    }
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.user_id);

      if (!user || user.status !== 'active') {
        throw new CustomError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      const newToken = user.generateToken();
      return { token: newToken };
    } catch (err) {
      throw new CustomError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }
  }

  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user.getPublicProfile();
  }

  static async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }

    Object.assign(user, updateData);
    await user.save();

    logger.info('User profile updated:', { userId: user._id });
    return user.getPublicProfile();
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) {
      throw new CustomError('Invalid old password', 400, 'INVALID_PASSWORD');
    }

    user.password_hash = newPassword;
    await user.save();

    logger.info('User password changed:', { userId: user._id });
    return true;
  }

  static async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return true;
    }

    // TODO: Implement email sending logic
    logger.info('Password reset requested:', { userId: user._id, email });
    return true;
  }

  static async resetPassword(token, newPassword) {
    try {
      // TODO: Implement password reset token validation
      logger.info('Password reset completed');
      return true;
    } catch (err) {
      throw new CustomError('Invalid reset token', 401, 'INVALID_TOKEN');
    }
  }
}

module.exports = AuthService;