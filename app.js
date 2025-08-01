require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');
const { customCSS } = require('./src/config/swaggerUI');
const connectDB = require('./src/utils/database');
const errorHandler = require('./src/middleware/errorHandler');
const { handleDatabaseError } = require('./src/middleware/database');

// Route files
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');
const rides = require('./src/routes/rides');
const admin = require('./src/routes/admin');

const app = express();

// Connect to database
connectDB();

// Enable CORS for frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    message: 'Rapido Corporate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    server: {
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    },
    database: {
      status: dbStatusText[dbStatus] || 'unknown',
      connected: dbStatus === 1,
      host: dbStatus === 1 ? mongoose.connection.host : 'not connected'
    },
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      docs: '/api-docs',
      health: '/health',
      auth: '/api/auth/*',
      rides: '/api/rides/*',
      admin: '/api/admin/*',
      users: '/api/users/*'
    }
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: customCSS,
  customSiteTitle: 'Rapido Corporate API Documentation',
  customfavIcon: 'https://rapido.bike/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    filter: true,
    syntaxHighlight: {
      theme: 'tomorrow-night'
    },
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    docExpansion: 'list'
  }
}));

// API Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/rides', rides);
app.use('/api/admin', admin);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handlers
app.use(handleDatabaseError);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Rapido Corporate API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${corsOptions.origin}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`⚡ Server started at: ${new Date().toISOString()}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
