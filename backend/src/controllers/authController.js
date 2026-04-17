const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../shared/utils/catchAsync');
const apiResponse = require('../shared/utils/apiResponse');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

// Register user (for initial setup)
exports.register = catchAsync(async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse.error(res, 400, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      address
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    await user.updateLastLogin();

    apiResponse.success(res, 'User registered successfully', {
      user,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    apiResponse.error(res, 500, 'Failed to register user');
  }
});

// Login user
exports.login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user) {
      return apiResponse.error(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return apiResponse.error(res, 401, 'Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    await user.updateLastLogin();

    // Remove password from response
    const userWithoutPassword = user.toJSON();

    apiResponse.success(res, 'Login successful', {
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    apiResponse.error(res, 500, 'Failed to login');
  }
});

// Refresh token
exports.refreshToken = catchAsync(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return apiResponse.error(res, 401, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return apiResponse.error(res, 401, 'User not found or inactive');
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    apiResponse.success(res, 'Token refreshed successfully', {
      token: newToken,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    apiResponse.error(res, 401, 'Invalid refresh token');
  }
});

// Logout user
exports.logout = catchAsync(async (req, res) => {
  try {
    // In a real implementation, you might want to invalidate the token
    // For now, we'll just return success
    apiResponse.success(res, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    apiResponse.error(res, 500, 'Failed to logout');
  }
});

// Get current user profile
exports.getProfile = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return apiResponse.error(res, 404, 'User not found');
    }

    apiResponse.success(res, 'Profile retrieved successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    apiResponse.error(res, 500, 'Failed to get profile');
  }
});

// Update profile
exports.updateProfile = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse.error(res, 404, 'User not found');
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    apiResponse.success(res, 'Profile updated successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    apiResponse.error(res, 500, 'Failed to update profile');
  }
});

// Change password
exports.changePassword = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return apiResponse.error(res, 400, 'Current password and new password are required');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return apiResponse.error(res, 404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return apiResponse.error(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    apiResponse.success(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    apiResponse.error(res, 500, 'Failed to change password');
  }
});

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).sort({ createdAt: -1 });
    
    apiResponse.success(res, 'Users retrieved successfully', {
      users: users.map(user => user.toJSON())
    });
  } catch (error) {
    console.error('Get all users error:', error);
    apiResponse.error(res, 500, 'Failed to get users');
  }
});

// Create user (admin only)
exports.createUser = catchAsync(async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse.error(res, 400, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      address
    });

    await user.save();

    apiResponse.success(res, 'User created successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    apiResponse.error(res, 500, 'Failed to create user');
  }
});

// Update user status (admin only)
exports.updateUserStatus = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return apiResponse.error(res, 404, 'User not found');
    }

    user.isActive = isActive;
    await user.save();

    apiResponse.success(res, 'User status updated successfully', {
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    apiResponse.error(res, 500, 'Failed to update user status');
  }
});
