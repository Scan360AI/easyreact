/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this value already exists',
          field: err.constraint
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing required field',
          message: `Field '${err.column}' is required`
        });
      default:
        return res.status(500).json({
          error: 'Database error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
        });
    }
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.details[0].message,
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};
