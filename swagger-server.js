const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 5000;

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
                url: 'http://localhost:5000',
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
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success', 'error'] },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        }
    },
    apis: ['./swagger-server.js'] // Include this file for API documentation
};

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Corporate Ride Scheduling API'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Corporate Ride Scheduling API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phone
 *               - department
 *               - employeeId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@company.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               phone:
 *                 type: string
 *                 example: +91 98765 43210
 *               department:
 *                 type: string
 *                 enum: [Engineering, Marketing, Sales, Operations, HR, Finance, Legal, Customer Support]
 *                 example: Engineering
 *               employeeId:
 *                 type: string
 *                 example: EMP001
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, department, employeeId } = req.body;
        
        // Mock response for now
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    _id: '507f1f77bcf86cd799439011',
                    firstName,
                    lastName,
                    email,
                    phone,
                    department,
                    employeeId,
                    role: 'user',
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@company.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Mock validation
        if (email === 'john.doe@company.com' && password === 'password123') {
            res.json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: {
                        _id: '507f1f77bcf86cd799439011',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@company.com',
                        role: 'user',
                        department: 'Engineering',
                        employeeId: 'EMP001',
                        isActive: true
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                }
            });
        } else if (email === 'admin@company.com' && password === 'admin123') {
            res.json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: {
                        _id: '507f1f77bcf86cd799439012',
                        firstName: 'Admin',
                        lastName: 'User',
                        email: 'admin@company.com',
                        role: 'admin',
                        department: 'Operations',
                        employeeId: 'ADM001',
                        isActive: true
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                }
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/rides:
 *   post:
 *     summary: Create a new ride request
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup
 *               - drop
 *               - scheduleTime
 *             properties:
 *               pickup:
 *                 type: string
 *                 example: Tech Park, Bangalore
 *               drop:
 *                 type: string
 *                 example: Koramangala, Bangalore
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T09:30:00Z
 *     responses:
 *       201:
 *         description: Ride created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.post('/api/rides', async (req, res) => {
    try {
        const { pickup, drop, scheduleTime } = req.body;
        
        res.status(201).json({
            status: 'success',
            message: 'Ride created successfully',
            data: {
                ride: {
                    _id: '507f1f77bcf86cd799439013',
                    userId: '507f1f77bcf86cd799439011',
                    pickup,
                    drop,
                    scheduleTime,
                    status: 'pending',
                    estimatedFare: 250,
                    createdAt: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create ride',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/rides/user/{userId}:
 *   get:
 *     summary: Get all rides for a specific user
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User rides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.get('/api/rides/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        res.json({
            status: 'success',
            message: 'User rides retrieved successfully',
            data: {
                rides: [
                    {
                        _id: '507f1f77bcf86cd799439013',
                        userId,
                        pickup: 'Tech Park, Bangalore',
                        drop: 'Koramangala, Bangalore',
                        scheduleTime: '2024-01-15T09:30:00Z',
                        status: 'completed',
                        estimatedFare: 180,
                        actualFare: 175,
                        createdAt: '2024-01-14T18:45:00Z'
                    }
                ],
                total: 1
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user rides',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/admin/rides:
 *   get:
 *     summary: Get all rides (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All rides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
app.get('/api/admin/rides', async (req, res) => {
    try {
        res.json({
            status: 'success',
            message: 'All rides retrieved successfully',
            data: {
                rides: [
                    {
                        _id: '507f1f77bcf86cd799439013',
                        userId: '507f1f77bcf86cd799439011',
                        userName: 'John Doe',
                        pickup: 'Tech Park, Bangalore',
                        drop: 'Koramangala, Bangalore',
                        scheduleTime: '2024-01-15T09:30:00Z',
                        status: 'pending',
                        estimatedFare: 180,
                        createdAt: '2024-01-14T18:45:00Z'
                    }
                ],
                total: 1,
                pagination: {
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get rides',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get ride analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
app.get('/api/admin/analytics', async (req, res) => {
    try {
        res.json({
            status: 'success',
            message: 'Analytics retrieved successfully',
            data: {
                overview: {
                    totalRides: 1247,
                    activeUsers: 89,
                    totalRevenue: 185420,
                    averageRating: 4.7,
                    completionRate: 94.2
                },
                rideStats: {
                    today: { total: 23, completed: 18, cancelled: 2, pending: 3 },
                    thisWeek: { total: 167, completed: 155, cancelled: 8, pending: 4 },
                    thisMonth: { total: 742, completed: 695, cancelled: 31, pending: 16 }
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get analytics',
            error: error.message
        });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Corporate Ride Scheduling API',
        documentation: '/api-docs',
        health: '/health',
        version: '1.0.0'
    });
});

// MongoDB connection (optional for testing)
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/rapido_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('⚠️  Running without database - using mock data');
    }
};

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚗 Corporate Ride Scheduling API Server running on port ${PORT}`);
        console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
        console.log(`🌐 Frontend should connect to http://localhost:${PORT}`);
    });
});

module.exports = app;
