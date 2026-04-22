const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../users/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15d',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { name, email, password, confirmPassword, role } = req.body;

    // Validation: Check required fields
    if (!name || !email || !password || !confirmPassword) {
      console.log('\x1b[31m❌ Validation failed: Missing required fields\x1b[0m');
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, password, and confirm password are required.' 
      });
    }

    // Validation: Email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log('\x1b[31m❌ Validation failed: Invalid email format\x1b[0m');
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address.' 
      });
    }

    // Validation: Password length
    if (password.length < 6) {
      console.log('\x1b[31m❌ Validation failed: Password too short\x1b[0m');
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }

    // Validation: Password confirmation
    if (password !== confirmPassword) {
      console.log('\x1b[31m❌ Validation failed: Passwords do not match\x1b[0m');
      return res.status(400).json({ 
        success: false, 
        message: 'Password and confirm password do not match.' 
      });
    }

    // Validation: Name length
    if (name.length > 50) {
      console.log('\x1b[31m❌ Validation failed: Name too long\x1b[0m');
      return res.status(400).json({ 
        success: false, 
        message: 'Name cannot exceed 50 characters.' 
      });
    }

    // Check if user already exists using email
    console.log('\x1b[33m🔍 Checking if user exists...\x1b[0m');
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log('\x1b[31m❌ User already exists:\x1b[0m', email.toLowerCase());
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists.' 
      });
    }

    // Create user with validated data - password will be hashed automatically by User model pre-save hook
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by bcrypt in User model
      role: role || 'center_staff'
    };

    console.log('\x1b[32m💾 Creating new user in MongoDB...\x1b[0m', {
      name: userData.name,
      email: userData.email,
      role: userData.role
    });

    const newUser = await User.create(userData);

    console.log('\x1b[32m✅ User created successfully in MongoDB:\x1b[0m', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    });

    // Generate tokens
    const accessToken = generateToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('\x1b[32m🎉 Registration completed successfully!\x1b[0m');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        },
      },
    });
  } catch (error) {
    console.error('\x1b[31m❌ Registration error:\x1b[0m', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      console.log('\x1b[31m❌ MongoDB duplicate key error:\x1b[0m', { field, value: error.keyValue[field] });
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${field} already exists.` 
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('\x1b[31m❌ MongoDB validation error:\x1b[0m', messages);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    if (error.name === 'CastError') {
      console.log('\x1b[31m❌ MongoDB cast error:\x1b[0m', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format provided.' 
      });
    }

    // Generic error - return exact error message
    console.log('\x1b[31m❌ Registration error:\x1b[0m', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Your account has been deactivated' 
      });
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'No refresh token provided' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate new access token
    const accessToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Clear invalid refresh token
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(401).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
