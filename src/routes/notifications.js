const express = require('express');
const {
  getAdminNotifications,
  getAdminNotificationCount
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/notifications/admin:
 *   get:
 *     tags: [Notifications]
 *     summary: Get admin notifications
 *     description: Retrieve notifications for admin users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/admin', authorize('admin'), getAdminNotifications);

/**
 * @swagger
 * /api/notifications/admin/count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get admin notification count
 *     description: Get count of pending notifications for admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification count retrieved successfully
 */
router.get('/admin/count', authorize('admin'), getAdminNotificationCount);

module.exports = router;
