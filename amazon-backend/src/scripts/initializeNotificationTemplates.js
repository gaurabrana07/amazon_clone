const mongoose = require('mongoose');
const { NotificationTemplate } = require('../models/Notification');
require('dotenv').config();

/**
 * Sample Notification Templates
 * Creates default templates for common notification scenarios
 */

const sampleTemplates = [
  // Email Templates
  {
    name: 'order_confirmation_email',
    type: 'email',
    category: 'order_confirmation',
    subject: 'Order Confirmation - Order #{{orderNumber}}',
    title: 'Order Confirmed',
    content: {
      text: 'Thank you for your order! Your order #{{orderNumber}} has been confirmed and is being processed. Total: ${{total}}. Expected delivery: {{deliveryDate}}.',
      html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '<h2 style="color: #232f3e;">Order Confirmation</h2>' +
        '<p>Dear {{customerName}},</p>' +
        '<p>Thank you for your order! Your order <strong>#{{orderNumber}}</strong> has been confirmed and is being processed.</p>' +
        '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
        '<h3 style="margin: 0 0 10px 0;">Order Details</h3>' +
        '<p><strong>Order Number:</strong> {{orderNumber}}</p>' +
        '<p><strong>Total Amount:</strong> ${{total}}</p>' +
        '<p><strong>Expected Delivery:</strong> {{deliveryDate}}</p>' +
        '</div>' +
        '<p>You will receive another email when your order ships.</p>' +
        '<p>Thank you for shopping with us!</p>' +
        '</div>'
    },
    variables: [
      { name: 'customerName', type: 'string', required: true },
      { name: 'orderNumber', type: 'string', required: true },
      { name: 'total', type: 'string', required: true },
      { name: 'deliveryDate', type: 'string', required: true }
    ],
    isActive: true
  },

  {
    name: 'payment_confirmation_email',
    type: 'email',
    category: 'payment_confirmation',
    subject: 'Payment Received - Order #{{orderNumber}}',
    title: 'Payment Confirmed',
    content: {
      text: 'Your payment of ${{amount}} for order #{{orderNumber}} has been successfully processed. Payment method: {{paymentMethod}}.',
      html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '<h2 style="color: #232f3e;">Payment Confirmation</h2>' +
        '<p>Dear {{customerName}},</p>' +
        '<p>Your payment has been successfully processed!</p>' +
        '<div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">' +
        '<h3 style="margin: 0 0 10px 0; color: #155724;">Payment Details</h3>' +
        '<p><strong>Amount:</strong> ${{amount}}</p>' +
        '<p><strong>Order Number:</strong> {{orderNumber}}</p>' +
        '<p><strong>Payment Method:</strong> {{paymentMethod}}</p>' +
        '<p><strong>Transaction ID:</strong> {{transactionId}}</p>' +
        '</div>' +
        '<p>Your order is now being processed and will ship soon.</p>' +
        '</div>'
    },
    variables: [
      { name: 'customerName', type: 'string', required: true },
      { name: 'orderNumber', type: 'string', required: true },
      { name: 'amount', type: 'string', required: true },
      { name: 'paymentMethod', type: 'string', required: true },
      { name: 'transactionId', type: 'string', required: true }
    ],
    isActive: true
  },

  // SMS Templates
  {
    name: 'order_shipped_sms',
    type: 'sms',
    category: 'shipping_update',
    content: {
      text: 'Great news! Your order #{{orderNumber}} has shipped and is on its way. Track: {{trackingUrl}}'
    },
    variables: [
      { name: 'orderNumber', type: 'string', required: true },
      { name: 'trackingUrl', type: 'url', required: true }
    ],
    settings: {
      sms: { maxLength: 160 }
    },
    isActive: true
  },

  {
    name: 'delivery_confirmation_sms',
    type: 'sms',
    category: 'delivery_confirmation',
    content: {
      text: 'Your order #{{orderNumber}} has been delivered! We hope you love your purchase. Rate your experience: {{ratingUrl}}'
    },
    variables: [
      { name: 'orderNumber', type: 'string', required: true },
      { name: 'ratingUrl', type: 'url', required: true }
    ],
    settings: {
      sms: { maxLength: 160 }
    },
    isActive: true
  },

  // Push Notification Templates
  {
    name: 'order_status_push',
    type: 'push',
    category: 'shipping_update',
    title: 'Order Update',
    content: {
      text: 'Order #{{orderNumber}} status: {{status}}'
    },
    variables: [
      { name: 'orderNumber', type: 'string', required: true },
      { name: 'status', type: 'string', required: true }
    ],
    settings: {
      push: {
        badge: 1,
        sound: 'default',
        actions: [
          { action: 'track', title: 'Track Order' },
          { action: 'view', title: 'View Details' }
        ]
      }
    },
    isActive: true
  },

  {
    name: 'price_drop_push',
    type: 'push',
    category: 'price_drop',
    title: 'Price Drop Alert!',
    content: {
      text: '{{productName}} is now ${{newPrice}} (was ${{oldPrice}}). Save {{savings}}!'
    },
    variables: [
      { name: 'productName', type: 'string', required: true },
      { name: 'newPrice', type: 'string', required: true },
      { name: 'oldPrice', type: 'string', required: true },
      { name: 'savings', type: 'string', required: true }
    ],
    settings: {
      push: {
        badge: 1,
        sound: 'default',
        actions: [
          { action: 'buy', title: 'Buy Now' },
          { action: 'view', title: 'View Product' }
        ]
      }
    },
    isActive: true
  },

  // In-App Templates
  {
    name: 'abandoned_cart_inapp',
    type: 'in_app',
    category: 'abandoned_cart',
    title: 'Don\'t forget your cart!',
    content: {
      text: 'You have {{itemCount}} items waiting in your cart. Complete your purchase now and save!'
    },
    variables: [
      { name: 'itemCount', type: 'number', required: true }
    ],
    isActive: true
  },

  {
    name: 'review_request_inapp',
    type: 'in_app',
    category: 'review_request',
    title: 'How was your purchase?',
    content: {
      text: 'We\'d love to hear about your experience with {{productName}}. Your review helps other customers!'
    },
    variables: [
      { name: 'productName', type: 'string', required: true }
    ],
    isActive: true
  },

  // Security Templates
  {
    name: 'login_alert_email',
    type: 'email',
    category: 'login_alert',
    subject: 'New Login to Your Account',
    title: 'Login Alert',
    content: {
      text: 'A new login to your account was detected from {{location}} at {{time}}. If this wasn\'t you, please secure your account immediately.',
      html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
        '<h2 style="color: #dc3545;">Security Alert</h2>' +
        '<p>A new login to your account was detected:</p>' +
        '<div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">' +
        '<p><strong>Time:</strong> {{time}}</p>' +
        '<p><strong>Location:</strong> {{location}}</p>' +
        '<p><strong>Device:</strong> {{device}}</p>' +
        '<p><strong>IP Address:</strong> {{ipAddress}}</p>' +
        '</div>' +
        '<p>If this was you, you can ignore this message. If you don\'t recognize this login, please:</p>' +
        '<ul>' +
        '<li>Change your password immediately</li>' +
        '<li>Review your account activity</li>' +
        '<li>Contact support if needed</li>' +
        '</ul>' +
        '</div>'
    },
    variables: [
      { name: 'time', type: 'date', required: true },
      { name: 'location', type: 'string', required: true },
      { name: 'device', type: 'string', required: true },
      { name: 'ipAddress', type: 'string', required: true }
    ],
    isActive: true
  }
];

/**
 * Initialize notification templates
 */
async function initializeTemplates() {
  try {
    // Skip database operations if DB is disabled
    if (process.env.SKIP_DB === 'true') {
      console.log('⚠️ Database disabled (SKIP_DB=true) - skipping template initialization');
      console.log('🎉 Templates would be initialized when database is available');
      return;
    }

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing templates (optional - remove in production)
    // await NotificationTemplate.deleteMany({});
    // console.log('Cleared existing templates');

    // Insert sample templates
    for (const template of sampleTemplates) {
      const existingTemplate = await NotificationTemplate.findOne({ 
        name: template.name 
      });

      if (!existingTemplate) {
        await NotificationTemplate.create(template);
        console.log(`✅ Created template: ${template.name}`);
      } else {
        console.log(`⏭️  Template already exists: ${template.name}`);
      }
    }

    console.log('🎉 Sample notification templates initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  initializeTemplates();
}

module.exports = { sampleTemplates, initializeTemplates };