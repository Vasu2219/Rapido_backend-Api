const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const AdminAction = require('../models/AdminAction');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
    validateObjectId, 
    validatePagination, 
    validateDateRange,
    validateRideStatus 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /admin/rides:
 *   get:
 *     summary: Get all rides in system (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, in_progress, completed, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by user department
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Rides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     rides:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ride'
 *                     pagination:
 *                       type: object
 *                     filters:
 *                       type: object
 */
router.get('/rides', validatePagination, validateDateRange, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        
        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.userId) {
            filter.userId = req.query.userId;
        }

        if (req.query.startDate || req.query.endDate) {
            filter.scheduleTime = {};
            if (req.query.startDate) {
                filter.scheduleTime.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.scheduleTime.$lte = new Date(req.query.endDate);
            }
        }

        // Build aggregation pipeline for department filtering
        let pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            }
        ];

        // Add match stage for filters
        if (Object.keys(filter).length > 0 || req.query.department) {
            const matchFilter = { ...filter };
            if (req.query.department) {
                matchFilter['user.department'] = req.query.department;
            }
            pipeline.push({ $match: matchFilter });
        }

        // Add pagination
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        );

        const rides = await Ride.aggregate(pipeline);
        
        // Get total count for pagination
        const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
        countPipeline.push({ $count: 'total' });
        const countResult = await Ride.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;
        const pages = Math.ceil(total / limit);

        // Log admin action
        await AdminAction.logAction({
            adminId: req.user._id,
            action: 'view_analytics',
            targetType: 'ride',
            details: { 
                filters: req.query,
                resultCount: rides.length 
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({
            status: 'success',
            data: {
                rides,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                },
                filters: req.query
            }
        });
    } catch (error) {
        console.error('Get admin rides error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get rides'
        });
    }
});

/**
 * @swagger
 * /admin/rides/{id}/approve:
 *   patch:
 *     summary: Approve a ride (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driver:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   vehicle:
 *                     type: string
 *                   rating:
 *                     type: number
 *     responses:
 *       200:
 *         description: Ride approved successfully
 *       400:
 *         description: Ride cannot be approved
 *       404:
 *         description: Ride not found
 */
router.patch('/rides/:id/approve', validateObjectId('id'), async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'firstName lastName email employeeId department');

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        if (ride.status !== 'pending') {
            return res.status(400).json({
                status: 'error',
                message: 'Only pending rides can be approved'
            });
        }

        const previousStatus = ride.status;

        ride.status = 'approved';
        ride.approvedBy = req.user._id;
        ride.approvedAt = new Date();

        // Add driver information if provided
        if (req.body.driver) {
            ride.driver = req.body.driver;
        }

        await ride.save();

        // Log admin action
        await AdminAction.logAction({
            adminId: req.user._id,
            action: 'approve_ride',
            targetType: 'ride',
            targetId: ride._id.toString(),
            details: {
                rideDetails: {
                    pickup: ride.pickup,
                    drop: ride.drop,
                    scheduleTime: ride.scheduleTime,
                    userId: ride.userId._id
                },
                driver: ride.driver
            },
            previousValue: { status: previousStatus },
            newValue: { status: 'approved' },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({
            status: 'success',
            message: 'Ride approved successfully',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Approve ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve ride'
        });
    }
});

/**
 * @swagger
 * /admin/rides/{id}/reject:
 *   patch:
 *     summary: Reject a ride (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Invalid route or timing conflict
 *     responses:
 *       200:
 *         description: Ride rejected successfully
 *       400:
 *         description: Ride cannot be rejected or reason missing
 *       404:
 *         description: Ride not found
 */
