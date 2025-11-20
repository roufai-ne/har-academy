const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    const errors = {};
    for (let field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      success: false,
      error: {
        type: 'ValidationError',
        errors
      }
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'DuplicateError',
        message: 'A record with this information already exists'
      }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        type: 'InvalidIdError',
        message: 'Invalid ID format'
      }
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: {
      type: 'ServerError',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    }
  });
};

module.exports = errorHandler;