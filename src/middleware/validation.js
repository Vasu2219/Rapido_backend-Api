const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Employee ID can only contain uppercase letters and numbers'),
  
  body('department')
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'])
    .withMessage('Please select a valid department'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// User profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('department')
    .optional()
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'])
    .withMessage('Please select a valid department'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Ride creation validation
const validateRideCreation = [
  body('pickup.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Pickup address must be between 5 and 200 characters'),
  
  body('pickup.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pickup latitude must be a valid coordinate'),
  
  body('pickup.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Pickup longitude must be a valid coordinate'),
  
  body('drop.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Drop address must be between 5 and 200 characters'),
  
  body('drop.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Drop latitude must be a valid coordinate'),
  
  body('drop.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Drop longitude must be a valid coordinate'),
  
  body('scheduleTime')
    .isISO8601()
    .withMessage('Schedule time must be a valid ISO 8601 date')
    .custom((value) => {
      const scheduleDate = new Date(value);
      const now = new Date();
      if (scheduleDate <= now) {
        throw new Error('Schedule time must be in the future');
      }
      return true;
    }),
  
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Purpose must not exceed 500 characters'),
  
  body('specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Special requirements must not exceed 300 characters'),
  
  handleValidationErrors
];

// Ride update validation
const validateRideUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ride ID format'),
  
  body('pickup.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Pickup address must be between 5 and 200 characters'),
  
  body('drop.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Drop address must be between 5 and 200 characters'),
  
  body('scheduleTime')
    .optional()
    .isISO8601()
    .withMessage('Schedule time must be a valid ISO 8601 date'),
  
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Purpose must not exceed 500 characters'),
  
  body('specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Special requirements must not exceed 300 characters'),
  
  handleValidationErrors
];

// Ride status update validation (for admin)
const validateRideStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ride ID format'),
  
  body('status')
    .isIn(['approved', 'rejected', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a ride')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters'),
  
  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .notEmpty()
    .withMessage('Cancellation reason is required when cancelling a ride')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters'),
  
  body('actualFare')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual fare must be a positive number'),
  
  body('driver.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Driver name must be between 2 and 100 characters'),
  
  body('driver.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Driver phone must be a valid phone number'),
  
  body('driver.vehicle')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vehicle information must be between 2 and 100 characters'),
  
  body('driver.rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Driver rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Query parameter validation
const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'scheduleTime', 'status', 'estimatedFare'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  handleValidationErrors
];

// ID parameter validation
const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// User ID parameter validation
const validateUserIdParam = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateRideCreation,
  validateRideUpdate,
  validateRideStatusUpdate,
  validateQueryParams,
  validateIdParam,
  validateUserIdParam
};
