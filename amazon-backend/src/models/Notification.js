const mongoose = require('mongoose');

/**
 * Notification Schema
 * Manages all types of notifications (email, SMS, push, in-app)
 */

// Notification template schema
const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: [true, 'Notification type is required']
  },
  category: {
    type: String,
    enum: [
      'order_confirmation', 'payment_confirmation', 'shipping_update', 
      'delivery_confirmation', 'order_cancelled', 'refund_processed',
      'password_reset', 'account_created', 'login_alert', 
      'product_back_in_stock', 'price_drop', 'abandoned_cart',
      'review_request', 'promotional', 'system_maintenance'
    ],
    required: [true, 'Notification category is required'],
    index: true
  },
  
  // Template content
  subject: String, // For email notifications
  title: String,   // For push/in-app notifications
  content: {
    html: String,  // HTML content for emails
    text: String,  // Plain text content
    markdown: String // Markdown content
  },
  
  // Template variables/placeholders
  variables: [{
    name: String,
    type: String, // string, number, date, url, etc.
    required: Boolean,
    defaultValue: String,
    description: String
  }],
  
  // Channel-specific settings
  settings: {
    email: {
      fromName: String,
      fromEmail: String,
      replyTo: String,
      priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
      }
    },
    sms: {
      maxLength: {
        type: Number,
        default: 160
      }
    },
    push: {
      badge: Number,
      sound: String,
      icon: String,
      image: String,
      actions: [{
        action: String,
        title: String,
        icon: String
      }]
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  
  // Usage statistics
  stats: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Notification instance schema
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate',
    index: true
  },
  
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: [true, 'Notification type is required'],
    index: true
  },
  category: {
    type: String,
    enum: [
      'order_confirmation', 'payment_confirmation', 'shipping_update', 
      'delivery_confirmation', 'order_cancelled', 'refund_processed',
      'password_reset', 'account_created', 'login_alert', 
      'product_back_in_stock', 'price_drop', 'abandoned_cart',
      'review_request', 'promotional', 'system_maintenance'
    ],
    required: [true, 'Notification category is required'],
    index: true
  },
  
  // Content (processed from template)
  subject: String,
  title: String,
  content: {
    html: String,
    text: String,
    markdown: String
  },
  
  // Recipient information
  recipient: {
    email: String,
    phone: String,
    deviceToken: String, // For push notifications
    userId: String
  },
  
  // Related entities
  relatedEntities: {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentTransaction'
    }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'],
    default: 'pending',
    index: true
  },
  
  // Delivery details
  delivery: {
    provider: String, // sendgrid, twilio, firebase, etc.
    providerId: String, // External provider's message ID
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    nextAttempt: Date,
    lastAttempt: Date,
    error: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed
    }
  },
  
  // Scheduling
  scheduling: {
    scheduledFor: Date,
    timezone: String,
    sent: Boolean,
    sentAt: Date
  },
  
  // Tracking and analytics
  tracking: {
    opened: {
      count: {
        type: Number,
        default: 0
      },
      firstOpenedAt: Date,
      lastOpenedAt: Date,
      userAgent: String,
      ip: String
    },
    clicked: {
      count: {
        type: Number,
        default: 0
      },
      links: [{
        url: String,
        clickedAt: Date,
        userAgent: String,
        ip: String
      }]
    },
    unsubscribed: {
      unsubscribedAt: Date,
      reason: String
    }
  },
  
  // Template variables used
  variables: mongoose.Schema.Types.Mixed,
  
  // Priority and importance
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  
  // Metadata
  metadata: {
    campaignId: String,
    source: String,
    version: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// User notification preferences schema
const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
    index: true
  },
  
  // Channel preferences
  channels: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      address: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      phone: String,
      verified: {
        type: Boolean,
        default: false
      },
      verifiedAt: Date
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      deviceTokens: [{
        token: String,
        platform: String, // ios, android, web
        active: Boolean,
        registeredAt: Date
      }]
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Category preferences
  categories: {
    orderUpdates: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    paymentUpdates: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    shippingUpdates: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    promotions: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    },
    security: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    productUpdates: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    }
  },
  
  // Timing preferences
  timing: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: String, // "22:00"
      end: String    // "08:00"
    },
    frequency: {
      digest: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate'
      },
      promotional: {
        type: String,
        enum: ['none', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly'
      }
    }
  },
  
  // Unsubscribe tracking
  unsubscribed: {
    global: {
      type: Boolean,
      default: false
    },
    categories: [String],
    date: Date,
    reason: String
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationTemplateSchema.index({ category: 1, type: 1 });
notificationTemplateSchema.index({ isActive: 1 });

notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ 'scheduling.scheduledFor': 1 });
notificationSchema.index({ 'delivery.nextAttempt': 1 });

