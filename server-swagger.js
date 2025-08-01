const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

// Import models
const User = require('./src/models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gvasu1292:Vasu%402219@cluster0.ybqbf39.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Create default admin user if it doesn't exist
    createDefaultAdmin();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Function to create default admin user
async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('🔧 Creating default admin user...');
      
      const defaultAdmin = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@rapido.com',
        password: 'Admin@123', // This will be hashed by the model
        phone: '9999999999',
        employeeId: 'ADMIN001',
        department: 'Operations', // Using valid enum value
        role: 'admin',
        isActive: true
      });
      
      await defaultAdmin.save();
      console.log('✅ Default admin user created successfully');
      console.log('📧 Admin Email: admin@rapido.com');
      console.log('🔑 Admin Password: Admin@123');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Existing admin email:', existingAdmin.email);
      console.log('👤 Existing admin name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🆔 Admin role:', existingAdmin.role);
      console.log('🔓 Admin active:', existingAdmin.isActive);
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Rapido Corporate API",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Rapido Corporate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_rapido_corporate_ride_booking_system_2024';

// Mock data for rides
let mockRides = [];

// Mock data for admin actions
let adminActions = [];

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
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🚀 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user in database (include password for verification)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Verify password using the model's method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    console.log('✅ Login successful for:', email);
    
    // Return the structure expected by frontend
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
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
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, employeeId, department } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !employeeId || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Employee ID already exists'
      });
    }

    // Create new user (password will be hashed automatically by the model)
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Don't hash here - let the model's pre-save hook handle it
      phone,
      employeeId,
      department,
      role: 'user', // Always set regular registrations as 'user'
      isActive: true // Activate user by default
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Employee ID'} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/rides:
 *   post:
 *     summary: Book a new ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pickupLocation, dropLocation, scheduledTime]
 *             properties:
 *               pickupLocation:
 *                 type: string
 *                 example: "Tech Park, Bangalore"
 *               dropLocation:
 *                 type: string
 *                 example: "Airport, Bangalore"
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Ride booked successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
app.post('/api/rides', (req, res) => {
  try {
    const { pickupLocation, dropLocation, scheduledTime } = req.body;

    if (!pickupLocation || !dropLocation || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location, drop location, and scheduled time are required'
      });
    }

    const newRide = {
      _id: `60d5ecb74d8b8e001c8e4b${mockRides.length + 1}`,
      userId: '60d5ecb74d8b8e001c8e4b1a', // Mock user ID
      pickupLocation,
      dropLocation,
      scheduledTime: new Date(scheduledTime),
      status: 'pending',
      estimatedFare: Math.floor(Math.random() * 500) + 100,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRides.push(newRide);

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      data: {
        ride: newRide
      }
    });
  } catch (error) {
    console.error('Ride booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/rides:
 *   get:
 *     summary: Get all rides
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rides retrieved successfully
 */
app.get('/api/rides', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Rides retrieved successfully',
      data: {
        rides: mockRides,
        total: mockRides.length
      }
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/rides/user/{userId}:
 *   get:
 *     summary: Get user rides
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
 */
app.get('/api/rides/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userRides = mockRides.filter(ride => ride.userId === userId);

    res.json({
      success: true,
      message: 'User rides retrieved successfully',
      data: {
        rides: userRides,
        total: userRides.length
      }
    });
  } catch (error) {
    console.error('Get user rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, phone, employeeId, department, role]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               department:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: User already exists
 */
app.post('/api/admin/users', async (req, res) => {
  try {
    // Note: In a real application, you'd verify JWT token and check admin role here
    // For now, this is a placeholder for admin user creation
    
    const { firstName, lastName, email, password, phone, employeeId, department, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !employeeId || !department || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "admin"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Employee ID already exists'
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      employeeId,
      department,
      role,
      isActive: true
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Employee ID'} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
 */
app.get('/api/admin/rides', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All rides retrieved successfully',
      data: {
        rides: mockRides,
        total: mockRides.length
      }
    });
  } catch (error) {
    console.error('Get all rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
 *               $ref: '#/components/schemas/Analytics'
 */
app.get('/api/admin/analytics', (req, res) => {
  try {
    const analytics = {
      summary: {
        totalRides: mockRides.length,
        pendingRides: mockRides.filter(r => r.status === 'pending').length,
        approvedRides: mockRides.filter(r => r.status === 'approved').length,
        completedRides: mockRides.filter(r => r.status === 'completed').length,
        approvalRate: '75.5'
      },
      departmentAnalytics: [
        { _id: 'Engineering', totalRides: 45, totalFare: 11250, avgFare: 250 },
        { _id: 'Marketing', totalRides: 32, totalFare: 8000, avgFare: 250 }
      ],
      fareAnalytics: {
        totalFare: 50000,
        avgFare: 250,
        maxFare: 800,
        minFare: 100
      }
    };

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone, department, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/rides/{rideId}:
 *   get:
 *     summary: Get ride details by ID
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully
 */
app.get('/api/rides/:rideId', (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = mockRides.find(r => r._id === rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      message: 'Ride details retrieved successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/rides/{rideId}/cancel:
 *   put:
 *     summary: Cancel a ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 */
app.put('/api/rides/:rideId/cancel', (req, res) => {
  try {
    const { rideId } = req.params;
    const rideIndex = mockRides.findIndex(r => r._id === rideId);

    if (rideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (mockRides[rideIndex].status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed ride'
      });
    }

    mockRides[rideIndex].status = 'cancelled';
    mockRides[rideIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { ride: mockRides[rideIndex] }
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/rides/{rideId}/approve:
 *   put:
 *     summary: Approve a ride (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride approved successfully
 */
app.put('/api/admin/rides/:rideId/approve', (req, res) => {
  try {
    const { rideId } = req.params;
    const rideIndex = mockRides.findIndex(r => r._id === rideId);

    if (rideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    mockRides[rideIndex].status = 'approved';
    mockRides[rideIndex].updatedAt = new Date();

    // Log admin action
    adminActions.push({
      id: Date.now(),
      rideId,
      action: 'approve',
      adminId: 'admin_user_id',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Ride approved successfully',
      data: { ride: mockRides[rideIndex] }
    });
  } catch (error) {
    console.error('Approve ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/rides/{rideId}/reject:
 *   put:
 *     summary: Reject a ride (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride rejected successfully
 */
app.put('/api/admin/rides/:rideId/reject', (req, res) => {
  try {
    const { rideId } = req.params;
    const rideIndex = mockRides.findIndex(r => r._id === rideId);

    if (rideIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    mockRides[rideIndex].status = 'rejected';
    mockRides[rideIndex].updatedAt = new Date();

    // Log admin action
    adminActions.push({
      id: Date.now(),
      rideId,
      action: 'reject',
      adminId: 'admin_user_id',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Ride rejected successfully',
      data: { ride: mockRides[rideIndex] }
    });
  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/rides/filter:
 *   get:
 *     summary: Filter rides by date, status, user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, completed, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Filtered rides retrieved successfully
 */
app.get('/api/admin/rides/filter', (req, res) => {
  try {
    const { status, userId, startDate, endDate } = req.query;
    let filteredRides = [...mockRides];

    // Filter by status
    if (status) {
      filteredRides = filteredRides.filter(ride => 
        ride.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by user ID
    if (userId) {
      filteredRides = filteredRides.filter(ride => ride.userId === userId);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filteredRides = filteredRides.filter(ride => 
        new Date(ride.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filteredRides = filteredRides.filter(ride => 
        new Date(ride.createdAt) <= end
      );
    }

    res.json({
      success: true,
      message: 'Filtered rides retrieved successfully',
      data: {
        rides: filteredRides,
        total: filteredRides.length,
        filters: { status, userId, startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Filter rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/actions:
 *   get:
 *     summary: Get all admin actions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin actions retrieved successfully
 */
app.get('/api/admin/actions', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin actions retrieved successfully',
      data: {
        actions: adminActions,
        total: adminActions.length
      }
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Rapido Corporate API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌟 Frontend URL: http://localhost:3000`);
});

module.exports = app;
