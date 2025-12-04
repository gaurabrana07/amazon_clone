const sgMail = require('@sendgrid/mail');
const { Notification, NotificationTemplate, NotificationPreferences } = require('../models/Notification');
const smsService = require('./smsService');
const pushNotificationService = require('./pushNotificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Initialize SendGrid safely
if (process.env.SENDGRID_API_KEY && 
    process.env.SENDGRID_API_KEY.startsWith('SG.') && 
    process.env.SENDGRID_API_KEY !== 'disabled') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✓ SendGrid email service initialized');
} else if (process.env.SENDGRID_API_KEY === 'disabled') {
  // Silently skip initialization when disabled
} else {
  console.warn('⚠ SendGrid credentials not configured - Email service limited');
}

/**
 * Notification Service
 * Handles sending notifications via email, SMS, push, and in-app
 */
class NotificationService {
  constructor() {
    this.providers = {
      email: this.sendEmail.bind(this),
      sms: this.sendSMS.bind(this),
      push: this.sendPush.bind(this),
      in_app: this.sendInApp.bind(this)
    };
  }

  /**
   * Send notification to user
   */
  async sendNotification(options) {
    const {
      userId,
      type,
      category,
      templateName,
      variables = {},
      relatedEntities = {},
      priority = 'normal',
      scheduledFor = null,
      metadata = {}
    } = options;

    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Check if user can receive this notification
      if (!preferences.canReceive(type, category)) {
        console.log(`User ${userId} cannot receive ${type} notification for ${category}`);
        return { success: false, reason: 'User preferences prevent delivery' };
      }

      // Get or create notification template
      let template;
      if (templateName) {
        template = await NotificationTemplate.findOne({ 
          name: templateName, 
          type,
          isActive: true 
        });
      } else {
        template = await NotificationTemplate.findOne({ 
          category, 
          type,
          isActive: true 
        });
      }

      if (!template) {
        throw new AppError(`No active template found for ${templateName || category}`, 404);
      }

      // Process template content
      const processedContent = this.processTemplate(template, variables);

      // Get recipient information
      const recipient = await this.getRecipientInfo(userId, type, preferences);

      // Create notification record
      const notification = await Notification.create({
        user: userId,
        template: template._id,
        type,
        category,
        subject: processedContent.subject,
        title: processedContent.title,
        content: processedContent.content,
        recipient,
        relatedEntities,
        priority,
        variables,
        metadata,
        scheduling: scheduledFor ? {
          scheduledFor,
          timezone: preferences.timing.timezone,
          sent: false
        } : undefined
      });

      // Send immediately or schedule
      if (scheduledFor && new Date(scheduledFor) > new Date()) {
        return { 
          success: true, 
          notificationId: notification._id,
          scheduled: true,
          scheduledFor 
        };
      } else {
        return await this.deliverNotification(notification);
      }

    } catch (error) {
      console.error('Notification sending failed:', error);
      throw error;
    }
  }

  /**
   * Process template with variables
   */
  processTemplate(template, variables) {
    const processText = (text) => {
      if (!text) return text;
      
      let processed = text;
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processed = processed.replace(regex, value);
      });
      
      return processed;
    };

    return {
      subject: processText(template.subject),
      title: processText(template.title),
      content: {
        html: processText(template.content.html),
        text: processText(template.content.text),
        markdown: processText(template.content.markdown)
      }
    };
  }

  /**
   * Get recipient information based on type
   */
  async getRecipientInfo(userId, type, preferences) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    const recipient = { userId };

    switch (type) {
      case 'email':
        recipient.email = preferences.channels.email.address || user.email;
        break;
      case 'sms':
        recipient.phone = preferences.channels.sms.phone || user.phone;
        break;
      case 'push':
        recipient.deviceToken = preferences.channels.push.deviceTokens
          .filter(token => token.active)
          .map(token => token.token);
        break;
    }

    return recipient;
  }

  /**
   * Deliver notification using appropriate provider
   */
  async deliverNotification(notification) {
    try {
      notification.delivery.attempts += 1;
      notification.delivery.lastAttempt = new Date();

      const provider = this.providers[notification.type];
      if (!provider) {
        throw new Error(`No provider available for ${notification.type}`);
      }

      const result = await provider(notification);

      // Update notification status
      notification.status = 'sent';
      notification.delivery.provider = result.provider;
      notification.delivery.providerId = result.providerId;
      
      if (notification.scheduling) {
        notification.scheduling.sent = true;
        notification.scheduling.sentAt = new Date();
      }

      await notification.save();

      return { 
        success: true, 
        notificationId: notification._id,
        provider: result.provider,
        providerId: result.providerId
      };

    } catch (error) {
      // Update notification with error
      notification.status = 'failed';
      notification.delivery.error = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error
      };

      // Schedule retry if attempts are remaining
      if (notification.delivery.attempts < notification.delivery.maxAttempts) {
        const delay = Math.pow(2, notification.delivery.attempts) * 60000; // Exponential backoff
        notification.delivery.nextAttempt = new Date(Date.now() + delay);
      }

      await notification.save();

      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification) {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.log('Email service not configured, simulating email send');
      return {
        provider: 'simulation',
        providerId: `email_${Date.now()}`,
        simulated: true
      };
    }

    try {
      const emailData = {
        to: notification.recipient.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@amazonclone.com',
          name: process.env.SENDGRID_FROM_NAME || 'Amazon Clone'
        },
        subject: notification.subject,
        html: notification.content.html,
        text: notification.content.text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        customArgs: {
          notificationId: notification._id.toString(),
          userId: notification.user.toString(),
          category: notification.category
        }
      };

      const response = await sgMail.send(emailData);
      
      return {
        provider: 'sendgrid',
        providerId: response[0].headers['x-message-id']
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email notification', 500);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification) {
    try {
      const result = await smsService.sendSMS({
        to: notification.recipient.phone,
        message: notification.content.text,
        templateName: notification.template?.name,
        variables: notification.variables || {}
      });

      return {
        provider: 'twilio',
        providerId: result.sid,
        deliveryInfo: result
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new AppError('Failed to send SMS notification', 500);
    }
  }

  /**
   * Send push notification
   */
  async sendPush(notification) {
    try {
      const pushData = {
        title: notification.title || notification.category,
        body: notification.content.text,
        data: {
          category: notification.category,
          notificationId: notification._id.toString(),
          ...notification.metadata
        }
      };

      let result;
      if (Array.isArray(notification.recipient.deviceTokens)) {
        // Send to multiple device tokens
        result = await pushNotificationService.sendBatchNotification({
          tokens: notification.recipient.deviceTokens.map(d => d.token),
          notification: pushData
        });
      } else if (notification.recipient.deviceToken) {
        // Send to single device token
        result = await pushNotificationService.sendNotification({
          token: notification.recipient.deviceToken,
          notification: pushData
        });
      } else {
        throw new Error('No device tokens available for push notification');
      }

      return {
        provider: 'firebase',
        providerId: result.messageId || `push_${Date.now()}`,
        deliveryInfo: result
      };
    } catch (error) {
      console.error('Push notification failed:', error);
      throw new AppError('Failed to send push notification', 500);
    }
  }

  /**
   * Send in-app notification
   */
  async sendInApp(notification) {
    // In-app notifications are just stored in database
    // They'll be retrieved by the frontend
    return {
      provider: 'database',
      providerId: notification._id.toString()
    };
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId) {
    let preferences = await NotificationPreferences.findOne({ user: userId });
    
    if (!preferences) {
      // Create default preferences
      preferences = await NotificationPreferences.create({
        user: userId,
        channels: {
          email: { enabled: true },
          sms: { enabled: false },
          push: { enabled: true },
          inApp: { enabled: true }
        }
      });
    }

    return preferences;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications) {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const result = await this.sendNotification(notificationData);
        results.push({ ...result, data: notificationData });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message, 
          data: notificationData 
        });
      }
    }

    return results;
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    const now = new Date();
    
    const scheduledNotifications = await Notification.find({
      'scheduling.scheduledFor': { $lte: now },
      'scheduling.sent': false,
      status: 'pending'
    }).limit(100);

    console.log(`Processing ${scheduledNotifications.length} scheduled notifications`);

    for (const notification of scheduledNotifications) {
      try {
        await this.deliverNotification(notification);
      } catch (error) {
        console.error(`Failed to deliver scheduled notification ${notification._id}:`, error);
      }
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications() {
    const now = new Date();
    
    const failedNotifications = await Notification.find({
      status: 'failed',
      'delivery.nextAttempt': { $lte: now },
      'delivery.attempts': { $lt: { $expr: '$delivery.maxAttempts' } }
    }).limit(50);

    console.log(`Retrying ${failedNotifications.length} failed notifications`);

    for (const notification of failedNotifications) {
      try {
        await this.deliverNotification(notification);
      } catch (error) {
        console.error(`Retry failed for notification ${notification._id}:`, error);
      }
    }
  }

  /**
   * Handle delivery status webhooks
   */
  async handleWebhook(provider, payload) {
    try {
      switch (provider) {
        case 'sendgrid':
          return await this.handleSendGridWebhook(payload);
        case 'twilio':
          return await this.handleTwilioWebhook(payload);
        default:
          console.log(`Unknown webhook provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Webhook handling error for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Handle SendGrid webhook events
   */
  async handleSendGridWebhook(events) {
    for (const event of events) {
      const notificationId = event.sg_message_id || event.notificationId;
      if (!notificationId) continue;

      const notification = await Notification.findOne({
        'delivery.providerId': notificationId
      });

      if (!notification) continue;

      switch (event.event) {
        case 'delivered':
          notification.status = 'delivered';
          break;
        case 'open':
          await notification.markAsOpened(event.useragent, event.ip);
          break;
        case 'click':
          await notification.trackClick(event.url, event.useragent, event.ip);
          break;
        case 'bounce':
        case 'dropped':
          notification.status = 'bounced';
          break;
        case 'unsubscribe':
          notification.tracking.unsubscribed = {
            unsubscribedAt: new Date(),
            reason: 'user_unsubscribe'
          };
          break;
      }

      await notification.save();
    }
  }

  /**
   * Handle Twilio webhook events
   */
  async handleTwilioWebhook(payload) {
    const notification = await Notification.findOne({
      'delivery.providerId': payload.MessageSid
    });

    if (!notification) return;

    switch (payload.MessageStatus) {
      case 'delivered':
        notification.status = 'delivered';
        break;
      case 'failed':
      case 'undelivered':
        notification.status = 'failed';
        notification.delivery.error = {
          code: payload.ErrorCode,
          message: payload.ErrorMessage
        };
        break;
    }

    await notification.save();
  }

  /**
   * Get notification analytics
   */
  async getAnalytics(startDate, endDate, filters = {}) {
    const match = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    if (filters.type) match.type = filters.type;
    if (filters.category) match.category = filters.category;
    if (filters.status) match.status = filters.status;

    const analytics = await Notification.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
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
      { $sort: { '_id.date': 1 } }
    ]);

    return analytics;
  }

  /**
   * Quick notification methods for common use cases
   */
  async sendOrderConfirmation(userId, order) {
    return this.sendNotification({
      userId,
      type: 'email',
      category: 'order_confirmation',
      variables: {
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        orderTotal: order.totalAmount,
        orderItems: order.items.map(item => `${item.quantity}x ${item.product.name}`).join(', '),
        orderDate: order.createdAt.toLocaleDateString()
      },
      relatedEntities: { order: order._id },
      priority: 'high'
    });
  }

  async sendPaymentConfirmation(userId, payment) {
    return this.sendNotification({
      userId,
      type: 'email',
      category: 'payment_confirmation',
      variables: {
        paymentAmount: payment.amount,
        paymentMethod: payment.paymentMethod.type,
        transactionId: payment.transactionId,
        paymentDate: payment.createdAt.toLocaleDateString()
      },
      relatedEntities: { payment: payment._id },
      priority: 'high'
    });
  }

  async sendShippingUpdate(userId, order, trackingInfo) {
    return this.sendNotification({
      userId,
      type: 'push',
      category: 'shipping_update',
      variables: {
        orderNumber: order.orderNumber,
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier,
        estimatedDelivery: trackingInfo.estimatedDelivery
      },
      relatedEntities: { order: order._id },
      priority: 'normal'
    });
  }

  async sendAbandonedCartReminder(userId, cart) {
    return this.sendNotification({
      userId,
      type: 'email',
      category: 'abandoned_cart',
      variables: {
        customerName: cart.user.name,
        cartItems: cart.items.length,
        cartTotal: cart.totalAmount
      },
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
      priority: 'low'
    });
  }
}

module.exports = new NotificationService();