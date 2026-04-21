const jwt        = require('jsonwebtoken');
const User        = require('../users/user.model');
const catchAsync  = require('../../shared/utils/catchAsync');
const apiResponse = require('../../shared/utils/apiResponse');

// ─── Helpers ───────────────────────────────────────────────────────────────────

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

// ─── Register ─────────────────────────────────────────────────────────────────

exports.register = catchAsync(async (req, res) => {
  console.log("REQ BODY:", req.body);
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return apiResponse(res, 409, 'An account with that email already exists.');
  }

  const user = await User.create({ name, email, password, role });

  return apiResponse(res, 201, 'Account created successfully.', { user });
});

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    return apiResponse(res, 401, 'Invalid credentials.');
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    return apiResponse(res, 401, 'Invalid credentials.');
  }

  const accessToken  = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // httpOnly cookie for the refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return apiResponse(res, 200, 'Login successful.', {
    accessToken,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
});

// ─── Refresh token ────────────────────────────────────────────────────────────

exports.refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return apiResponse(res, 401, 'Refresh token missing.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return apiResponse(res, 401, 'Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return apiResponse(res, 401, 'Account not found or deactivated.');
  }

  const accessToken = signAccessToken(user._id);
  return apiResponse(res, 200, 'Token refreshed.', { accessToken });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  return apiResponse(res, 200, 'Logged out successfully.');
});
