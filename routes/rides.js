const express = require('express');
const Ride = require('../models/Ride');
const { authenticate, requireOwnershipOrAdmin } = require('../middleware/auth');
const { 
    validateRideCreation, 
    validateRideUpdate, 
    validateObjectId, 
    validatePagination,
    validateDateRange 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride booking and management endpoints
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /rides:
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
 *                 example: Tech Park, Electronic City
 *               drop:
 *                 type: string
 *                 example: Koramangala, Bangalore
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T09:30:00Z
 *               estimatedFare:
 *                 type: number
 *                 example: 250
 *               distance:
 *                 type: number
 *                 example: 15.5
 *               duration:
 *                 type: number
 *                 example: 45
 *     responses:
 *       201:
 *         description: Ride request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Ride request created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ride:
 *                       $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error
 */
router.post('/', validateRideCreation, async (req, res) => {
    try {
        const rideData = {
            ...req.body,
            userId: req.user._id
        };

        const ride = await Ride.create(rideData);
        
        // Populate user data
        await ride.populate('userId', 'firstName lastName email employeeId department');

        res.status(201).json({
            status: 'success',
            message: 'Ride request created successfully',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Create ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create ride request'
        });
    }
});

/**
 * @swagger
 * /rides:
 *   get:
 *     summary: Get user's rides
 *     tags: [Rides]
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, in_progress, completed, cancelled]
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
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', validatePagination, validateDateRange, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { userId: req.user._id };
        
        if (req.query.status) {
            filter.status = req.query.status;
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

        // Get rides with pagination
        const rides = await Ride.find(filter)
            .populate('userId', 'firstName lastName email employeeId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Ride.countDocuments(filter);
        const pages = Math.ceil(total / limit);

        res.status(200).json({
            status: 'success',
            data: {
                rides,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });
    } catch (error) {
        console.error('Get rides error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get rides'
        });
    }
});

/**
 * @swagger
 * /rides/{id}:
 *   get:
 *     summary: Get ride details
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully
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
 *                     ride:
 *                       $ref: '#/components/schemas/Ride'
 *       404:
 *         description: Ride not found
 */
router.get('/:id', validateObjectId('id'), async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'firstName lastName email employeeId department');

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        // Check if user owns the ride or is admin
        if (ride.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to access this ride'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Get ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get ride details'
        });
    }
});

/**
 * @swagger
 * /rides/{id}:
 *   put:
 *     summary: Update ride (only if pending)
 *     tags: [Rides]
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
 *             properties:
 *               pickup:
 *                 type: string
 *               drop:
 *                 type: string
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *               estimatedFare:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ride updated successfully
 *       400:
 *         description: Ride cannot be modified
 *       404:
 *         description: Ride not found
 */
router.put('/:id', validateObjectId('id'), validateRideUpdate, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        // Check ownership
        if (ride.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this ride'
            });
        }

        // Check if ride can be modified
        if (!ride.canBeModified()) {
            return res.status(400).json({
                status: 'error',
                message: 'Ride cannot be modified. Only pending rides can be updated.'
            });
        }

        const updatedRide = await Ride.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email employeeId');

        res.status(200).json({
            status: 'success',
            message: 'Ride updated successfully',
            data: {
                ride: updatedRide
            }
        });
    } catch (error) {
        console.error('Update ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update ride'
        });
    }
});

/**
 * @swagger
 * /rides/{id}/cancel:
 *   patch:
 *     summary: Cancel ride
 *     tags: [Rides]
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
 *                 example: Change of plans
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *       400:
 *         description: Ride cannot be cancelled
 *       404:
 *         description: Ride not found
 */
router.patch('/:id/cancel', validateObjectId('id'), async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Cancellation reason is required'
            });
        }

        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        // Check ownership
        if (ride.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to cancel this ride'
            });
        }

        // Check if ride can be cancelled
        if (!ride.canBeCancelled()) {
            return res.status(400).json({
                status: 'error',
                message: 'Ride cannot be cancelled. Only pending or approved rides can be cancelled.'
            });
        }

        ride.status = 'cancelled';
        ride.cancellationReason = reason;
        ride.cancelledBy = req.user._id;
        ride.cancelledAt = new Date();

        await ride.save();
        await ride.populate('userId', 'firstName lastName email employeeId');

        res.status(200).json({
            status: 'success',
            message: 'Ride cancelled successfully',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Cancel ride error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel ride'
        });
    }
});

/**
 * @swagger
 * /rides/{id}/feedback:
 *   post:
 *     summary: Submit ride feedback
 *     tags: [Rides]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent service!
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid feedback or ride not completed
 *       404:
 *         description: Ride not found
 */
router.post('/:id/feedback', validateObjectId('id'), async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({
                status: 'error',
                message: 'Ride not found'
            });
        }

        // Check ownership
        if (ride.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to provide feedback for this ride'
            });
        }

        // Check if ride is completed
        if (ride.status !== 'completed') {
            return res.status(400).json({
                status: 'error',
                message: 'Feedback can only be provided for completed rides'
            });
        }

        ride.feedback = {
            rating,
            comment: comment || ''
        };

        await ride.save();
        await ride.populate('userId', 'firstName lastName email employeeId');

        res.status(200).json({
            status: 'success',
            message: 'Feedback submitted successfully',
            data: {
                ride
            }
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit feedback'
        });
    }
});

module.exports = router;
