const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`📍 Connection URI: ${process.env.MONGODB_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔐 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('');
    console.log('🚀 SOLUTIONS TO FIX DATABASE CONNECTION:');
    console.log('');
    console.log('📋 Option 1: Install MongoDB locally');
    console.log('   - Download from: https://www.mongodb.com/try/download/community');
    console.log('   - Install and start MongoDB service');
    console.log('   - Default runs on: mongodb://localhost:27017');
    console.log('');
    console.log('☁️  Option 2: Use MongoDB Atlas (Cloud)');
    console.log('   - Sign up at: https://cloud.mongodb.com');
    console.log('   - Create free cluster');
    console.log('   - Update MONGODB_URI in .env with Atlas connection string');
    console.log('');
    console.log('🔧 Option 3: Use MongoDB in Docker');
    console.log('   - Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    console.log('');
    console.log('⚡ Server will continue running without database');
    console.log('   (API endpoints will return database connection errors)');
    console.log('');
  }
};

module.exports = connectDB;
