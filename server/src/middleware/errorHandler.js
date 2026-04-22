/**
 * Global error handler — must be registered LAST in app.js.
 *
 * Handles:
 *   - Mongoose CastError (bad ObjectId)
 *   - Mongoose duplicate key (code 11000)
 *   - Mongoose ValidationError
 *   - Generic / unhandled errors
 */
const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 ERROR:', err);
  }

  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal server error.';

  // Bad MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid value for field: ${err.path}`;
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    statusCode = 409;
    message    = `Duplicate value for: ${field}`;
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = Object.values(err.errors).map((e) => e.message).join('; ');
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
