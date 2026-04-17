const jwt        = require('jsonwebtoken');
const User        = require('../models/User');
const catchAsync  = require('../shared/utils/catchAsync');
const apiResponse = require('../shared/utils/apiResponse');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * On success, attaches the full user document to req.user.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiResponse(res, 401, 'Authentication token missing or malformed.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    return apiResponse(res, 401, msg);
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    return apiResponse(res, 401, 'Account not found or deactivated.');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
