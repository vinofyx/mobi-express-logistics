require('dotenv').config();

console.log('=== MobiExpress Diagnostic ===');
console.log('');

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'SET' : 'MISSING'}`);
console.log(`   PORT: ${process.env.PORT || '5000 (default)'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);
console.log(`   JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? 'SET' : 'MISSING'}`);
console.log('');

// Test MongoDB connection
if (process.env.MONGO_URI) {
  console.log('2. Testing MongoDB Connection...');
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('   MongoDB Connection: SUCCESS');
      console.log('   Database Name: ' + mongoose.connection.name);
      mongoose.disconnect();
    })
    .catch((err) => {
      console.log('   MongoDB Connection: FAILED');
      console.log('   Error: ' + err.message);
    });
} else {
  console.log('2. MongoDB Connection: SKIPPED (MONGO_URI missing)');
}

console.log('');
console.log('3. Package Dependencies:');
try {
  const express = require('express');
  console.log('   Express: INSTALLED');
} catch (e) {
  console.log('   Express: MISSING - run npm install');
}

try {
  const mongoose = require('mongoose');
  console.log('   Mongoose: INSTALLED');
} catch (e) {
  console.log('   Mongoose: MISSING - run npm install');
}

try {
  const jwt = require('jsonwebtoken');
  console.log('   JsonWebToken: INSTALLED');
} catch (e) {
  console.log('   JsonWebToken: MISSING - run npm install');
}

try {
  const bcrypt = require('bcryptjs');
  console.log('   BcryptJS: INSTALLED');
} catch (e) {
  console.log('   BcryptJS: MISSING - run npm install');
}

try {
  const cors = require('cors');
  console.log('   CORS: INSTALLED');
} catch (e) {
  console.log('   CORS: MISSING - run npm install');
}

try {
  const cookieParser = require('cookie-parser');
  console.log('   CookieParser: INSTALLED');
} catch (e) {
  console.log('   CookieParser: MISSING - run npm install');
}

console.log('');
console.log('4. Required Files:');
const fs = require('fs');
const requiredFiles = [
  'src/app.js',
  'server.js',
  'src/modules/auth/auth.controller.js',
  'src/modules/auth/auth.routes.js',
  'src/modules/users/user.model.js',
  'src/config/db.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

console.log('');
console.log('5. User Model Test:');
try {
  const User = require('../modules/users/user.model');
  console.log('   User Model: LOADED SUCCESSFULLY');
} catch (e) {
  console.log('   User Model: FAILED TO LOAD');
  console.log('   Error: ' + e.message);
}

console.log('');
console.log('=== Diagnostic Complete ===');
