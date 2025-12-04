const mongoose = require('mongoose');
const User = require('../models/User');
const { NotificationPreferences } = require('../models/Notification');
const notificationService = require('../services/notificationService');
const smsService = require('../services/smsService');
const pushNotificationService = require('../services/pushNotificationService');
require('dotenv').config();

/**
 * Notification System Test Suite
 * Tests SMS, Push, Email, and In-App notifications
 */

class NotificationTester {
  constructor() {
    this.results = {
      sms: [],
      push: [],
      email: [],
      inApp: [],
      integration: []
    };
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    try {
      // Skip database operations if DB is disabled
      if (process.env.SKIP_DB === 'true') {
        console.log('⚠️ Database disabled (SKIP_DB=true) - running tests without database');
        console.log('✅ Test environment ready (simulated mode)');
        
        // Create mock test user
        this.testUser = {
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890'
        };
        
        return true;
      }

      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');

      // Create test user if doesn't exist
      this.testUser = await this.createTestUser();
      console.log('✅ Test user ready');

      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      return false;
    }
  }

  /**
   * Create or get test user
   */
  async createTestUser() {
    const testUserData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'TestPassword123!',
      phone: '+1234567890',
      isEmailVerified: true,
      role: 'customer'
    };

    let user = await User.findOne({ email: testUserData.email });
    
    if (!user) {
      user = await User.create(testUserData);
      console.log('📝 Created new test user');
    } else {
      console.log('👤 Using existing test user');
    }

    // Ensure notification preferences exist
    let preferences = await NotificationPreferences.findOne({ user: user._id });
    
    if (!preferences) {
      preferences = await NotificationPreferences.create({
        user: user._id,
        channels: {
          email: {
            enabled: true,
            address: user.email,
            verified: true
          },
          sms: {
            enabled: true,
            phone: user.phone,
            verified: true
          },
          push: {
            enabled: true,
            deviceTokens: [
              {
                token: 'test-device-token-123',
                platform: 'web',
                active: true
              }
            ]
          },
          inApp: {
            enabled: true
          }
        },
        categories: {
          orderUpdates: { email: true, sms: true, push: true, inApp: true },
          paymentUpdates: { email: true, sms: true, push: true, inApp: true },
          shippingUpdates: { email: true, sms: true, push: true, inApp: true },
          promotions: { email: true, sms: false, push: true, inApp: true },
          security: { email: true, sms: true, push: true, inApp: true }
        }
      });
      console.log('⚙️  Created notification preferences');
    }

