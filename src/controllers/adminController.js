const Ride = require('../models/Ride');
const User = require('../models/User');
const AdminAction = require('../models/AdminAction');

// @desc    Get all rides for admin
// @route   GET /api/admin/rides
// @access  Private/Admin
const getAllRides = async (req, res, next) => {
  try {
    const { status, userId, startDate, endDate, department } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate || endDate) {
      query.scheduleTime = {};
      if (startDate) query.scheduleTime.$gte = new Date(startDate);
      if (endDate) query.scheduleTime.$lte = new Date(endDate);
    }

    // If filtering by department, first get users from that department
    if (department) {
      const users = await User.find({ department: department }).select('_id');
      query.userId = { $in: users.map(user => user._id) };
    }

    const rides = await Ride.find(query)
      .populate('userId', 'firstName lastName email employeeId department')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Ride.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: {
        rides
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve ride
// @route   PUT /api/admin/rides/:id/approve
// @access  Private/Admin
const approveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve pending rides'
      });
    }

    ride.status = 'approved';
    ride.approvedBy = req.user.id;
    ride.approvedAt = new Date();
    ride.adminComments = req.body.comments || '';

    await ride.save();

    // Log admin action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'approve_ride',
      targetType: 'Ride',
      targetId: ride._id,
      details: {
        rideId: ride._id,
        userId: ride.userId,
        comments: req.body.comments
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ride approved successfully',
      data: {
        ride
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject ride
// @route   PUT /api/admin/rides/:id/reject
// @access  Private/Admin
const rejectRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending rides'
      });
    }

    ride.status = 'rejected';
    ride.rejectedBy = req.user.id;
    ride.rejectedAt = new Date();
    ride.rejectionReason = req.body.reason || 'Not approved';
    ride.adminComments = req.body.comments || '';

    await ride.save();

    // Log admin action
    await AdminAction.create({
      adminId: req.user.id,
      action: 'reject_ride',
      targetType: 'Ride',
      targetId: ride._id,
      details: {
        rideId: ride._id,
        userId: ride.userId,
        reason: req.body.reason,
        comments: req.body.comments
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ride rejected successfully',
      data: {
        ride
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ride analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getRideAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    // Build match query
    const matchQuery = {};
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Basic analytics
    const totalRides = await Ride.countDocuments(matchQuery);
    const pendingRides = await Ride.countDocuments({ ...matchQuery, status: 'pending' });
    const approvedRides = await Ride.countDocuments({ ...matchQuery, status: 'approved' });
    const rejectedRides = await Ride.countDocuments({ ...matchQuery, status: 'rejected' });
    const completedRides = await Ride.countDocuments({ ...matchQuery, status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ ...matchQuery, status: 'cancelled' });

    // Department wise analytics
    const departmentAnalytics = await Ride.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          totalRides: { $sum: 1 },
          totalFare: { $sum: '$estimatedFare' },
          avgFare: { $avg: '$estimatedFare' }
        }
      },
      { $sort: { totalRides: -1 } }
    ]);

    // Status wise analytics over time
    const monthlyAnalytics = await Ride.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          totalFare: { $sum: '$estimatedFare' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Total fare calculations
    const fareAnalytics = await Ride.aggregate([
      { $match: { ...matchQuery, status: { $in: ['completed', 'approved'] } } },
      {
        $group: {
          _id: null,
          totalFare: { $sum: '$estimatedFare' },
          avgFare: { $avg: '$estimatedFare' },
          maxFare: { $max: '$estimatedFare' },
          minFare: { $min: '$estimatedFare' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRides,
          pendingRides,
          approvedRides,
          rejectedRides,
          completedRides,
          cancelledRides,
          approvalRate: totalRides > 0 ? ((approvedRides / totalRides) * 100).toFixed(2) : 0
        },
        departmentAnalytics,
        monthlyAnalytics,
        fareAnalytics: fareAnalytics[0] || {
          totalFare: 0,
          avgFare: 0,
          maxFare: 0,
          minFare: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin actions log
// @route   GET /api/admin/actions
// @access  Private/Admin
const getAdminActions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const actions = await AdminAction.find()
      .populate('adminId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await AdminAction.countDocuments();

    res.status(200).json({
      success: true,
      count: actions.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: {
        actions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRides,
  approveRide,
  rejectRide,
  getRideAnalytics,
  getAdminActions
};