// Virtual for is read (for in-app notifications)
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'opened' || this.tracking.opened.count > 0;
});

// Virtual for delivery rate
notificationTemplateSchema.virtual('deliveryRate').get(function() {
  if (this.stats.sent === 0) return 0;
  return (this.stats.delivered / this.stats.sent) * 100;
});

// Virtual for open rate
notificationTemplateSchema.virtual('openRate').get(function() {
  if (this.stats.delivered === 0) return 0;
  return (this.stats.opened / this.stats.delivered) * 100;
});

// Method to check if user can receive notification
notificationPreferencesSchema.methods.canReceive = function(type, category) {
  // Check global unsubscribe
  if (this.unsubscribed.global) return false;
  
  // Check category unsubscribe
  if (this.unsubscribed.categories.includes(category)) return false;
  
  // Check channel enabled
  if (!this.channels[type]?.enabled) return false;
  
  // Check category preference
  const categoryPref = this.categories[this.mapCategoryToPreference(category)];
  if (!categoryPref || !categoryPref[type]) return false;
  
  // Check quiet hours for non-urgent notifications
  if (this.timing.quietHours.enabled && type === 'push') {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const start = this.timing.quietHours.start;
    const end = this.timing.quietHours.end;
    
    if (start > end) { // Overnight quiet hours
      if (currentTime >= start || currentTime <= end) return false;
    } else {
      if (currentTime >= start && currentTime <= end) return false;
    }
  }
  
  return true;
};

// Method to map category to preference key
notificationPreferencesSchema.methods.mapCategoryToPreference = function(category) {
  const mapping = {
    'order_confirmation': 'orderUpdates',
    'payment_confirmation': 'paymentUpdates',
    'shipping_update': 'shippingUpdates',
    'delivery_confirmation': 'shippingUpdates',
    'order_cancelled': 'orderUpdates',
    'refund_processed': 'paymentUpdates',
    'password_reset': 'security',
    'account_created': 'security',
    'login_alert': 'security',
    'product_back_in_stock': 'productUpdates',
    'price_drop': 'productUpdates',
    'abandoned_cart': 'orderUpdates',
    'review_request': 'orderUpdates',
    'promotional': 'promotions',
    'system_maintenance': 'security'
  };
  
  return mapping[category] || 'orderUpdates';
};

// Method to mark notification as opened
notificationSchema.methods.markAsOpened = function(userAgent, ip) {
  if (this.tracking.opened.count === 0) {
    this.tracking.opened.firstOpenedAt = new Date();
  }
  
  this.tracking.opened.count += 1;
  this.tracking.opened.lastOpenedAt = new Date();
  this.tracking.opened.userAgent = userAgent;
  this.tracking.opened.ip = ip;
  this.status = 'opened';
  
  return this.save();
};

// Method to track link click
notificationSchema.methods.trackClick = function(url, userAgent, ip) {
  this.tracking.clicked.count += 1;
  this.tracking.clicked.links.push({
    url,
    clickedAt: new Date(),
    userAgent,
    ip
  });
  
  if (this.status !== 'opened') {
    this.status = 'clicked';
  }
  
  return this.save();
};

// Static method to get notification analytics
notificationSchema.statics.getAnalytics = function(startDate, endDate, type = null) {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (type) match.type = type;
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          type: '$type',
          category: '$category'
        },
        sent: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] }
        },
        opened: {
          $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] }
        },
        clicked: {
          $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

module.exports = { NotificationTemplate, Notification, NotificationPreferences };