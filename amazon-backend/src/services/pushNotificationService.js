const admin = require('firebase-admin');
const AppError = require('../utils/AppError');

/**
 * Push Notification Service
 * Handles push notifications using Firebase Cloud Messaging
 */

class PushNotificationService {
  constructor() {
    this.initialized = false;
    this.fcm = null;
    this.isEnabled = false;
    
    // Safely initialize Firebase Admin SDK
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
      
      // Skip initialization if credentials are placeholder values or disabled
      if ((!serviceAccountKey || serviceAccountKey.includes('your') || serviceAccountKey === 'disabled') && 
          (!serviceAccountPath || serviceAccountPath.includes('your') || serviceAccountPath === 'disabled')) {
        // Silently skip initialization with placeholder values
        return;
      }
      
      if (serviceAccountKey && serviceAccountKey.length > 10) {
        let serviceAccount;
        
        // Try to parse service account from environment variable
        if (serviceAccountKey.startsWith('{')) {
          serviceAccount = JSON.parse(serviceAccountKey);
          
          // Validate required fields
          if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid service account format - missing required fields');
          }
        } else {
          // Assume it's a file path
          const fs = require('fs');
          if (fs.existsSync(serviceAccountKey)) {
            serviceAccount = require(serviceAccountKey);
          } else {
            throw new Error('Service account file not found');
          }
        }

        // Check if Firebase app is already initialized
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
          });
        }

        this.fcm = admin.messaging();
        this.initialized = true;
        this.isEnabled = true;
        console.log('✓ Firebase push notification service initialized');
      }
    } catch (error) {
      console.error('✗ Failed to initialize Firebase push notification service:', error.message);
      this.initialized = false;
      this.fcm = null;
      this.isEnabled = false;
    }
  }

  /**
   * Check if push notification service is available
   */
  isAvailable() {
    return this.initialized && this.fcm !== null;
  }

  /**
   * Send push notification to single device
   */
  async sendToDevice(deviceToken, notification, data = {}, options = {}) {
    if (!this.isAvailable()) {
      console.warn('Push notification service not available - simulating push send');
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        results: [{
          messageId: `sim_${Date.now()}`,
          success: true,
          simulation: true
        }],
        simulation: true
      };
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image
        },
        data: this.sanitizeData(data),
        android: {
          notification: {
            icon: notification.icon || 'default',
            color: notification.color || '#FF6B35',
            sound: notification.sound || 'default',
            priority: options.priority || 'high',
            channelId: options.channelId || 'default'
          },
          ttl: options.ttl || 3600000, // 1 hour default
          priority: options.priority || 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: notification.badge,
              sound: notification.sound || 'default',
              category: options.category
            }
          },
          headers: {
            'apns-priority': options.priority === 'high' ? '10' : '5',
            'apns-expiration': options.expiration || Math.floor(Date.now() / 1000) + 3600
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            image: notification.image,
            badge: notification.badge,
            tag: options.tag,
            renotify: options.renotify || false,
            requireInteraction: options.requireInteraction || false,
            actions: notification.actions || []
          },
          headers: {
            'TTL': (options.ttl || 3600000).toString()
          }
        }
      };

      const response = await this.fcm.send(message);

      console.log('✓ Push notification sent successfully:', response);

      return {
        success: true,
        messageId: response,
        results: [{
          messageId: response,
          success: true
        }]
      };

    } catch (error) {
      console.error('✗ Push notification failed:', error.message);
      
      // Handle specific Firebase errors
      let errorMessage = error.message;
      if (error.code === 'messaging/registration-token-not-registered') {
        errorMessage = 'Device token is no longer valid';
      } else if (error.code === 'messaging/invalid-registration-token') {
        errorMessage = 'Invalid device token format';
      }

      throw new AppError(`Push notification failed: ${errorMessage}`, 500);
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(deviceTokens, notification, data = {}, options = {}) {
    if (!Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      throw new AppError('Device tokens must be a non-empty array', 400);
    }

    if (!this.isAvailable()) {
      console.warn('Push notification service not available - simulating batch push send');
      return {
        success: true,
        successCount: deviceTokens.length,
        failureCount: 0,
        results: deviceTokens.map((token, index) => ({
          messageId: `sim_${Date.now()}_${index}`,
          success: true,
          simulation: true
        })),
        simulation: true
      };
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image
        },
        data: this.sanitizeData(data),
        tokens: deviceTokens,
        android: {
          notification: {
            icon: notification.icon || 'default',
            color: notification.color || '#FF6B35',
            sound: notification.sound || 'default',
            priority: options.priority || 'high',
            channelId: options.channelId || 'default'
          },
          ttl: options.ttl || 3600000,
          priority: options.priority || 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: notification.badge,
              sound: notification.sound || 'default',
              category: options.category
            }
          },
          headers: {
            'apns-priority': options.priority === 'high' ? '10' : '5',
            'apns-expiration': options.expiration || Math.floor(Date.now() / 1000) + 3600
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            image: notification.image,
            badge: notification.badge,
            tag: options.tag,
            renotify: options.renotify || false,
            requireInteraction: options.requireInteraction || false,
            actions: notification.actions || []
          },
          headers: {
            'TTL': (options.ttl || 3600000).toString()
          }
        }
      };

      const response = await this.fcm.sendMulticast(message);

      console.log(`✓ Batch push notification sent: ${response.successCount}/${deviceTokens.length} successful`);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: deviceTokens[idx],
              error: resp.error
            });
          }
        });
        console.warn('Failed tokens:', failedTokens);
      }

      return {
        success: response.failureCount === 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        results: response.responses,
        multicastId: response.multicastId
      };

    } catch (error) {
      console.error('✗ Batch push notification failed:', error.message);
      throw new AppError(`Batch push notification failed: ${error.message}`, 500);
    }
  }

  /**
   * Send push notification using template
   */
  async sendWithTemplate(deviceTokens, templateId, variables = {}, options = {}) {
    // Template system for push notifications
    const templates = {
      'order_confirmation': {
        title: 'Order Confirmed! 🎉',
        body: 'Your order #{{orderNumber}} has been confirmed. Total: ${{orderTotal}}',
        icon: 'order_confirmed',
        channelId: 'orders'
      },
      'order_shipped': {
        title: 'Your order is on the way! 📦',
        body: 'Order #{{orderNumber}} has shipped. Track: {{trackingNumber}}',
        icon: 'shipping',
        channelId: 'shipping'
      },
      'order_delivered': {
        title: 'Delivered! 🎉',
        body: 'Your order #{{orderNumber}} has been delivered. Enjoy!',
        icon: 'delivered',
        channelId: 'delivery'
      },
      'payment_failed': {
        title: 'Payment Issue ⚠️',
        body: 'Payment failed for order #{{orderNumber}}. Please update your payment method.',
        icon: 'payment_failed',
        channelId: 'payments',
        priority: 'high'
      },
      'price_drop': {
        title: 'Price Drop Alert! 💰',
        body: '{{productName}} is now ${{newPrice}} (was ${{oldPrice}})',
        icon: 'price_drop',
        channelId: 'promotions'
      },
      'back_in_stock': {
        title: 'Back in Stock! 📦',
        body: '{{productName}} is now available. Get it before it sells out!',
        icon: 'back_in_stock',
        channelId: 'inventory'
      },
      'cart_abandonment': {
        title: 'Don\'t forget your items! 🛒',
        body: 'You have {{itemCount}} items waiting in your cart',
        icon: 'cart',
        channelId: 'marketing'
      },
      'review_reminder': {
        title: 'How was your purchase? ⭐',
        body: 'Please review your recent order #{{orderNumber}}',
        icon: 'review',
        channelId: 'engagement'
      },
      'security_alert': {
        title: 'Security Alert 🔒',
        body: 'New login detected from {{location}}. If this wasn\'t you, secure your account.',
        icon: 'security',
        channelId: 'security',
        priority: 'high'
      }
    };

    const template = templates[templateId];
    if (!template) {
      throw new AppError(`Push notification template '${templateId}' not found`, 404);
    }

    // Replace variables in template
    const notification = {
      title: this.replaceVariables(template.title, variables),
      body: this.replaceVariables(template.body, variables),
      icon: template.icon,
      channelId: template.channelId
    };

    // Merge template options with provided options
    const mergedOptions = {
      channelId: template.channelId,
      priority: template.priority || 'normal',
      ...options
    };

    // Send to single device or multiple devices
    if (typeof deviceTokens === 'string') {
      return this.sendToDevice(deviceTokens, notification, variables, mergedOptions);
    } else {
      return this.sendToMultipleDevices(deviceTokens, notification, variables, mergedOptions);
    }
  }

  /**
   * Subscribe device tokens to a topic
   */
  async subscribeToTopic(deviceTokens, topic) {
    if (!this.isAvailable()) {
      console.warn('Push notification service not available - simulating topic subscription');
      return {
        success: true,
        successCount: Array.isArray(deviceTokens) ? deviceTokens.length : 1,
        failureCount: 0,
        simulation: true
      };
    }

    try {
      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      const response = await this.fcm.subscribeToTopic(tokens, topic);

      console.log(`✓ Subscribed ${response.successCount}/${tokens.length} tokens to topic: ${topic}`);

      return {
        success: response.failureCount === 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };

    } catch (error) {
      console.error('✗ Topic subscription failed:', error.message);
      throw new AppError(`Topic subscription failed: ${error.message}`, 500);
    }
  }

  /**
   * Unsubscribe device tokens from a topic
   */
  async unsubscribeFromTopic(deviceTokens, topic) {
    if (!this.isAvailable()) {
      console.warn('Push notification service not available - simulating topic unsubscription');
      return {
        success: true,
        successCount: Array.isArray(deviceTokens) ? deviceTokens.length : 1,
        failureCount: 0,
        simulation: true
      };
    }

    try {
      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      const response = await this.fcm.unsubscribeFromTopic(tokens, topic);

      console.log(`✓ Unsubscribed ${response.successCount}/${tokens.length} tokens from topic: ${topic}`);

      return {
        success: response.failureCount === 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };

    } catch (error) {
      console.error('✗ Topic unsubscription failed:', error.message);
      throw new AppError(`Topic unsubscription failed: ${error.message}`, 500);
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic, notification, data = {}, options = {}) {
    if (!this.isAvailable()) {
      console.warn('Push notification service not available - simulating topic notification');
      return {
        success: true,
        messageId: `sim_topic_${Date.now()}`,
        simulation: true
      };
    }

    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image
        },
        data: this.sanitizeData(data),
        android: {
          notification: {
            icon: notification.icon || 'default',
            color: notification.color || '#FF6B35',
            sound: notification.sound || 'default',
            priority: options.priority || 'normal',
            channelId: options.channelId || 'default'
          },
          ttl: options.ttl || 3600000
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: notification.badge,
              sound: notification.sound || 'default'
            }
          }
        }
      };

      const response = await this.fcm.send(message);

      console.log(`✓ Topic notification sent to ${topic}:`, response);

      return {
        success: true,
        messageId: response
      };

    } catch (error) {
      console.error('✗ Topic notification failed:', error.message);
      throw new AppError(`Topic notification failed: ${error.message}`, 500);
    }
  }

  /**
   * Validate device token
   */
  async validateToken(deviceToken) {
    if (!this.isAvailable()) {
      return { valid: true, simulation: true };
    }

    try {
      // Try to send a test message to validate the token
      const message = {
        token: deviceToken,
        data: { test: 'validation' },
        dryRun: true // This won't actually send the message
      };

      await this.fcm.send(message);
      return { valid: true };

    } catch (error) {
      console.error('Token validation failed:', error.message);
      return {
        valid: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Helper method to sanitize data payload
   */
  sanitizeData(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      // FCM data payload values must be strings
      if (data[key] !== null && data[key] !== undefined) {
        sanitized[key] = String(data[key]);
      }
    });

    return sanitized;
  }

  /**
   * Helper method to replace variables in text
   */
  replaceVariables(text, variables) {
    let result = text;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), variables[key]);
    });

    return result;
  }

  /**
   * Test push notification configuration
   */
  async testConfiguration(testDeviceToken) {
    try {
      const testNotification = {
        title: 'Test Notification',
        body: `Test from Amazon Clone backend - ${new Date().toISOString()}`,
        icon: 'test'
      };

      const result = await this.sendToDevice(
        testDeviceToken,
        testNotification,
        { test: 'true', timestamp: Date.now().toString() }
      );

      return {
        success: true,
        message: 'Test push notification sent successfully',
        result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      initialized: this.initialized,
      service: 'Firebase Cloud Messaging',
      features: [
        'Single device messaging',
        'Batch messaging',
        'Topic messaging',
        'Template system',
        'Token validation',
        'Cross-platform support'
      ]
    };
  }

  /**
   * Alias methods for backward compatibility
   */
  async sendNotification(options) {
    return this.sendToDevice(options.token, options.notification, options.data, options.options);
  }

  async sendBatchNotification(options) {
    return this.sendToMultipleDevices(options.tokens, options.notification, options.data, options.options);
  }
}

module.exports = new PushNotificationService();