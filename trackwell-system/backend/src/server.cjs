const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock data
const users = [
  {
    _id: '1',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Admin User',
    phone: '1234567890',
    address: '123 Admin St',
    isActive: true
  },
  {
    _id: '2',
    email: 'agent@example.com',
    password: bcrypt.hashSync('agent123', 10),
    role: 'agent',
    name: 'Agent User',
    phone: '1234567891',
    address: '123 Agent St',
    isActive: true
  },
  {
    _id: '3',
    email: 'customer@example.com',
    password: bcrypt.hashSync('customer123', 10),
    role: 'customer',
    name: 'Customer User',
    phone: '1234567892',
    address: '123 Customer St',
    isActive: true
  },
  {
    _id: '4',
    email: 'center@example.com',
    password: bcrypt.hashSync('center123', 10),
    role: 'center_operator',
    name: 'Center Operator',
    phone: '1234567893',
    address: '123 Center St',
    isActive: true
  }
];

let pickups = [];
let parcels = [];
let shipments = [];

// Middleware
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running successfully' 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MobiExpress API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend working successfully',
    server: 'MobiExpress Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'MobiExpress API - Welcome',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth/*',
      pickups: '/api/v1/pickups/*',
      parcels: '/api/v1/parcels/*',
      shipments: '/api/v1/shipments/*',
      test: '/api/test',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      address,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: newUser._id,
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          address: newUser.address,
          isActive: newUser.isActive
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Debug route
app.get('/api/v1/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Debug route working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Pickups routes
app.get('/api/v1/pickups', (req, res) => {
  res.json({
    success: true,
    data: pickups,
    pagination: {
      page: 1,
      limit: 10,
      total: pickups.length,
      pages: 1
    }
  });
});

app.post('/api/v1/pickups', (req, res) => {
  const newPickup = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  pickups.push(newPickup);
  
  res.status(201).json({
    success: true,
    data: newPickup
  });
});

app.patch('/api/v1/pickups/:id', (req, res) => {
  const index = pickups.findIndex(p => p._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found'
    });
  }
  
  pickups[index] = { ...pickups[index], ...req.body };
  res.json({
    success: true,
    data: pickups[index]
  });
});

// Parcels routes
app.get('/api/v1/parcels', (req, res) => {
  res.json({
    success: true,
    data: parcels,
    pagination: {
      page: 1,
      limit: 10,
      total: parcels.length,
      pages: 1
    }
  });
});

app.post('/api/v1/parcels', (req, res) => {
  const newParcel = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  parcels.push(newParcel);
  
  res.status(201).json({
    success: true,
    data: newParcel
  });
});

// Shipments routes
app.get('/api/v1/shipments', (req, res) => {
  res.json({
    success: true,
    data: shipments,
    pagination: {
      page: 1,
      limit: 10,
      total: shipments.length,
      pages: 1
    }
  });
});

app.post('/api/v1/shipments', (req, res) => {
  const newShipment = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  shipments.push(newShipment);
  
  res.status(201).json({
    success: true,
    data: newShipment
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\x1b[32m\u2705 Server running successfully on port ${PORT}\x1b[0m`);
  console.log(`\x1b[36m\u2192 Local URL: http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36m\u2192 Health Check: http://localhost:${PORT}/health\x1b[0m`);
  console.log(`\x1b[36m\u2192 API Test: http://localhost:${PORT}/api/test\x1b[0m`);
  console.log('\x1b[32m\u2703 Mock server started successfully!\x1b[0m');
  console.log('\x1b[32m\u2703 Demo credentials:\x1b[0m');
  console.log('\x1b[36m\u2192 admin@example.com / admin123\x1b[0m');
  console.log('\x1b[36m\u2192 agent@example.com / agent123\x1b[0m');
  console.log('\x1b[36m\u2192 customer@example.com / customer123\x1b[0m');
  console.log('\x1b[36m\u2192 center@example.com / center123\x1b[0m');
});

module.exports = app;
