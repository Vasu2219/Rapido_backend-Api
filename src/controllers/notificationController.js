const User = require('../models/User');
const Ride = require('../models/Ride');

// Simple in-memory notification store (in production, use Redis or WebSocket)
let notifications = [];

// @desc    Get notifications for admin
// @route   GET /api/notifications/admin
// @access  Private/Admin
const getAdminNotifications = async (req, res, next) => {
  try {
    // Get recent pending rides as notifications
    const pendingRides = await Ride.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email employeeId')
      .sort({ createdAt: -1 })
      .limit(10);

    const notifications = pendingRides.map(ride => ({
      id: ride._id,
      type: 'new_ride_request',
      title: 'New Ride Request',
      message: `${ride.userId.firstName} ${ride.userId.lastName} requested a ride`,
      data: {
        rideId: ride._id,
        pickup: ride.pickup,
        drop: ride.drop,
        scheduleTime: ride.scheduleTime,
        userId: ride.userId._id,
        userName: `${ride.userId.firstName} ${ride.userId.lastName}`,
        employeeId: ride.userId.employeeId
      },
      createdAt: ride.createdAt,
      read: false
    }));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: {
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification count for admin
// @route   GET /api/notifications/admin/count
// @access  Private/Admin
const getAdminNotificationCount = async (req, res, next) => {
  try {
    const pendingCount = await Ride.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        pendingRides: pendingCount,
        totalNotifications: pendingCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification when ride is booked (called internally)
const notifyAdminNewRide = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId)
      .populate('userId', 'firstName lastName email employeeId');
    
    if (ride) {
      console.log(`🔔 NOTIFICATION: New ride request from ${ride.userId.firstName} ${ride.userId.lastName}`);
      console.log(`📍 Route: ${ride.pickup} → ${ride.drop}`);
      console.log(`⏰ Scheduled: ${ride.scheduleTime}`);
      
      // In a real app, you would send push notification, email, or WebSocket message here
      // For now, we'll just log it and rely on polling
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// @desc    Send notification when ride status changes (called internally)
const notifyUserRideUpdate = async (rideId, status, adminId) => {
  try {
    const ride = await Ride.findById(rideId)
      .populate('userId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .populate('rejectedBy', 'firstName lastName');
    
    if (ride) {
      const adminName = status === 'approved' 
        ? `${ride.approvedBy?.firstName} ${ride.approvedBy?.lastName}`
        : `${ride.rejectedBy?.firstName} ${ride.rejectedBy?.lastName}`;
        
      console.log(`🔔 NOTIFICATION: Ride ${status} by ${adminName}`);
      console.log(`👤 User: ${ride.userId.firstName} ${ride.userId.lastName}`);
      console.log(`📍 Route: ${ride.pickup} → ${ride.drop}`);
      
      // In a real app, you would send push notification to the user here
    }
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
};

module.exports = {
  getAdminNotifications,
  getAdminNotificationCount,
  notifyAdminNewRide,
  notifyUserRideUpdate
};
