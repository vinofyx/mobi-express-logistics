require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const connectDB   = require('./config/db');
const authRoutes  = require('./modules/auth/auth.routes');

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Body parsers
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

// API routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('\x1b[31m\u274c Server Error:', err.message, '\x1b[0m');
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start database connection (non-blocking)
connectDB().catch(err => {
  console.error('\x1b[33m\u26a0 Warning: Database connection failed:', err.message);
  console.log('\x1b[33m\u26a0 Server will continue running without database');
  console.log('\x1b[33m\u26a0 Some features may not work properly');
  console.log('='.repeat(50));
});

module.exports = app;
