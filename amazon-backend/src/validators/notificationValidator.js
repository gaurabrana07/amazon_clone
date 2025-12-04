const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Notification Validators
 * Validates notification-related request data
 */

/**
 * Validate notification sending
 */
const validateNotification = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid user ID format'
      }),
    
    type: Joi.string()
      .valid('email', 'sms', 'push', 'in_app')
      .required()
      .messages({
        'any.only': 'Type must be one of: email, sms, push, in_app'
      }),
    
    category: Joi.string()
      .valid(
        'order_confirmation', 'payment_confirmation', 'shipping_update',
        'delivery_confirmation', 'order_cancelled', 'refund_processed',
        'password_reset', 'account_created', 'login_alert',
        'product_back_in_stock', 'price_drop', 'abandoned_cart',
        'review_request', 'promotional', 'system_maintenance'
      )
      .required()
      .messages({
        'any.only': 'Invalid notification category'
      }),
    
    templateName: Joi.string()
      .max(100)
      .optional()
      .trim(),
    
    variables: Joi.object()
      .optional()
      .pattern(Joi.string(), Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.date(),
        Joi.boolean()
      )),
    
    relatedEntities: Joi.object({
      order: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      product: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      payment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
    }).optional(),
    
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional()
      .default('normal'),
    
    scheduledFor: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Scheduled time must be in the future'
      }),
    
    metadata: Joi.object()
      .optional()
      .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate bulk notification sending
 */
