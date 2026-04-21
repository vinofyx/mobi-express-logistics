require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../modules/users/user.model');

async function seed() {
  try {
    console.log('Starting admin user seeding...');
    
    // Check if MongoDB is available
    if (!process.env.MONGO_URI) {
      console.log('MongoDB URI not provided - creating mock admin user');
      console.log('Mock admin user created successfully!');
      console.log('Email:    dharanilekkala425@gmail.com');
      console.log('Password: Admin@123');
      console.log('Role:     admin');
      console.log('Note: This is a mock user for development without database');
      return process.exit(0);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const exists = await User.findOne({ email: 'dharanilekkala425@gmail.com' });
    if (exists) {
      console.log('Admin user already exists, updating...');
      
      // Update existing user
      exists.password = 'Admin@123'; // Will be hashed by pre-save hook
      exists.isActive = true;
      exists.role = 'admin';
      await exists.save();
      
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      await User.create({
        name: 'Dharani Admin',
        email: 'dharanilekkala425@gmail.com',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      
      console.log('Admin user created successfully!');
    }

    console.log('Email:    dharanilekkala425@gmail.com');
    console.log('Password: Admin@123');
    console.log('Role:     admin');
    console.log('Status:   Active');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seed();
