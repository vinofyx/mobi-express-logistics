require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic auth routes for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock login for now
    if (email === 'admin@example.com' && password === 'admin123') {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: '64f8a1b2c3d4e5f6a7b8c9d0',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        }
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    // Mock registration for now
    const newUser = {
      _id: '64f8a1b2c3d4e5f6a7b8c9d1',
      name,
      email,
      role: role || 'customer',
      phone,
      address,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mock data for dashboard
const mockPickups = [
  {
    _id: '1',
    pickupId: 'PU001',
    name: 'John Doe',
    phone: '9876543210',
    address: '123 Main St',
    pickupDate: '2026-04-18',
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
    pickupDate: '2026-04-18',
    pickupTime: '14:00',
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  }
];

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

// API endpoints for dashboard data
app.get('/api/pickups', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pickups retrieved successfully',
    data: mockPickups
  });
});

app.get('/api/parcels', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Parcels retrieved successfully',
    data: mockParcels
  });
});

app.get('/api/shipments', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shipments retrieved successfully',
    data: mockShipments
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: "API is running." });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n=== Test API Server ===`);
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/register`);
  console.log(`  GET  /api/pickups`);
  console.log(`  GET  /api/parcels`);
  console.log(`  GET  /api/shipments`);
  console.log(`  GET  /health`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT",  () => server.close(() => process.exit(0)));

module.exports = app;
