require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import User model
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vinofyx:Vinofyx123@ac-sxbjm2b-shard-00-00.dvgn0l5.mongodb.net/logistics_db');
    console.log(`\n=== MongoDB Connected ===`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (err) {
    console.error(`\n=== MongoDB Connection Error ===`);
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: "API is running." });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n=== REGISTER REQUEST ===');
    console.log('Request body:', req.body);
    
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
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
    console.log('User saved to MongoDB:', user);

    // Generate tokens (simplified)
    const token = 'simple-jwt-token-' + Date.now();
    const refreshToken = 'simple-refresh-token-' + Date.now();

    // Remove password from response
    const userWithoutPassword = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n=== LOGIN REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens (simplified)
    const token = 'simple-jwt-token-' + Date.now();
    const refreshToken = 'simple-refresh-token-' + Date.now();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userWithoutPassword = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Mock data endpoints for dashboard
app.get('/api/pickups', (req, res) => {
  const mockPickups = [
    {
      _id: '1',
      pickupId: 'PU001',
      name: 'John Doe',
      phone: '9876543210',
      address: '123 Main St',
      pickupDate: '2026-04-19',
      pickupTime: '10:00',
      status: 'Pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      pickupId: 'PU002',
      name: 'Jane Smith',
      phone: '9876543211',
      address: '456 Oak Ave',
      pickupDate: '2026-04-19',
      pickupTime: '14:00',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Pickups retrieved successfully',
    data: mockPickups
  });
});

app.get('/api/parcels', (req, res) => {
  const mockParcels = [
    {
      _id: '1',
      trackingId: 'TRK001',
      status: 'In Transit',
      origin: 'New York',
      destination: 'Los Angeles',
      weight: '2.5kg',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      trackingId: 'TRK002',
      status: 'Delivered',
      origin: 'Chicago',
      destination: 'Houston',
      weight: '1.8kg',
      createdAt: new Date().toISOString()
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Parcels retrieved successfully',
    data: mockParcels
  });
});

app.get('/api/shipments', (req, res) => {
  const mockShipments = [
    {
      _id: '1',
      shipmentId: 'SHP001',
      status: 'Created',
      originHub: 'NYC Hub',
      destinationHub: 'LA Hub',
      parcels: ['TRK001'],
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      shipmentId: 'SHP002',
      status: 'In Transit',
      originHub: 'Chicago Hub',
      destinationHub: 'Houston Hub',
      parcels: ['TRK002'],
      createdAt: new Date().toISOString()
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Shipments retrieved successfully',
    data: mockShipments
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Unexpected server error.',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`\n=== Simple Logistics API Server ===`);
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST /api/auth/register`);
    console.log(`  POST /api/auth/login`);
    console.log(`  GET  /api/users`);
    console.log(`  GET  /api/pickups`);
    console.log(`  GET  /api/parcels`);
    console.log(`  GET  /api/shipments`);
    console.log(`  GET  /health`);
    console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB: Connected`);
  });
};

startServer().catch(console.error);

module.exports = app;
