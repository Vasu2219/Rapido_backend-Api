const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required. Please check your .env file.');
    }
    
    const mongoURI = process.env.MONGODB_URI;
    console.log(`📍 Connection URI: ${mongoURI.replace(/:[^:@]*@/, ':****@')}`); // Hide password in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Connection state: ${conn.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('Database connection error:', error.message);
    
    // Check for specific error types
    if (error.message.includes('IP whitelist')) {
      console.error('IP whitelist error: Please add your current IP to MongoDB Atlas whitelist');
      console.error('Go to: https://cloud.mongodb.com -> Security -> Network Access -> Add IP Address');
    } else if (error.message.includes('authentication failed')) {
      console.error('Authentication error: Please check username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('Network error: Please check internet connection');
    }
    
    throw error;
  }
};

module.exports = connectDB;
