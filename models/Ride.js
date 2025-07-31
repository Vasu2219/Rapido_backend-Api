const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       type: object
 *       required:
 *         - userId
 *         - pickup
 *         - drop
 *         - scheduleTime
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         userId:
 *           type: string
 *           description: Reference to User who booked the ride
 *         pickup:
 *           type: string
 *           description: Pickup location
 *           example: Tech Park, Electronic City
 *         drop:
 *           type: string
 *           description: Drop location
 *           example: Koramangala, Bangalore
 *         scheduleTime:
 *           type: string
 *           format: date-time
 *           description: Scheduled ride time
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, in_progress, completed, cancelled]
 *           default: pending
 *         estimatedFare:
 *           type: number
 *           description: Estimated fare for the ride
 *           example: 250
 *         actualFare:
 *           type: number
 *           description: Actual fare charged
 *         driver:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Driver ID
 *             name:
 *               type: string
 *               description: Driver name
 *             phone:
 *               type: string
 *               description: Driver phone number
 *             vehicle:
 *               type: string
 *               description: Vehicle number
 *             rating:
 *               type: number
 *               description: Driver rating
 *         approvedBy:
 *           type: string
 *           description: Admin who approved the ride
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         rejectedBy:
 *           type: string
 *           description: Admin who rejected the ride
 *         rejectedAt:
 *           type: string
 *           format: date-time
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection
 *         feedback:
 *           type: object
 *           properties:
 *             rating:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             comment:
 *               type: string
 *         cancellationReason:
 *           type: string
 *           description: Reason for cancellation
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const rideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    pickup: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true,
        maxlength: [200, 'Pickup location cannot exceed 200 characters']
    },
    drop: {
        type: String,
        required: [true, 'Drop location is required'],
        trim: true,
        maxlength: [200, 'Drop location cannot exceed 200 characters']
    },
    scheduleTime: {
        type: Date,
        required: [true, 'Schedule time is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Schedule time must be in the future'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    estimatedFare: {
        type: Number,
        min: [0, 'Estimated fare cannot be negative'],
        default: 0
    },
    actualFare: {
        type: Number,
        min: [0, 'Actual fare cannot be negative'],
        default: null
    },
    driver: {
        id: { type: String, default: null },
        name: { type: String, default: null },
        phone: { type: String, default: null },
        vehicle: { type: String, default: null },
        rating: { 
            type: Number, 
            min: 1, 
            max: 5, 
            default: null 
        }
    },
    // Admin approval tracking
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    // Ride completion
    completedAt: {
        type: Date,
        default: null
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
        }
    },
    // Cancellation tracking
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Additional metadata
    distance: {
        type: Number, // in kilometers
        min: [0, 'Distance cannot be negative'],
        default: null
    },
    duration: {
        type: Number, // in minutes
        min: [0, 'Duration cannot be negative'],
        default: null
    },
    route: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better query performance
rideSchema.index({ userId: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ scheduleTime: 1 });
rideSchema.index({ createdAt: -1 });
rideSchema.index({ userId: 1, status: 1 });
rideSchema.index({ scheduleTime: 1, status: 1 });

// Virtual for ride duration in hours
rideSchema.virtual('scheduleDuration').get(function() {
    if (this.scheduleTime && this.completedAt) {
        return Math.round((this.completedAt - this.scheduleTime) / (1000 * 60 * 60)); // hours
    }
    return null;
});

// Pre-save middleware to set completion time
rideSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }
    next();
});

// Static methods
rideSchema.statics.findByUser = function(userId) {
    return this.find({ userId }).populate('userId', 'firstName lastName email employeeId');
};

rideSchema.statics.findPendingRides = function() {
    return this.find({ status: 'pending' }).populate('userId', 'firstName lastName email employeeId department');
};

rideSchema.statics.findRidesByStatus = function(status) {
    return this.find({ status }).populate('userId', 'firstName lastName email employeeId department');
};

rideSchema.statics.findRidesByDateRange = function(startDate, endDate) {
    return this.find({
        scheduleTime: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('userId', 'firstName lastName email employeeId department');
};

// Instance methods
rideSchema.methods.canBeCancelled = function() {
    return ['pending', 'approved'].includes(this.status);
};

rideSchema.methods.canBeModified = function() {
    return this.status === 'pending';
};

module.exports = mongoose.model('Ride', rideSchema);
