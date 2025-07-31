const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const rideRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');

const app = express();

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Corporate Ride Scheduling API',
            version: '1.0.0',
            description: 'A comprehensive REST API for corporate ride scheduling and management system',
            contact: {
                name: 'API Support',
                email: 'support@corporaterides.com'
            }
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        employeeId: { type: 'string' },
                        department: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Ride: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        pickup: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                coordinates: {
                                    type: 'object',
                                    properties: {
                                        lat: { type: 'number' },
                                        lng: { type: 'number' }
                                    }
                                }
                            }
                        },
                        drop: {
                            type: 'object',
                            properties: {
                                address: { type: 'string' },
                                coordinates: {
                                    type: 'object',
                                    properties: {
                                        lat: { type: 'number' },
                                        lng: { type: 'number' }
                                    }
                                }
                            }
                        },
                        scheduleTime: { type: 'string', format: 'date-time' },
                        status: { 
                            type: 'string', 
                            enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'] 
                        },
                        estimatedFare: { type: 'number' },
                        actualFare: { type: 'number' },
                        distance: { type: 'number' },
                        duration: { type: 'number' },
                        reason: { type: 'string' },
                        driver: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                phone: { type: 'string' },
                                vehicle: { type: 'string' },
                                rating: { type: 'number' }
                            }
                        },
                        feedback: {
                            type: 'object',
                            properties: {
                                rating: { type: 'number', minimum: 1, maximum: 5 },
                                comment: { type: 'string' }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    },
    apis: [
        './routes/auth.js',
        './routes/users.js', 
        './routes/rides.js',
        './routes/admin.js'
    ] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Corporate Ride Scheduling API'
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Corporate Ride Scheduling API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Corporate Ride Scheduling API',
        documentation: '/api-docs',
        health: '/health',
        version: '1.0.0'
    });
});

// 404 handler for unmatched routes
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/corporate-rides', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚗 Corporate Ride Scheduling API Server running on port ${PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
        });
    });
}

module.exports = app;
