const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * User registration validation rules
 */
const validateUserRegistration = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    
    body('department')
        .isIn(['Engineering', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Legal', 'Customer Support'])
        .withMessage('Please provide a valid department'),
    
    body('employeeId')
        .trim()
        .notEmpty()
        .withMessage('Employee ID is required')
        .isLength({ max: 20 })
        .withMessage('Employee ID cannot exceed 20 characters'),
    
    handleValidationErrors
];

/**
 * User login validation rules
 */
const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

/**
 * Ride creation validation rules
 */
const validateRideCreation = [
    body('pickup')
        .trim()
        .notEmpty()
        .withMessage('Pickup location is required')
        .isLength({ max: 200 })
        .withMessage('Pickup location cannot exceed 200 characters'),
    
    body('drop')
        .trim()
        .notEmpty()
        .withMessage('Drop location is required')
        .isLength({ max: 200 })
        .withMessage('Drop location cannot exceed 200 characters'),
    
    body('scheduleTime')
        .isISO8601()
        .withMessage('Please provide a valid schedule time')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Schedule time must be in the future');
            }
            return true;
        }),
    
    body('estimatedFare')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Estimated fare must be a positive number'),
    
    handleValidationErrors
];

/**
 * Ride update validation rules
 */
const validateRideUpdate = [
    body('pickup')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Pickup location cannot be empty')
        .isLength({ max: 200 })
        .withMessage('Pickup location cannot exceed 200 characters'),
    
    body('drop')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Drop location cannot be empty')
        .isLength({ max: 200 })
        .withMessage('Drop location cannot exceed 200 characters'),
    
    body('scheduleTime')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid schedule time')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Schedule time must be in the future');
            }
            return true;
        }),
    
    body('estimatedFare')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Estimated fare must be a positive number'),
    
    handleValidationErrors
];

/**
 * ObjectId parameter validation
 */
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`${paramName} must be a valid ID`),
    
    handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

/**
 * Date range validation
 */
const validateDateRange = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    handleValidationErrors
];

/**
 * Ride status validation
 */
const validateRideStatus = [
    body('status')
        .isIn(['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid ride status'),
    
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Reason cannot exceed 1000 characters'),
    
    handleValidationErrors
];

/**
 * User profile update validation
 */
const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('First name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Last name cannot be empty')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    
    body('department')
        .optional()
        .isIn(['Engineering', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Legal', 'Customer Support'])
        .withMessage('Please provide a valid department'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateRideCreation,
    validateRideUpdate,
    validateObjectId,
    validatePagination,
    validateDateRange,
    validateRideStatus,
    validateProfileUpdate
};
