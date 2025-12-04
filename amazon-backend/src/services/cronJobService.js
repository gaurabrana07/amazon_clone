const cron = require('node-cron');
const notificationService = require('./notificationService');
const { PaymentTransaction } = require('../models/Payment');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { logger } = require('../utils/logger');

/**
 * Cron Job Service
 * Handles all scheduled tasks and background jobs
 */
class CronJobService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize all cron jobs
   */
  init() {
    if (this.isInitialized) {
      logger.warn('Cron jobs already initialized');
      return;
    }

    try {
      this.scheduleNotificationProcessing();
      this.scheduleAbandonedCartReminders();
      this.schedulePaymentStatusUpdates();
      this.scheduleOrderStatusUpdates();
      this.scheduleDataCleanup();
      this.scheduleAnalyticsGeneration();

      this.isInitialized = true;
      logger.info('✅ Cron jobs initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize cron jobs:', error);
    }
  }

  /**
   * Schedule notification processing (every 2 minutes)
   */
  scheduleNotificationProcessing() {
    const job = cron.schedule('*/2 * * * *', async () => {
      try {
        logger.debug('Processing scheduled notifications...');
        await notificationService.processScheduledNotifications();
        await notificationService.retryFailedNotifications();
      } catch (error) {
        logger.error('Notification processing failed:', error);
      }
    }, {
      scheduled: false,
      name: 'notification-processing'
    });

    this.jobs.set('notification-processing', job);
    logger.info('📧 Scheduled notification processing every 2 minutes');
  }

  /**
   * Schedule abandoned cart reminders (every hour)
   */
  scheduleAbandonedCartReminders() {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        logger.debug('Processing abandoned cart reminders...');
        await this.processAbandonedCarts();
      } catch (error) {
        logger.error('Abandoned cart processing failed:', error);
      }
    }, {
      scheduled: false,
      name: 'abandoned-cart-reminders'
    });

    this.jobs.set('abandoned-cart-reminders', job);
    logger.info('🛒 Scheduled abandoned cart reminders every hour');
  }

  /**
   * Schedule payment status updates (every 10 minutes)
   */
  schedulePaymentStatusUpdates() {
    const job = cron.schedule('*/10 * * * *', async () => {
      try {
        logger.debug('Updating payment statuses...');
        await this.updatePendingPayments();
      } catch (error) {
        logger.error('Payment status update failed:', error);
      }
    }, {
      scheduled: false,
      name: 'payment-status-updates'
    });

    this.jobs.set('payment-status-updates', job);
    logger.info('💳 Scheduled payment status updates every 10 minutes');
  }

  /**
   * Schedule order status updates (every 30 minutes)
   */
  scheduleOrderStatusUpdates() {
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        logger.debug('Processing order status updates...');
        await this.processOrderStatusUpdates();
      } catch (error) {
        logger.error('Order status update failed:', error);
      }
    }, {
      scheduled: false,
      name: 'order-status-updates'
    });

    this.jobs.set('order-status-updates', job);
    logger.info('📦 Scheduled order status updates every 30 minutes');
  }

  /**
   * Schedule data cleanup (daily at 2 AM)
   */
  scheduleDataCleanup() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.debug('Running daily data cleanup...');
        await this.performDataCleanup();
      } catch (error) {
        logger.error('Data cleanup failed:', error);
      }
    }, {
      scheduled: false,
      name: 'data-cleanup'
    });

    this.jobs.set('data-cleanup', job);
    logger.info('🧹 Scheduled daily data cleanup at 2 AM');
  }

  /**
   * Schedule analytics generation (daily at 3 AM)
   */
  scheduleAnalyticsGeneration() {
    const job = cron.schedule('0 3 * * *', async () => {
      try {
        logger.debug('Generating daily analytics...');
        await this.generateDailyAnalytics();
      } catch (error) {
        logger.error('Analytics generation failed:', error);
      }
    }, {
      scheduled: false,
      name: 'analytics-generation'
    });

    this.jobs.set('analytics-generation', job);
    logger.info('📊 Scheduled analytics generation at 3 AM');
  }

  /**
   * Process abandoned carts and send reminders
   */
  async processAbandonedCarts() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: cutoffTime },
      items: { $exists: true, $not: { $size: 0 } },
      reminderSent: { $ne: true }
    }).populate('user');

    logger.info(`Found ${abandonedCarts.length} abandoned carts`);

    for (const cart of abandonedCarts) {
      try {
        if (cart.user) {
          await notificationService.sendAbandonedCartReminder(
            cart.user._id,
            cart
          );

          // Mark reminder as sent
          cart.reminderSent = true;
          await cart.save();

          logger.debug(`Abandoned cart reminder sent to user ${cart.user._id}`);
        }
      } catch (error) {
        logger.error(`Failed to send abandoned cart reminder for cart ${cart._id}:`, error);
      }
    }
  }

  /**
   * Update pending payment statuses
   */
  async updatePendingPayments() {
    const pendingPayments = await PaymentTransaction.find({
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // Older than 30 minutes
    }).limit(50);

    logger.info(`Found ${pendingPayments.length} pending payments to update`);

    for (const payment of pendingPayments) {
      try {
        // Check payment status with provider (Stripe, PayPal, etc.)
        if (payment.provider === 'stripe' && payment.providerTransactionId) {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
          const paymentIntent = await stripe.paymentIntents.retrieve(
            payment.providerTransactionId
          );

          if (paymentIntent.status !== payment.status) {
            payment.status = this.mapStripeStatus(paymentIntent.status);
            payment.providerResponse = paymentIntent;
            await payment.save();

            logger.debug(`Updated payment ${payment._id} status to ${payment.status}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to update payment status for ${payment._id}:`, error);
      }
    }
  }

  /**
   * Process order status updates
   */
  async processOrderStatusUpdates() {
    // Check for orders that need status updates
    const ordersToUpdate = await Order.find({
      status: { $in: ['confirmed', 'processing', 'shipped'] },
      updatedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } // Older than 1 hour
    }).populate('user').limit(100);

    logger.info(`Found ${ordersToUpdate.length} orders for status update`);

    for (const order of ordersToUpdate) {
      try {
        // Simulate order status progression
        let newStatus = order.status;
        let shouldNotify = false;

        switch (order.status) {
          case 'confirmed':
            // Move to processing after 2 hours
            if (order.createdAt < new Date(Date.now() - 2 * 60 * 60 * 1000)) {
              newStatus = 'processing';
              shouldNotify = true;
            }
            break;

          case 'processing':
            // Move to shipped after 24 hours
            if (order.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
              newStatus = 'shipped';
              shouldNotify = true;
              
              // Generate tracking number
              order.shipping.trackingNumber = this.generateTrackingNumber();
              order.shipping.shippedAt = new Date();
            }
            break;

          case 'shipped':
            // Move to delivered after 72 hours
            if (order.shipping.shippedAt && 
                order.shipping.shippedAt < new Date(Date.now() - 72 * 60 * 60 * 1000)) {
              newStatus = 'delivered';
              shouldNotify = true;
              order.shipping.deliveredAt = new Date();
            }
            break;
        }

        if (newStatus !== order.status) {
          order.status = newStatus;
          await order.save();

          logger.debug(`Updated order ${order.orderNumber} status to ${newStatus}`);

          // Send notification if needed
          if (shouldNotify && order.user) {
            if (newStatus === 'shipped') {
              await notificationService.sendShippingUpdate(
                order.user._id,
                order,
                {
                  trackingNumber: order.shipping.trackingNumber,
                  carrier: order.shipping.carrier || 'Express Delivery',
                  estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000)
                }
              );
            } else if (newStatus === 'delivered') {
              await notificationService.sendNotification({
                userId: order.user._id,
                type: 'email',
                category: 'delivery_confirmation',
                variables: {
                  orderNumber: order.orderNumber,
                  deliveryDate: order.shipping.deliveredAt.toLocaleDateString()
                },
                relatedEntities: { order: order._id },
                priority: 'normal'
              });
            }
          }
        }
      } catch (error) {
        logger.error(`Failed to update order status for ${order._id}:`, error);
      }
    }
  }

  /**
   * Perform daily data cleanup
   */
  async performDataCleanup() {
    const tasks = [
      this.cleanupExpiredSessions(),
      this.cleanupOldNotifications(),
      this.cleanupFailedPayments(),
      this.cleanupEmptyCarts()
    ];

    const results = await Promise.allSettled(tasks);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error(`Cleanup task ${index} failed:`, result.reason);
      }
    });

    logger.info('Daily data cleanup completed');
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    // Implementation depends on session storage method
    logger.debug('Cleaning up expired sessions...');
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications() {
    const { Notification } = require('../models/Notification');
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['delivered', 'opened', 'clicked'] }
    });

    logger.debug(`Cleaned up ${result.deletedCount} old notifications`);
  }

  /**
   * Clean up failed payments
   */
  async cleanupFailedPayments() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const result = await PaymentTransaction.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'failed'
    });

    logger.debug(`Cleaned up ${result.deletedCount} failed payments`);
  }

  /**
   * Clean up empty carts
   */
  async cleanupEmptyCarts() {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const result = await Cart.deleteMany({
      updatedAt: { $lt: cutoffDate },
      items: { $size: 0 }
    });

    logger.debug(`Cleaned up ${result.deletedCount} empty carts`);
  }

  /**
   * Generate daily analytics
   */
  async generateDailyAnalytics() {
    logger.debug('Generating daily analytics...');
    
    // Generate various analytics reports
    await Promise.allSettled([
      this.generateSalesAnalytics(),
      this.generateUserAnalytics(),
      this.generateProductAnalytics(),
      this.generateNotificationAnalytics()
    ]);

    logger.info('Daily analytics generation completed');
  }

  /**
   * Generate sales analytics
   */
  async generateSalesAnalytics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday, $lte: endOfYesterday },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    logger.debug('Sales analytics generated:', analytics[0] || 'No data');
  }

  /**
   * Generate user analytics
   */
  async generateUserAnalytics() {
    const User = require('../models/User');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: yesterday }
    });

    logger.debug(`New users yesterday: ${newUsers}`);
  }

  /**
   * Generate product analytics
   */
  async generateProductAnalytics() {
    // Implementation for product analytics
    logger.debug('Product analytics generated');
  }

  /**
   * Generate notification analytics
   */
  async generateNotificationAnalytics() {
    const { Notification } = require('../models/Notification');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const analytics = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday }
        }
      },
      {
        $group: {
          _id: '$type',
          sent: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] }
          },
          opened: {
            $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] }
          }
        }
      }
    ]);

    logger.debug('Notification analytics generated:', analytics);
  }

  /**
   * Map Stripe payment status to internal status
   */
  mapStripeStatus(stripeStatus) {
    const statusMap = {
      'requires_payment_method': 'failed',
      'requires_confirmation': 'pending',
      'requires_action': 'requires_action',
      'processing': 'pending',
      'requires_capture': 'pending',
      'canceled': 'cancelled',
      'succeeded': 'completed'
    };

    return statusMap[stripeStatus] || 'pending';
  }

  /**
   * Generate tracking number
   */
  generateTrackingNumber() {
    const prefix = 'AMZ';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (!this.isInitialized) {
      this.init();
    }

    this.jobs.forEach((job, name) => {
      job.start();
      logger.debug(`Started cron job: ${name}`);
    });

    logger.info('🕐 All cron jobs started');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.debug(`Stopped cron job: ${name}`);
    });

    logger.info('🛑 All cron jobs stopped');
  }

  /**
   * Get job status
   */
  getJobStatus(jobName) {
    const job = this.jobs.get(jobName);
    return job ? {
      name: jobName,
      running: job.running || false,
      scheduled: job.scheduled || false
    } : null;
  }

  /**
   * Get all jobs status
   */
  getAllJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        scheduled: job.scheduled || false
      };
    });
    return status;
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(jobName) {
    const jobMap = {
      'notification-processing': () => notificationService.processScheduledNotifications(),
      'abandoned-cart-reminders': () => this.processAbandonedCarts(),
      'payment-status-updates': () => this.updatePendingPayments(),
      'order-status-updates': () => this.processOrderStatusUpdates(),
      'data-cleanup': () => this.performDataCleanup(),
      'analytics-generation': () => this.generateDailyAnalytics()
    };

    const jobFunction = jobMap[jobName];
    if (!jobFunction) {
      throw new Error(`Job '${jobName}' not found`);
    }

    logger.info(`Manually triggering job: ${jobName}`);
    await jobFunction();
    logger.info(`Job '${jobName}' completed manually`);
  }
}

module.exports = new CronJobService();