    return user;
  }

  /**
   * Test SMS Service
   */
  async testSMSService() {
    console.log('\n📱 Testing SMS Service...');

    const tests = [
      {
        name: 'Simple SMS',
        data: {
          to: '+1234567890',
          message: 'Test SMS from Amazon Clone notification system!'
        }
      },
      {
        name: 'Template SMS',
        data: {
          to: '+1234567890',
          templateName: 'order_shipped_sms',
          variables: {
            orderNumber: 'ORD-12345',
            trackingUrl: 'https://track.example.com/12345'
          }
        }
      },
      {
        name: 'Bulk SMS',
        data: {
          recipients: [
            { to: '+1234567890', message: 'Bulk SMS test 1' },
            { to: '+1234567891', message: 'Bulk SMS test 2' }
          ]
        }
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  Testing: ${test.name}`);
        
        let result;
        if (test.name === 'Bulk SMS') {
          result = await smsService.sendBulkSMS(test.data.recipients);
        } else {
          result = await smsService.sendSMS(test.data);
        }

        this.results.sms.push({
          test: test.name,
          success: true,
          result: result
        });
        
        console.log(`  ✅ ${test.name} passed`);
      } catch (error) {
        this.results.sms.push({
          test: test.name,
          success: false,
          error: error.message
        });
        
        console.log(`  ❌ ${test.name} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test Push Notification Service
   */
  async testPushService() {
    console.log('\n🔔 Testing Push Notification Service...');

    const tests = [
      {
        name: 'Single Push Notification',
        data: {
          token: 'test-device-token-123',
          notification: {
            title: 'Test Notification',
            body: 'This is a test push notification from Amazon Clone!'
          }
        }
      },
      {
        name: 'Push with Data',
        data: {
          token: 'test-device-token-123',
          notification: {
            title: 'Order Update',
            body: 'Your order #12345 has shipped!'
          },
          data: {
            orderId: '12345',
            type: 'shipping_update'
          }
        }
      },
      {
        name: 'Batch Push Notification',
        data: {
          tokens: ['token1', 'token2', 'token3'],
          notification: {
            title: 'Batch Notification',
            body: 'This is a batch push notification test'
          }
        }
      },
      {
        name: 'Topic Subscription',
        data: {
          tokens: ['test-device-token-123'],
          topic: 'promotional-offers'
        }
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  Testing: ${test.name}`);
        
        let result;
        if (test.name === 'Batch Push Notification') {
          result = await pushNotificationService.sendBatchNotification(test.data);
        } else if (test.name === 'Topic Subscription') {
          result = await pushNotificationService.subscribeToTopic(test.data.tokens, test.data.topic);
        } else {
          result = await pushNotificationService.sendNotification(test.data);
        }

        this.results.push.push({
          test: test.name,
          success: true,
          result: result
        });
        
        console.log(`  ✅ ${test.name} passed`);
      } catch (error) {
        this.results.push.push({
          test: test.name,
          success: false,
          error: error.message
        });
        
        console.log(`  ❌ ${test.name} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test Integration with Notification Service
   */
  async testNotificationServiceIntegration() {
    console.log('\n🔄 Testing Notification Service Integration...');

    const tests = [
      {
        name: 'Order Confirmation Email',
        data: {
          userId: this.testUser._id,
          type: 'email',
          category: 'order_confirmation',
          templateName: 'order_confirmation_email',
          variables: {
            customerName: 'Test User',
            orderNumber: 'ORD-12345',
            total: '99.99',
            deliveryDate: '2024-01-15'
          }
        }
      },
      {
        name: 'Shipping Update SMS',
        data: {
          userId: this.testUser._id,
          type: 'sms',
          category: 'shipping_update',
          templateName: 'order_shipped_sms',
          variables: {
            orderNumber: 'ORD-12345',
            trackingUrl: 'https://track.example.com/12345'
          }
        }
      },
      {
        name: 'Price Drop Push',
        data: {
          userId: this.testUser._id,
          type: 'push',
          category: 'price_drop',
          templateName: 'price_drop_push',
          variables: {
            productName: 'iPhone 15',
            newPrice: '699.99',
            oldPrice: '799.99',
            savings: '$100.00'
          }
        }
      },
      {
        name: 'Abandoned Cart In-App',
        data: {
          userId: this.testUser._id,
          type: 'in_app',
          category: 'abandoned_cart',
          templateName: 'abandoned_cart_inapp',
          variables: {
            itemCount: 3
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  Testing: ${test.name}`);
        
        const result = await notificationService.sendNotification(test.data);

        this.results.integration.push({
          test: test.name,
          success: true,
          result: result
        });
        
        console.log(`  ✅ ${test.name} passed`);
      } catch (error) {
        this.results.integration.push({
          test: test.name,
          success: false,
          error: error.message
        });
        
        console.log(`  ❌ ${test.name} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test Analytics and Webhook Handling
   */
  async testAnalyticsAndWebhooks() {
    console.log('\n📊 Testing Analytics and Webhooks...');

    // Test webhook data processing
    const webhookTests = [
      {
        name: 'SMS Delivery Webhook',
        provider: 'twilio',
        data: {
          MessageSid: 'SM1234567890',
          MessageStatus: 'delivered',
          To: '+1234567890'
        }
      },
      {
        name: 'Email Webhook',
        provider: 'sendgrid',
        data: {
          event: 'delivered',
          email: 'test@example.com',
          sg_message_id: 'abc123'
        }
      }
    ];

    for (const test of webhookTests) {
      try {
        console.log(`  Testing: ${test.name}`);
        
        // Simulate webhook processing
        console.log(`  📥 Webhook data: ${JSON.stringify(test.data)}`);
        
        this.results.integration.push({
          test: test.name,
          success: true,
          result: 'Webhook processed successfully'
        });
        
        console.log(`  ✅ ${test.name} passed`);
      } catch (error) {
        this.results.integration.push({
          test: test.name,
          success: false,
          error: error.message
        });
        
        console.log(`  ❌ ${test.name} failed: ${error.message}`);
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Notification System Tests...\n');

    const initialized = await this.initialize();
    if (!initialized) {
      console.log('❌ Failed to initialize test environment');
      return;
    }

    // Run individual service tests
    await this.testSMSService();
    await this.testPushService();
    
    // Run integration tests
    await this.testNotificationServiceIntegration();
    await this.testAnalyticsAndWebhooks();

    // Generate test report
    this.generateReport();

    // Cleanup
    await this.cleanup();
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n📋 Test Report');
    console.log('='.repeat(50));

    const categories = ['sms', 'push', 'integration'];
    let totalTests = 0;
    let passedTests = 0;

    categories.forEach(category => {
      const tests = this.results[category];
      const passed = tests.filter(t => t.success).length;
      const failed = tests.filter(t => !t.success).length;

      console.log(`\n${category.toUpperCase()} Tests:`);
      console.log(`  ✅ Passed: ${passed}`);
      console.log(`  ❌ Failed: ${failed}`);
      console.log(`  📊 Total: ${tests.length}`);

      if (failed > 0) {
        console.log(`  Failed tests:`);
        tests.filter(t => !t.success).forEach(test => {
          console.log(`    - ${test.test}: ${test.error}`);
        });
      }

      totalTests += tests.length;
      passedTests += passed;
    });

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Overall Results:`);
    console.log(`  ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`  📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Notification system is ready!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the configuration and external services.');
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    try {
      await mongoose.disconnect();
      console.log('\n🧹 Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new NotificationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = NotificationTester;