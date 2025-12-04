const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');
const { validateNotification, validatePreferences } = require('../validators/notificationValidator');

const router = express.Router();

/**
 * Public Routes
 */
// Unsubscribe route (accessible without authentication)
router.patch('/unsubscribe/:token', notificationController.unsubscribe);

// Webhook endpoints (should be secured with provider-specific verification)
router.post('/webhook/sendgrid', notificationController.handleWebhook);
router.post('/webhook/twilio', notificationController.handleWebhook);
router.post('/webhook/sms', notificationController.handleWebhook);

/**
 * Protected Routes
 */
router.use(authController.protect);

/**
 * User Notification Routes
 */
router.route('/my-notifications')
  .get(notificationController.getMyNotifications);

router.route('/my-notifications/:id')
  .delete(notificationController.deleteNotification);

router.patch('/my-notifications/:id/read',
  notificationController.markAsRead
);

router.patch('/my-notifications/read-all',
  notificationController.markAllAsRead
);

/**
 * User Preferences Routes
 */
router.route('/preferences')
  .get(notificationController.getMyPreferences)
  .patch(validatePreferences, notificationController.updateMyPreferences);

/**
 * Send Notification Routes
 */
router.post('/send',
  validateNotification,
  notificationController.sendNotification
);

/**
 * Admin Routes
 */
router.use(authController.restrictTo('admin'));

/**
 * Bulk Operations (Admin)
 */
router.post('/bulk-send',
  notificationController.sendBulkNotifications
);

/**
 * Template Management (Admin)
 */
router.route('/templates')
  .get(notificationController.getTemplates)
  .post(notificationController.createTemplate);

router.route('/templates/:id')
  .patch(notificationController.updateTemplate)
  .delete(notificationController.deleteTemplate);

/**
 * Analytics (Admin)
 */
router.get('/analytics',
  notificationController.getAnalytics
);

/**
 * System Operations (Admin)
 */
router.post('/test',
  notificationController.testNotification
);

router.post('/process-scheduled',
  notificationController.processScheduledNotifications
);

/**
 * Full CRUD for notifications (Admin)
 */
router.route('/admin/notifications')
  .get(notificationController.getAllNotifications);

router.route('/admin/notifications/:id')
  .get(notificationController.getNotification)
  .patch(notificationController.updateNotification);

module.exports = router;