const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081', 
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic routes for testing
app.get('/', (req, res) => {
  res.send('LMS API Running - Minimal Version');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running - Minimal Version' 
  });
});

// Mock parcel tracking endpoint
app.get('/api/parcels/track/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  
  // Mock data for testing
  const mockParcel = {
    success: true,
    message: 'Parcel found successfully',
    data: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      trackingId: trackingId,
      status: 'In Transit',
      senderName: 'John Doe',
      recipientName: 'Jane Smith',
      pickupAddress: {
        city: 'Hyderabad',
        state: 'Telangana'
      },
      destinationAddress: {
        city: 'Bangalore', 
        state: 'Karnataka'
      },
      statusHistory: [
        {
          status: 'Picked',
          location: 'Hyderabad',
          note: 'Package picked up from sender',
          timestamp: '2026-04-17T10:30:00Z'
        },
        {
          status: 'In Transit',
          location: 'Bangalore',
          note: 'Package in transit to destination',
          timestamp: '2026-04-17T12:00:00Z'
        }
      ],
      createdAt: '2026-04-17T10:00:00Z'
    }
  };
  
  res.json(mockParcel);
});

// Mock shipment tracking endpoint
app.get('/api/shipments/track/:shipmentId', (req, res) => {
  const { shipmentId } = req.params;
  
  // Mock data for testing
  const mockShipment = {
    success: true,
    message: 'Shipment found successfully',
    data: {
      _id: '64f8a1b2c3d4e5f6a7b8c9d1',
      shipmentId: shipmentId,
      status: 'In Transit',
      originHub: 'HYD',
      destinationHub: 'BLR',
      parcels: [
        { trackingId: 'LMS-HYD-20260417-XYZ1', status: 'In Transit' },
        { trackingId: 'LMS-HYD-20260417-XYZ2', status: 'In Transit' }
      ],
      statusHistory: [
        {
          status: 'Created',
          location: 'Hyderabad',
          note: 'Shipment created',
          timestamp: '2026-04-17T10:00:00Z'
        },
        {
          status: 'In Transit',
          location: 'Bangalore',
          note: 'Shipment in transit',
          timestamp: '2026-04-17T12:00:00Z'
        }
      ],
      createdAt: '2026-04-17T10:00:00Z'
    }
  };
  
  res.json(mockShipment);
});

