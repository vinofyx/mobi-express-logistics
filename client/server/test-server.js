const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Root route working' });
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Health check working' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/`);
});
