const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('\x1b[33m\u26a0 MongoDB URI not provided - running without database');
      console.log('\x1b[33m\u26a0 Set MONGO_URI in server/.env to enable database features');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`\x1b[32m\u2705  MongoDB connected: ${conn.connection.host}\x1b[0m`);
    console.log(`    Database: ${conn.connection.name}`);
    
  } catch (err) {
    console.error(`\x1b[31m\u274c  MongoDB connection failed: ${err.message}\x1b[0m`);

    // Helpful error messages
    if (err.message.includes("ENOTFOUND")) {
      console.error("    \u2192 Check your MONGO_URI in server/.env");
      console.error("    \u2192 Make sure you have internet connection");
    }
    if (err.message.includes("Authentication failed")) {
      console.error("    \u2192 Wrong username or password in MONGO_URI");
      console.error("    \u2192 Re-check your Atlas credentials");
    }
    if (err.message.includes("timed out")) {
      console.error("    \u2192 Go to Atlas \u2192 Network Access \u2192 Add IP 0.0.0.0/0");
    }
    
    // Don't exit the process, just continue without database
    console.log('\x1b[33m\u26a0 Server will continue running without database');
    console.log('\x1b[33m\u26a0 Update your MONGO_URI in server/.env to fix database connection');
    console.log('='.repeat(50));
  }
};

module.exports = connectDB;
