const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI + 'rapido-corporate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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
  driverId: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
  vehicle: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Ride = mongoose.model('Ride', rideSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// AUTH ROUTES
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, department, employeeId } = req.body;

    // Check if user exists
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
    const hashedPassword = await bcryptjs.hash(password, 12);

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
          role: user.role,
          department: user.department,
          employeeId: user.employeeId
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
          role: user.role,
          department: user.department,
          employeeId: user.employeeId
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// RIDE ROUTES
// Get user's rides
app.get('/api/rides/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can access these rides
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const rides = await Ride.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rides
    });

  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching rides' 
    });
  }
});

// Create new ride
app.post('/api/rides', authenticateToken, async (req, res) => {
  try {
    const { pickup, drop, scheduleTime, estimatedFare } = req.body;

    const ride = new Ride({
      userId: req.user.userId,
      pickup,
      drop,
      scheduleTime: new Date(scheduleTime),
      estimatedFare
    });

    await ride.save();

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      data: ride
    });

  } catch (error) {
    console.error('Book ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error booking ride' 
    });
  }
});

// Cancel ride
app.delete('/api/rides/:rideId', authenticateToken, async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }

    // Check ownership or admin
    if (ride.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    ride.cancellationReason = 'Cancelled by user';
    ride.updatedAt = new Date();

    await ride.save();

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: ride
    });

  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error cancelling ride' 
    });
  }
});

// ADMIN ROUTES
// Get all rides
app.get('/api/admin/rides', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
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
    console.error('Get all rides error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching rides' 
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
    ride.approvedBy = req.user.userId;
    ride.approvedAt = new Date();
    ride.updatedAt = new Date();

    await ride.save();

    res.json({
      success: true,
      message: 'Ride approved successfully',
      data: ride
    });

  } catch (error) {
    console.error('Approve ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error approving ride' 
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
    ride.rejectedBy = req.user.userId;
    ride.rejectedAt = new Date();
    ride.rejectionReason = reason || 'No reason provided';
    ride.updatedAt = new Date();

    await ride.save();

    res.json({
      success: true,
      message: 'Ride rejected successfully',
      data: ride
    });

  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error rejecting ride' 
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
    
    // Get rides from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRides = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalRides,
          pendingRides,
          approvedRides,
          completedRides,
          cancelledRides,
          totalUsers
        },
        dailyRides: recentRides
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching analytics' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - User login`);
  console.log(`   GET  /api/rides/user/:userId - Get user rides`);
  console.log(`   POST /api/rides - Book new ride`);
  console.log(`   DELETE /api/rides/:rideId - Cancel ride`);
  console.log(`   GET  /api/admin/rides - Get all rides (admin)`);
  console.log(`   PUT  /api/admin/rides/:rideId/approve - Approve ride (admin)`);
  console.log(`   PUT  /api/admin/rides/:rideId/reject - Reject ride (admin)`);
  console.log(`   GET  /api/admin/analytics - Get analytics (admin)`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = app;