const validateBulkNotifications = (req, res, next) => {
  const schema = Joi.object({
    notifications: Joi.array()
      .items(Joi.object({
        userId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        
        type: Joi.string()
          .valid('email', 'sms', 'push', 'in_app')
          .required(),
        
        category: Joi.string()
          .valid(
            'order_confirmation', 'payment_confirmation', 'shipping_update',
            'delivery_confirmation', 'order_cancelled', 'refund_processed',
            'password_reset', 'account_created', 'login_alert',
            'product_back_in_stock', 'price_drop', 'abandoned_cart',
            'review_request', 'promotional', 'system_maintenance'
          )
          .required(),
        
        templateName: Joi.string().max(100).optional(),
        variables: Joi.object().optional(),
        priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional(),
        scheduledFor: Joi.date().iso().min('now').optional()
      }))
      .min(1)
      .max(1000)
      .required()
      .messages({
        'array.min': 'At least one notification is required',
        'array.max': 'Maximum 1000 notifications per bulk request'
      })
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate notification preferences update
 */
const validatePreferences = (req, res, next) => {
  const schema = Joi.object({
    channels: Joi.object({
      email: Joi.object({
        enabled: Joi.boolean().optional(),
        address: Joi.string().email().optional(),
        verified: Joi.boolean().optional()
      }).optional(),
      
      sms: Joi.object({
        enabled: Joi.boolean().optional(),
        phone: Joi.string()
          .pattern(/^\+?[1-9]\d{1,14}$/)
          .optional()
          .messages({
            'string.pattern.base': 'Invalid phone number format'
          }),
        verified: Joi.boolean().optional()
      }).optional(),
      
      push: Joi.object({
        enabled: Joi.boolean().optional(),
        deviceTokens: Joi.array().items(Joi.object({
          token: Joi.string().required(),
          platform: Joi.string().valid('ios', 'android', 'web').required(),
          active: Joi.boolean().optional().default(true)
        })).optional()
      }).optional(),
      
      inApp: Joi.object({
        enabled: Joi.boolean().optional()
      }).optional()
    }).optional(),
    
    categories: Joi.object({
      orderUpdates: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional(),
      
      paymentUpdates: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional(),
      
      shippingUpdates: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional(),
      
      promotions: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional(),
      
      security: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional(),
      
      productUpdates: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional()
      }).optional()
    }).optional(),
    
    timing: Joi.object({
      timezone: Joi.string()
        .pattern(/^[A-Za-z]+\/[A-Za-z_]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'Invalid timezone format'
        }),
      
      quietHours: Joi.object({
        enabled: Joi.boolean().optional(),
        start: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional()
          .messages({
            'string.pattern.base': 'Time must be in HH:MM format'
          }),
        end: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional()
          .messages({
            'string.pattern.base': 'Time must be in HH:MM format'
          })
      }).optional(),
      
      frequency: Joi.object({
        digest: Joi.string()
          .valid('immediate', 'hourly', 'daily', 'weekly')
          .optional(),
        promotional: Joi.string()
          .valid('none', 'weekly', 'biweekly', 'monthly')
          .optional()
      }).optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate notification template creation/update
 */
const validateTemplate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .trim()
      .messages({
        'string.min': 'Template name must be at least 3 characters',
        'string.max': 'Template name cannot exceed 100 characters'
      }),
    
    type: Joi.string()
      .valid('email', 'sms', 'push', 'in_app')
      .required(),
    
    category: Joi.string()
      .valid(
        'order_confirmation', 'payment_confirmation', 'shipping_update',
        'delivery_confirmation', 'order_cancelled', 'refund_processed',
        'password_reset', 'account_created', 'login_alert',
        'product_back_in_stock', 'price_drop', 'abandoned_cart',
        'review_request', 'promotional', 'system_maintenance'
      )
      .required(),
    
    subject: Joi.string()
      .max(200)
      .optional()
      .when('type', {
        is: 'email',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
    
    title: Joi.string()
      .max(100)
      .optional()
      .when('type', {
        is: Joi.valid('push', 'in_app'),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
    
    content: Joi.object({
      html: Joi.string().optional(),
      text: Joi.string().required(),
      markdown: Joi.string().optional()
    }).required(),
    
    variables: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('string', 'number', 'date', 'url', 'boolean').required(),
        required: Joi.boolean().optional().default(false),
        defaultValue: Joi.string().optional(),
        description: Joi.string().max(200).optional()
      }))
      .optional(),
    
    settings: Joi.object({
      email: Joi.object({
        fromName: Joi.string().max(100).optional(),
        fromEmail: Joi.string().email().optional(),
        replyTo: Joi.string().email().optional(),
        priority: Joi.string().valid('low', 'normal', 'high').optional()
      }).optional(),
      
      sms: Joi.object({
        maxLength: Joi.number().integer().min(1).max(1600).optional()
      }).optional(),
      
      push: Joi.object({
        badge: Joi.number().integer().min(0).optional(),
        sound: Joi.string().optional(),
        icon: Joi.string().uri().optional(),
        image: Joi.string().uri().optional(),
        actions: Joi.array().items(Joi.object({
          action: Joi.string().required(),
          title: Joi.string().required(),
          icon: Joi.string().optional()
        })).optional()
      }).optional()
    }).optional(),
    
    isActive: Joi.boolean()
      .optional()
      .default(true),
    
    version: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate unsubscribe request
 */
const validateUnsubscribe = (req, res, next) => {
  const schema = Joi.object({
    categories: Joi.array()
      .items(Joi.string().valid(
        'order_confirmation', 'payment_confirmation', 'shipping_update',
        'delivery_confirmation', 'order_cancelled', 'refund_processed',
        'password_reset', 'account_created', 'login_alert',
        'product_back_in_stock', 'price_drop', 'abandoned_cart',
        'review_request', 'promotional', 'system_maintenance'
      ))
      .optional(),
    
    global: Joi.boolean()
      .optional()
      .default(false),
    
    reason: Joi.string()
      .max(500)
      .optional()
      .trim()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate notification analytics request
 */
const validateAnalytics = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'date.iso': 'Start date must be in ISO format'
      }),
    
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref('startDate'))
      .required()
      .messages({
        'date.base': 'End date must be a valid date',
        'date.iso': 'End date must be in ISO format',
        'date.greater': 'End date must be after start date'
      }),
    
    type: Joi.string()
      .valid('email', 'sms', 'push', 'in_app')
      .optional(),
    
    category: Joi.string()
      .valid(
        'order_confirmation', 'payment_confirmation', 'shipping_update',
        'delivery_confirmation', 'order_cancelled', 'refund_processed',
        'password_reset', 'account_created', 'login_alert',
        'product_back_in_stock', 'price_drop', 'abandoned_cart',
        'review_request', 'promotional', 'system_maintenance'
      )
      .optional(),
    
    groupBy: Joi.array()
      .items(Joi.string().valid('type', 'category', 'status', 'date'))
      .optional(),
    
    period: Joi.string()
      .valid('hour', 'day', 'week', 'month')
      .optional()
      .default('day')
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.query = value;
  next();
};

/**
 * Validate notification filters
 */
const validateNotificationFilters = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('email', 'sms', 'push', 'in_app')
      .optional(),
    
    category: Joi.string()
      .valid(
        'order_confirmation', 'payment_confirmation', 'shipping_update',
        'delivery_confirmation', 'order_cancelled', 'refund_processed',
        'password_reset', 'account_created', 'login_alert',
        'product_back_in_stock', 'price_drop', 'abandoned_cart',
        'review_request', 'promotional', 'system_maintenance'
      )
      .optional(),
    
    status: Joi.string()
      .valid('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')
      .optional(),
    
    unread: Joi.string()
      .valid('true', 'false')
      .optional(),
    
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional(),
    
    startDate: Joi.date()
      .iso()
      .optional(),
    
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref('startDate'))
      .optional(),
    
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(20),
    
    sort: Joi.string()
      .valid('createdAt', '-createdAt', 'priority', '-priority', 'status')
      .optional()
      .default('-createdAt')
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.query = value;
  next();
};

/**
 * Validate test notification
 */
const validateTestNotification = (req, res, next) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('email', 'sms', 'push', 'in_app')
      .required(),
    
    recipient: Joi.string()
      .optional()
      .when('type', {
        is: 'email',
        then: Joi.string().email().required(),
        otherwise: Joi.optional()
      }),
    
    content: Joi.string()
      .max(1000)
      .required()
      .trim(),
    
    subject: Joi.string()
      .max(200)
      .optional()
      .when('type', {
        is: 'email',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      })
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

module.exports = {
  validateNotification,
  validateBulkNotifications,
  validatePreferences,
  validateTemplate,
  validateUnsubscribe,
  validateAnalytics,
  validateNotificationFilters,
  validateTestNotification
};