const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

async function startServer() {
  try {
    console.log('='.repeat(50));
    console.log('Starting MobiExpress Backend Server');
    console.log('='.repeat(50));
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'SET' : 'NOT SET'}`);
    console.log('='.repeat(50));
    
    app.listen(PORT, () => {
      console.log(`\x1b[32m\u2705 Server running successfully on port ${PORT}\x1b[0m`);
      console.log(`\x1b[36m\u2192 Local URL: http://localhost:${PORT}\x1b[0m`);
      console.log(`\x1b[36m\u2192 Health Check: http://localhost:${PORT}/health\x1b[0m`);
      console.log('='.repeat(50));
      console.log('\x1b[32m\u2703 Server started successfully!\x1b[0m');
      console.log('\x1b[32m\u2703 Press Ctrl+C to stop the server\x1b[0m');
      console.log('='.repeat(50));
    });
    
  } catch (error) {
    console.error('\x1b[31m\u274c Failed to start server:', error.message, '\x1b[0m');
    process.exit(1);
  }
}

// Start the server
startServer();
