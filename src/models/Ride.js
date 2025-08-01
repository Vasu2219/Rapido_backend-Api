const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  pickup: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  drop: {
    type: String,
    required: [true, 'Drop location is required'],
    trim: true
  },
  scheduleTime: {
    type: Date,
    required: [true, 'Schedule time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedFare: {
    type: Number,
    default: 0
  },
  actualFare: {
    type: Number,
    default: 0
  },
  driver: {
    name: String,
    phone: String,
    vehicle: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  cancelledAt: Date,
  cancellationReason: String,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
}, {
  timestamps: true
});

// Indexes
rideSchema.index({ userId: 1, createdAt: -1 });
rideSchema.index({ status: 1, scheduleTime: 1 });
rideSchema.index({ scheduleTime: 1 });
rideSchema.index({ createdAt: -1 });

// Virtual for ride duration
rideSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status];
});

rideSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ride', rideSchema);