// Mock parcels list endpoint
app.get('/api/parcels', (req, res) => {
  const mockParcels = {
    success: true,
    message: 'Parcels retrieved successfully',
    data: [
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d0',
        trackingId: 'LMS-HYD-20260417-XYZ1',
        status: 'In Transit',
        senderName: 'John Doe',
        recipientName: 'Jane Smith',
        pickupAddress: {
          city: 'Hyderabad',
          state: 'Telangana'
        },
        destinationAddress: {
          city: 'Bangalore',
          state: 'Karnataka'
        },
        createdAt: '2026-04-17T10:00:00Z',
        updatedAt: '2026-04-17T12:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d1',
        trackingId: 'LMS-BLR-20260417-DEF2',
        status: 'Delivered',
        senderName: 'Alice Smith',
        recipientName: 'Bob Johnson',
        pickupAddress: {
          city: 'Bangalore',
          state: 'Karnataka'
        },
        destinationAddress: {
          city: 'Chennai',
          state: 'Tamil Nadu'
        },
        createdAt: '2026-04-16T15:00:00Z',
        updatedAt: '2026-04-17T09:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d2',
        trackingId: 'LMS-DEL-20260417-GHI3',
        status: 'Picked',
        senderName: 'Charlie Brown',
        recipientName: 'Diana Prince',
        pickupAddress: {
          city: 'Delhi',
          state: 'Delhi'
        },
        destinationAddress: {
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        createdAt: '2026-04-17T08:00:00Z',
        updatedAt: '2026-04-17T11:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d3',
        trackingId: 'LMS-MUM-20260417-JKL4',
        status: 'At Center',
        senderName: 'Eve Wilson',
        recipientName: 'Frank Miller',
        pickupAddress: {
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        destinationAddress: {
          city: 'Pune',
          state: 'Maharashtra'
        },
        createdAt: '2026-04-17T07:00:00Z',
        updatedAt: '2026-04-17T14:00:00Z'
      }
    ]
  };
  
  res.json(mockParcels);
});

// Mock shipments list endpoint
app.get('/api/shipments', (req, res) => {
  const mockShipments = {
    success: true,
    message: 'Shipments retrieved successfully',
    data: [
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d2',
        shipmentId: 'SHP-HYD-20260417-ABC1',
        status: 'In Transit',
        originHub: 'HYD',
        destinationHub: 'BLR',
        parcels: [
          { trackingId: 'LMS-HYD-20260417-XYZ1', status: 'In Transit' },
          { trackingId: 'LMS-HYD-20260417-XYZ2', status: 'In Transit' }
        ],
        createdAt: '2026-04-17T10:00:00Z',
        updatedAt: '2026-04-17T14:30:00Z',
        expectedArrival: '2026-04-20T18:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d3',
        shipmentId: 'SHP-BLR-20260417-DEF1',
        status: 'Created',
        originHub: 'BLR',
        destinationHub: 'DEL',
        parcels: [
          { trackingId: 'LMS-BLR-20260417-DEF2', status: 'Delivered' }
        ],
        createdAt: '2026-04-17T09:00:00Z',
        updatedAt: '2026-04-17T09:00:00Z',
        expectedArrival: '2026-04-21T14:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d4',
        shipmentId: 'SHP-DEL-20260416-GHI2',
        status: 'Received',
        originHub: 'DEL',
        destinationHub: 'MUM',
        parcels: [
          { trackingId: 'LMS-DEL-20260417-GHI3', status: 'Picked' },
          { trackingId: 'LMS-DEL-20260417-GHI4', status: 'Delivered' }
        ],
        createdAt: '2026-04-16T16:00:00Z',
        updatedAt: '2026-04-17T11:00:00Z',
        expectedArrival: '2026-04-18T16:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d5',
        shipmentId: 'SHP-MUM-20260417-JKL1',
        status: 'Dispatched',
        originHub: 'MUM',
        destinationHub: 'PUNE',
        parcels: [
          { trackingId: 'LMS-MUM-20260417-JKL4', status: 'At Center' }
        ],
        createdAt: '2026-04-17T07:30:00Z',
        updatedAt: '2026-04-17T15:00:00Z',
        expectedArrival: '2026-04-19T12:00:00Z'
      }
    ]
  };
  
  res.json(mockShipments);
});

