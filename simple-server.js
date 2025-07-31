const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Constants
const MONGODB_URI = 'mongodb://localhost:27017/rapido-corporate';
const JWT_SECRET = 'your_super_secret_jwt_key_for_rapido_corporate_ride_booking_system_2024';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server default port
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📍 Database: ${MONGODB_URI}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ride Schema
const rideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickup: { type: String, required: true },
  drop: { type: String, required: true },
  scheduleTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  estimatedFare: { type: Number },
  actualFare: { type: Number },
  driver: {
    name: String,
    phone: String,
    vehicle: String
  },
  bookingTime: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Admin Action Schema
const adminActionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  action: { type: String, enum: ['approved', 'rejected'], required: true },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Ride = mongoose.model('Ride', rideSchema);
const AdminAction = mongoose.model('AdminAction', adminActionSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, department, employeeId } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !department || !employeeId) {
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
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or employee ID already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      department,
      employeeId
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: user.department,
          employeeId: user.employeeId,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ 
      success: true, 
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: user.department,
          employeeId: user.employeeId,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
});

// =============================================================================
// USER ROUTES
// =============================================================================

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: { user: req.user }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile',
      error: error.message 
    });
  }
});

// =============================================================================
// RIDE ROUTES
// =============================================================================

// Create ride booking
app.post('/api/rides', authenticateToken, async (req, res) => {
  try {
    const { pickup, drop, scheduleTime, estimatedFare } = req.body;

    if (!pickup || !drop || !scheduleTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pickup, drop, and schedule time are required' 
      });
    }

    const ride = new Ride({
      userId: req.user._id,
      pickup,
      drop,
      scheduleTime: new Date(scheduleTime),
      estimatedFare: estimatedFare || 0
    });

    await ride.save();
    await ride.populate('userId', 'firstName lastName email');

    res.status(201).json({ 
      success: true, 
      message: 'Ride booked successfully',
      data: { ride }
    });

  } catch (error) {
    console.error('Ride booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book ride',
      error: error.message 
    });
  }
});

// Get user's rides
app.get('/api/rides/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only see their own rides, admins can see any user's rides
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const rides = await Ride.find({ userId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { rides }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch rides',
      error: error.message 
    });
  }
});

// Cancel ride
app.delete('/api/rides/:rideId', authenticateToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }

    // Users can only cancel their own rides, admins can cancel any ride
    if (req.user.role !== 'admin' && ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Update ride status
    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    ride.cancellationReason = reason || 'Cancelled by user';
    ride.updatedAt = new Date();

    await ride.save();

    res.json({ 
      success: true, 
      message: 'Ride cancelled successfully',
      data: { ride }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel ride',
      error: error.message 
    });
  }
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

// Get all rides (Admin only)
app.get('/api/admin/rides', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const rides = await Ride.find(filter)
      .populate('userId', 'firstName lastName email department employeeId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(filter);

    res.json({ 
      success: true, 
      data: { 
        rides,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch rides',
      error: error.message 
    });
  }
});

// Approve ride
app.put('/api/admin/rides/:rideId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }

    ride.status = 'approved';
    ride.approvedAt = new Date();
    ride.updatedAt = new Date();

    await ride.save();

    // Log admin action
    const adminAction = new AdminAction({
      adminId: req.user._id,
      rideId: ride._id,
      action: 'approved'
    });
    await adminAction.save();

    await ride.populate('userId', 'firstName lastName email');

    res.json({ 
      success: true, 
      message: 'Ride approved successfully',
      data: { ride }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve ride',
      error: error.message 
    });
  }
});

// Reject ride
app.put('/api/admin/rides/:rideId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }

    ride.status = 'rejected';
    ride.cancellationReason = reason;
    ride.updatedAt = new Date();

    await ride.save();

    // Log admin action
    const adminAction = new AdminAction({
      adminId: req.user._id,
      rideId: ride._id,
      action: 'rejected',
      reason
    });
    await adminAction.save();

    await ride.populate('userId', 'firstName lastName email');

    res.json({ 
      success: true, 
      message: 'Ride rejected successfully',
      data: { ride }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject ride',
      error: error.message 
    });
  }
});

// Get analytics
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalRides = await Ride.countDocuments();
    const pendingRides = await Ride.countDocuments({ status: 'pending' });
    const approvedRides = await Ride.countDocuments({ status: 'approved' });
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

    const analytics = {
      overview: {
        totalRides,
        totalUsers,
        activeUsers,
        completionRate: totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(1) : 0
      },
      rideStats: {
        pending: pendingRides,
        approved: approvedRides,
        completed: completedRides,
        cancelled: cancelledRides
      }
    };

    res.json({ 
      success: true, 
      data: analytics
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

// Seed admin user
app.post('/api/seed', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@company.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        password: hashedPassword,
        phone: '+91 98765 43200',
        department: 'Operations',
        employeeId: 'ADM001',
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created');
    }

    res.json({ 
      success: true, 
      message: 'Database seeded successfully',
      admin: {
        email: 'admin@company.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Seeding failed',
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Rapido Corporate Ride API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    port: PORT
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 =================================');
  console.log('🚗 Rapido Corporate Ride API');
  console.log('🚀 =================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🌱 Seed: http://localhost:${PORT}/api/seed`);
  console.log('🚀 =================================\n');
});

module.exports = app;
