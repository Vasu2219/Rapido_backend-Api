const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminAction:
 *       type: object
 *       required:
 *         - adminId
 *         - action
 *         - targetType
 *         - targetId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         adminId:
 *           type: string
 *           description: Reference to admin user
 *         action:
 *           type: string
 *           enum: [approve_ride, reject_ride, cancel_ride, create_user, update_user, delete_user, view_analytics]
 *           description: Type of action performed
 *         targetType:
 *           type: string
 *           enum: [ride, user, system]
 *           description: Type of target entity
 *         targetId:
 *           type: string
 *           description: ID of the target entity
 *         details:
 *           type: object
 *           description: Additional details about the action
 *         reason:
 *           type: string
 *           description: Reason for the action (e.g., rejection reason)
 *         ipAddress:
 *           type: string
 *           description: IP address from which action was performed
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const adminActionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    },
    action: {
        type: String,
        required: [true, 'Action type is required'],
        enum: [
            'approve_ride',
            'reject_ride', 
            'cancel_ride',
            'assign_driver',
            'create_user',
            'update_user',
            'delete_user',
            'deactivate_user',
            'activate_user',
            'view_analytics',
            'export_data',
            'system_login',
            'system_logout'
        ]
    },
    targetType: {
        type: String,
        required: [true, 'Target type is required'],
        enum: ['ride', 'user', 'system', 'analytics']
    },
    targetId: {
        type: String,
        required: function() {
            return this.targetType !== 'system' && this.targetType !== 'analytics';
        }
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    previousValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for audit trail queries
adminActionSchema.index({ adminId: 1 });
adminActionSchema.index({ action: 1 });
adminActionSchema.index({ targetType: 1 });
adminActionSchema.index({ targetId: 1 });
adminActionSchema.index({ createdAt: -1 });
adminActionSchema.index({ adminId: 1, createdAt: -1 });
adminActionSchema.index({ action: 1, createdAt: -1 });

// Static methods for audit queries
adminActionSchema.statics.getAdminActions = function(adminId, limit = 50) {
    return this.find({ adminId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email employeeId');
};

adminActionSchema.statics.getActionsByType = function(action, limit = 100) {
    return this.find({ action })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email employeeId');
};

adminActionSchema.statics.getRecentActions = function(hours = 24, limit = 100) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.find({ createdAt: { $gte: startTime } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('adminId', 'firstName lastName email employeeId');
};

adminActionSchema.statics.getActionsByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    })
    .sort({ createdAt: -1 })
    .populate('adminId', 'firstName lastName email employeeId');
};

// Static method to log admin action
adminActionSchema.statics.logAction = async function(actionData) {
    try {
        const action = new this(actionData);
        await action.save();
        return action;
    } catch (error) {
        console.error('Error logging admin action:', error);
        throw error;
    }
};

module.exports = mongoose.model('AdminAction', adminActionSchema);