// Mock shipment creation endpoint
app.post('/api/shipments', (req, res) => {
  const { originHub, destinationHub, expectedArrival, parcelIds } = req.body;
  
  // Basic validation
  if (!originHub || !destinationHub || !expectedArrival || !parcelIds || parcelIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Origin hub, destination hub, expected arrival, and at least one parcel are required',
      data: null
    });
  }
  
  if (originHub === destinationHub) {
    return res.status(400).json({
      success: false,
      message: 'Origin and destination hubs must be different',
      data: null
    });
  }
  
  // Generate mock shipment ID
  const shipmentId = `SHP-${originHub}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  // Get selected parcels details
  const selectedParcels = parcelIds.map(id => ({
    trackingId: `LMS-${originHub}-20260417-${id.toUpperCase()}`,
    status: 'In Transit'
  }));
  
  const mockShipment = {
    success: true,
    message: 'Shipment created successfully',
    data: {
      _id: `64f8a1b2c3d4e5f6a7b8c9d${Math.random().toString(36).substr(2, 3)}`,
      shipmentId: shipmentId,
      status: 'Created',
      originHub: originHub,
      destinationHub: destinationHub,
      parcels: selectedParcels,
      expectedArrival: expectedArrival,
      statusHistory: [
        {
          status: 'Created',
          location: originHub,
          note: 'Shipment created and parcels assigned',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  console.log(`New shipment created: ${shipmentId} from ${originHub} to ${destinationHub} with ${parcelIds.length} parcels`);
  res.status(201).json(mockShipment);
});

// Mock shipment status update endpoint
app.put('/api/shipments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, note, location } = req.body;
  
  // Basic validation
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
      data: null
    });
  }
  
  // Valid status transitions
  const validTransitions = {
    'Created': ['Dispatched'],
    'Dispatched': ['In Transit'],
    'In Transit': ['Received'],
    'Received': []
  };
  
  // Mock validation - in real implementation, you'd check current status
  const allowedStatuses = ['Created', 'Dispatched', 'In Transit', 'Received'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
      data: null
    });
  }
  
  const mockShipment = {
    success: true,
    message: 'Shipment status updated successfully',
    data: {
      _id: id,
      shipmentId: `SHP-HYD-20260417-ABC1`,
      status: status,
      statusHistory: [
        {
          status: status,
          location: location || 'Unknown',
          note: note || `Status updated to ${status}`,
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    }
  };
  
  console.log(`Shipment ${id} status updated to: ${status}`);
  res.json(mockShipment);
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      data: null
    });
  }
  
  // Mock user database
  const users = [
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d0',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In real app, this would be hashed
      role: 'admin',
      phone: '9876543210',
      address: '123 Admin St, Hyderabad, Telangana 500001',
      isActive: true
    },
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d1',
      name: 'Agent User',
      email: 'agent@example.com',
      password: 'agent123',
      role: 'agent',
      phone: '9876543211',
      address: '456 Agent Ave, Bangalore, Karnataka 560001',
      isActive: true
    },
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d2',
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '9876543212',
      address: '789 Customer Rd, Chennai, Tamil Nadu 600001',
      isActive: true
    },
    {
      _id: '64f8a1b2c3d4e5f6a7b8c9d3',
      name: 'Staff User',
      email: 'staff@example.com',
      password: 'staff123',
      role: 'center_staff',
      phone: '9876543213',
      address: '321 Staff Ln, Mumbai, Maharashtra 400001',
      isActive: true
    }
  ];
  
  // Find user by email
  const user = users.find(u => u.email === email && u.isActive);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      data: null
    });
  }
  
  // Generate mock tokens
  const token = `mock-jwt-token-${user._id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${user._id}-${Date.now()}`;
  
  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;
  
  console.log(`User logged in: ${user.email} (${user.role})`);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
      refreshToken
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone, address } = req.body;
  
  // Basic validation
  if (!name || !email || !password || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: null
    });
  }
  
  // Email validation
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address',
      data: null
    });
  }
  
  // Phone validation
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 10-digit mobile number',
      data: null
    });
  }
  
  // Generate mock user
  const newUser = {
    _id: `64f8a1b2c3d4e5f6a7b8c9d${Math.random().toString(36).substr(2, 3)}`,
    name,
    email,
    role: role || 'customer',
    phone,
    address,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  // Generate mock tokens
  const token = `mock-jwt-token-${newUser._id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${newUser._id}-${Date.now()}`;
  
  console.log(`New user registered: ${newUser.email} (${newUser.role})`);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: newUser,
      token,
      refreshToken
    }
  });
});

app.post('/api/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
      data: null
    });
  }
  
  // Mock token validation and refresh
  const token = `mock-jwt-token-refreshed-${Date.now()}`;
  const mockUser = {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '9876543210',
    address: '123 Admin St, Hyderabad, Telangana 500001',
    isActive: true
  };
  
  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token,
      user: mockUser
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or malformed',
      data: null
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Mock token validation
  if (!token.startsWith('mock-jwt-token')) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null
    });
  }
  
  // Mock user profile
  const user = {
    _id: '64f8a1b2c3d4e5f6a7b8c9d0',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '9876543210',
    address: '123 Admin St, Hyderabad, Telangana 500001',
    isActive: true,
    createdAt: '2026-04-17T10:00:00Z'
  };
  
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or malformed',
      data: null
    });
  }
  
  // Mock logout - in real app, you'd invalidate the token
  console.log('User logged out');
  
  res.json({
    success: true,
    message: 'Logout successful',
    data: null
  });
});

// Mock pickup creation endpoint
app.post('/api/pickups', (req, res) => {
  const { name, phone, address, pickupDate, pickupTime } = req.body;
  
  // Basic validation
  if (!name || !phone || !address || !pickupDate || !pickupTime) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      data: null
    });
  }
  
  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format',
      data: null
    });
  }
  
  // Generate mock pickup ID
  const pickupId = `PU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  const mockPickup = {
    success: true,
    message: 'Pickup request created successfully',
    data: {
      _id: `64f8a1b2c3d4e5f6a7b8c9d3`,
      pickupId: pickupId,
      customer: {
        name: name,
        phone: phone,
        address: address
      },
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          note: 'Pickup request created',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  console.log(`New pickup created: ${pickupId} for ${name}`);
  res.status(201).json(mockPickup);
});

// Mock pickups list endpoint
app.get('/api/pickups', (req, res) => {
  const mockPickups = {
    success: true,
    message: 'Pickups retrieved successfully',
    data: [
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d3',
        pickupId: 'PU-1715998234567-ABC12',
        customer: {
          name: 'John Doe',
          phone: '9876543210',
          address: '123 Main St, Hyderabad, Telangana 500001'
        },
        pickupDate: '2026-04-18',
        pickupTime: '14:30',
        status: 'Pending',
        createdAt: '2026-04-17T10:00:00Z'
      },
      {
        _id: '64f8a1b2c3d4e5f6a7b8c9d4',
        pickupId: 'PU-1715998234568-DEF34',
        customer: {
          name: 'Jane Smith',
          phone: '9876543211',
          address: '456 Oak Ave, Bangalore, Karnataka 560001'
        },
        pickupDate: '2026-04-17',
        pickupTime: '10:00',
        status: 'Confirmed',
        createdAt: '2026-04-16T15:00:00Z'
      }
    ]
  };
  
  res.json(mockPickups);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n=== Minimal LMS API Server ===`);
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/parcels/track/:trackingId`);
  console.log(`  GET  /api/shipments/track/:shipmentId`);
  console.log(`  GET  /api/parcels`);
  console.log(`  GET  /api/shipments`);
  console.log(`  POST /api/shipments (NEW!)`);
  console.log(`  PUT  /api/shipments/:id/status (NEW!)`);
  console.log(`  POST /api/pickups (NEW!)`);
  console.log(`  GET  /api/pickups (NEW!)`);
  console.log(`\nAuthentication (NEW!):`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/register`);
  console.log(`  POST /api/auth/refresh-token`);
  console.log(`  GET  /api/auth/profile`);
  console.log(`  PUT  /api/auth/profile`);
  console.log(`  PUT  /api/auth/change-password`);
  console.log(`  POST /api/auth/logout`);
  console.log(`\nSample tracking IDs:`);
  console.log(`  Parcel: LMS-HYD-20260417-XYZ1`);
  console.log(`  Shipment: SHP-HYD-20260417-ABC1`);
  console.log(`\nPickup Creation Form:`);
  console.log(`  http://localhost:8081/pickup/new`);
  console.log(`\nShipment Management:`);
  console.log(`  http://localhost:8081/dashboard/admin/shipments`);
  console.log(`\nAuthentication:`);
  console.log(`  http://localhost:8081/login`);
  console.log(`  http://localhost:8081/signup`);
  console.log(`\nFrontend should be running on: http://localhost:8081`);
  console.log(`\n=== Ready for testing ===\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

module.exports = app;