router.patch('/rides/:id/reject', validateObjectId('id'), async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Rejection reason is required'
            });
        }

        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'firstName lastName email employeeId department');

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        if (ride.status !== 'pending') {
            return res.status(400).json({
                status: 'error',
                message: 'Only pending rides can be rejected'
            });
        }

        const previousStatus = ride.status;

        ride.status = 'rejected';
        ride.rejectedBy = req.user._id;
        ride.rejectedAt = new Date();
        ride.rejectionReason = reason;

        await ride.save();

        // Log admin action
        await AdminAction.logAction({
            adminId: req.user._id,
            action: 'reject_ride',
            targetType: 'ride',
            targetId: ride._id.toString(),
            details: {
                rideDetails: {
                    pickup: ride.pickup,
                    drop: ride.drop,
                    scheduleTime: ride.scheduleTime,
                    userId: ride.userId._id
                }
            },
            reason,
            previousValue: { status: previousStatus },
            newValue: { status: 'rejected' },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({
            status: 'success',
            message: 'Ride rejected successfully',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Reject ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reject ride'
        });
    }
});

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get ride analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: month
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     ridesByStatus:
 *                       type: array
 *                     ridesByDepartment:
 *                       type: array
 *                     dailyStats:
 *                       type: array
 *                     topUsers:
 *                       type: array
 */
router.get('/analytics', validateDateRange, async (req, res) => {
    try {
        const { period = 'month', startDate, endDate } = req.query;

        // Calculate date range based on period
        let dateFilter = {};
        const now = new Date();
        
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            switch (period) {
                case 'today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dateFilter = { createdAt: { $gte: today } };
                    break;
                case 'week':
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    dateFilter = { createdAt: { $gte: weekAgo } };
                    break;
                case 'month':
                    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    dateFilter = { createdAt: { $gte: monthAgo } };
                    break;
                case 'year':
                    const yearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
                    dateFilter = { createdAt: { $gte: yearAgo } };
                    break;
            }
        }

        // Overview statistics
        const overview = await Ride.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRides: { $sum: 1 },
                    completedRides: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelledRides: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    pendingRides: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $ne: ['$actualFare', null] }, '$actualFare', 0] }
                    },
                    averageFare: { $avg: '$estimatedFare' }
                }
            }
        ]);

        // Rides by status
        const ridesByStatus = await Ride.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Rides by department
        const ridesByDepartment = await Ride.aggregate([
            { $match: dateFilter },
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
                    count: { $sum: 1 },
                    totalFare: { $sum: '$estimatedFare' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Daily statistics for the last 7 days
        const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const dailyStats = await Ride.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    rides: { $sum: 1 },
                    revenue: { $sum: '$estimatedFare' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Top users by ride count
        const topUsers = await Ride.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$userId',
                    rideCount: { $sum: 1 },
                    totalSpent: { $sum: '$estimatedFare' }
                }
            },
            { $sort: { rideCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    'user.firstName': 1,
                    'user.lastName': 1,
                    'user.email': 1,
                    'user.department': 1,
                    rideCount: 1,
                    totalSpent: 1
                }
            }
        ]);

        // Log admin action
        await AdminAction.logAction({
            adminId: req.user._id,
            action: 'view_analytics',
            targetType: 'analytics',
            details: { 
                period,
                dateRange: dateFilter 
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(200).json({
            status: 'success',
            data: {
                overview: overview[0] || {
                    totalRides: 0,
                    completedRides: 0,
                    cancelledRides: 0,
                    pendingRides: 0,
                    totalRevenue: 0,
                    averageFare: 0
                },
                ridesByStatus,
                ridesByDepartment,
                dailyStats,
                topUsers,
                period,
                dateRange: dateFilter
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get analytics data'
        });
    }
});

/**
 * @swagger
 * /admin/actions:
 *   get:
 *     summary: Get admin action history (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filter by admin ID
 *     responses:
 *       200:
 *         description: Admin actions retrieved successfully
 */
router.get('/actions', validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.action) filter.action = req.query.action;
        if (req.query.adminId) filter.adminId = req.query.adminId;

        const actions = await AdminAction.find(filter)
            .populate('adminId', 'firstName lastName email employeeId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await AdminAction.countDocuments(filter);
        const pages = Math.ceil(total / limit);

        res.status(200).json({
            status: 'success',
            data: {
                actions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });
    } catch (error) {
        console.error('Get admin actions error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get admin actions'
        });
    }
});

module.exports = router;
