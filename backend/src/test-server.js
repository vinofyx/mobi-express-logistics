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
  console.log(`  GET  /health`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT",  () => server.close(() => process.exit(0)));

module.exports = app;
