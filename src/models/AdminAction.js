const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'approve_ride',
      'reject_ride',
      'view_rides',
      'view_analytics',
      'create_user',
      'update_user',
      'delete_user'
    ]
  },
  targetType: {
    type: String,
    required: [true, 'Target type is required'],
    enum: ['ride', 'user', 'system']
  },
  targetId: {
    type: String,
    required: function() {
      return this.targetType !== 'system';
    }
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  reason: {
    type: String,
    trim: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
adminActionSchema.index({ adminId: 1, createdAt: -1 });
adminActionSchema.index({ action: 1, createdAt: -1 });
adminActionSchema.index({ targetType: 1, targetId: 1 });

// Static method to log action
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
