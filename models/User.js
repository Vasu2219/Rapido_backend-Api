const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - phone
 *         - department
 *         - employeeId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *           example: john.doe@company.com
 *         password:
 *           type: string
 *           description: Hashed password
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: +91 98765 43210
 *         department:
 *           type: string
 *           description: User's department
 *           example: Engineering
 *         employeeId:
 *           type: string
 *           description: Unique employee identifier
 *           example: EMP001
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: User role
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Account status
 *         profilePicture:
 *           type: string
 *           description: URL to profile picture
 *         preferences:
 *           type: object
 *           properties:
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                   default: true
 *                 sms:
 *                   type: boolean
 *                   default: true
 *                 push:
 *                   type: boolean
 *                   default: true
 *             defaultPickup:
 *               type: string
 *               description: Default pickup location
 *             defaultDrop:
 *               type: string
 *               description: Default drop location
 *             paymentMethod:
 *               type: string
 *               enum: [wallet, card, upi, cash]
 *               default: wallet
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            'Engineering',
            'Marketing',
            'Sales',
            'Operations',
            'HR',
            'Finance',
            'Legal',
            'Customer Support'
        ]
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        defaultPickup: { type: String, default: '' },
        defaultDrop: { type: String, default: '' },
        paymentMethod: {
            type: String,
            enum: ['wallet', 'card', 'upi', 'cash'],
            default: 'wallet'
        }
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Index for faster queries (email and employeeId already indexed via unique: true)
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash password if it's modified or new
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by email with password
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email }).select('+password');
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
