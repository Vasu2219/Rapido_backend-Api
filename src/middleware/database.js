const mongoose = require('mongoose');

const checkDatabaseConnection = (req, res, next) => {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
      error: 'MongoDB is not connected. Please check database configuration.',
      documentation: 'See server logs for database setup instructions',
      status: 'service_unavailable'
    });
  }
  
  next();
};

const handleDatabaseError = (error, req, res, next) => {
  // Handle MongoDB specific errors
  if (error.name === 'MongooseError' || error.name === 'MongoError') {
    return res.status(503).json({
      success: false,
      message: 'Database operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error occurred',
      status: 'database_error'
    });
  }
  
  next(error);
};

module.exports = {
  checkDatabaseConnection,
  handleDatabaseError
};
