const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route to verify routing works
router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'TEST ROUTE WORKING - NEW VERSION',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new employee account in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             employee:
 *               summary: Employee Registration
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@company.com"
 *                 password: "SecurePass123!"
 *                 phone: "+91-9876543210"
 *                 employeeId: "EMP001"
 *                 department: "Engineering"
 *                 role: "user"
 *             admin:
 *               summary: Admin Registration
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane.smith@company.com"
 *                 password: "AdminPass123!"
 *                 phone: "+91-9876543211"
 *                 employeeId: "ADMIN001"
 *                 department: "HR"
 *                 role: "admin"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   _id: "60d5ecb74d8b8e001c8e4b1a"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john.doe@company.com"
 *                   employeeId: "EMP001"
 *                   department: "Engineering"
 *                   role: "employee"
 *                   isActive: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "john.doe@company.com"
 *             password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   _id: "60d5ecb74d8b8e001c8e4b1a"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john.doe@company.com"
 *                   role: "employee"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid email or password"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', (req, res) => {
  console.log('🔥 DIRECT LOGIN ROUTE CALLED');
  res.json({
    success: true,
    message: 'DIRECT LOGIN ROUTE WORKING',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User profile retrieved successfully"
 *               data:
 *                 user:
 *                   _id: "60d5ecb74d8b8e001c8e4b1a"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john.doe@company.com"
 *                   employeeId: "EMP001"
 *                   department: "Engineering"
 *                   role: "employee"
 *                   isActive: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Authentication]
 *     summary: Update user profile
 *     description: Update the profile information of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Smith"
 *               phone:
 *                 type: string
 *                 example: "+91-9876543210"
 *               department:
 *                 type: string
 *                 example: "Marketing"
 *           example:
 *             firstName: "John"
 *             lastName: "Smith"
 *             phone: "+91-9876543210"
 *             department: "Marketing"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/profile', protect, updateProfile);

module.exports = router;
