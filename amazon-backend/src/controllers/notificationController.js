const { Notification, NotificationTemplate, NotificationPreferences } = require('../models/Notification');
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

/**
 * Notification Controller
 * Handles notification management and user preferences
 */

/**
 * Send notification
 */
const sendNotification = catchAsync(async (req, res, next) => {
  const {
    userId,
    type,
    category,
    templateName,
    variables,
    relatedEntities,
    priority,
    scheduledFor,
    metadata
  } = req.body;

  // If userId not provided, use current user
  const targetUserId = userId || req.user.id;

  // Only admins can send notifications to other users
  if (targetUserId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only send notifications to yourself', 403));
  }

  try {
    const result = await notificationService.sendNotification({
      userId: targetUserId,
      type,
      category,
      templateName,
      variables,
      relatedEntities,
      priority,
      scheduledFor,
      metadata
    });

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

/**
 * Send bulk notifications (admin only)
 */
const sendBulkNotifications = catchAsync(async (req, res, next) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications)) {
    return next(new AppError('Notifications must be an array', 400));
  }

  try {
    const results = await notificationService.sendBulkNotifications(notifications);

    res.status(200).json({
      status: 'success',
      data: { results }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

/**
 * Get user's notifications
 */
const getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { type, category, status, unread } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { user: userId };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (unread === 'true') {
    filter.status = { $nin: ['opened', 'clicked'] };
  }

  const notifications = await Notification.find(filter)
    .populate('template', 'name category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    status: { $nin: ['opened', 'clicked'] }
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    unreadCount,
    data: { notifications }
  });
});

/**
 * Mark notification as read
 */
const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: id,
    user: userId
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.markAsOpened(
    req.headers['user-agent'],
    req.ip
  );

  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await Notification.updateMany(
    {
      user: userId,
      status: { $nin: ['opened', 'clicked'] }
    },
    {
      status: 'opened',
      'tracking.opened.count': 1,
      'tracking.opened.firstOpenedAt': new Date(),
      'tracking.opened.lastOpenedAt': new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 */
const deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get user's notification preferences
 */
const getMyPreferences = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  let preferences = await NotificationPreferences.findOne({ user: userId });

  if (!preferences) {
    // Create default preferences
    preferences = await NotificationPreferences.create({
      user: userId
    });
  }

  res.status(200).json({
    status: 'success',
    data: { preferences }
  });
});

/**
 * Update notification preferences
 */
const updateMyPreferences = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const updates = req.body;

  let preferences = await NotificationPreferences.findOne({ user: userId });

  if (!preferences) {
    preferences = await NotificationPreferences.create({
      user: userId,
      ...updates
    });
  } else {
    // Update preferences
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        preferences[key] = { ...preferences[key].toObject(), ...updates[key] };
      } else {
        preferences[key] = updates[key];
      }
    });
    
    await preferences.save();
  }

  res.status(200).json({
    status: 'success',
    data: { preferences }
  });
});

/**
 * Unsubscribe from notifications
 */
const unsubscribe = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { categories, global = false, reason } = req.body;

  // Decode token to get user ID (you should implement proper token verification)
  // For now, assuming token contains user ID
  const userId = token; // This should be properly decoded

  let preferences = await NotificationPreferences.findOne({ user: userId });

  if (!preferences) {
    return next(new AppError('User preferences not found', 404));
  }

  if (global) {
    preferences.unsubscribed.global = true;
  }

  if (categories && Array.isArray(categories)) {
    preferences.unsubscribed.categories = [
      ...new Set([...preferences.unsubscribed.categories, ...categories])
    ];
  }

  preferences.unsubscribed.date = new Date();
  preferences.unsubscribed.reason = reason;

  await preferences.save();

  res.status(200).json({
    status: 'success',
    message: 'Successfully unsubscribed'
  });
});

/**
 * Handle notification webhooks
 */
const handleWebhook = catchAsync(async (req, res, next) => {
  const { provider } = req.params;
  const payload = req.body;

  try {
    await notificationService.handleWebhook(provider, payload);
    
    res.status(200).json({
      status: 'success',
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return next(new AppError('Failed to process webhook', 500));
  }
});

/**
 * Get notification templates (admin only)
 */
const getTemplates = catchAsync(async (req, res, next) => {
  const { type, category, active } = req.query;
  
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (active !== undefined) filter.isActive = active === 'true';

  const templates = await NotificationTemplate.find(filter)
    .sort({ category: 1, type: 1 });

  res.status(200).json({
    status: 'success',
    results: templates.length,
    data: { templates }
  });
});

/**
 * Create notification template (admin only)
 */
const createTemplate = catchAsync(async (req, res, next) => {
  const template = await NotificationTemplate.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { template }
  });
});

/**
 * Update notification template (admin only)
 */
const updateTemplate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const template = await NotificationTemplate.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { template }
  });
});

/**
 * Delete notification template (admin only)
 */
const deleteTemplate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const template = await NotificationTemplate.findByIdAndDelete(id);

  if (!template) {
    return next(new AppError('Template not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get notification analytics (admin only)
 */
const getAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, type, category } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }

  try {
    const analytics = await notificationService.getAnalytics(
      startDate,
      endDate,
      { type, category }
    );

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

/**
 * Test notification endpoint (admin only)
 */
const testNotification = catchAsync(async (req, res, next) => {
  const { type, recipient, content } = req.body;

  // Create a test notification
  const testData = {
    userId: req.user.id,
    type,
    category: 'system_maintenance',
    variables: {
      content: content || 'This is a test notification',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const result = await notificationService.sendNotification(testData);

    res.status(200).json({
      status: 'success',
      message: 'Test notification sent',
      data: result
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

/**
 * Process scheduled notifications (cron job endpoint)
 */
const processScheduledNotifications = catchAsync(async (req, res, next) => {
  try {
    await notificationService.processScheduledNotifications();
    await notificationService.retryFailedNotifications();

    res.status(200).json({
      status: 'success',
      message: 'Scheduled notifications processed'
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

module.exports = {
  // User notification operations
  sendNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  
  // User preferences
  getMyPreferences,
  updateMyPreferences,
  unsubscribe,
  
  // Admin operations
  sendBulkNotifications,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAnalytics,
  testNotification,
  
  // System operations
  handleWebhook,
  processScheduledNotifications,
  
  // Factory methods for additional CRUD operations
  getAllNotifications: factory.getAll(Notification),
  getNotification: factory.getOne(Notification),
  updateNotification: factory.updateOne(Notification)
};