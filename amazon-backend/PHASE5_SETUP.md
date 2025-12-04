# Phase 5 Setup Guide - Payment Processing & Notification System

## 🎯 Overview

Phase 5 implements a comprehensive payment processing and notification system for your Amazon Clone backend. This phase includes:

- **Payment Processing**: Stripe integration for secure payments
- **Email Notifications**: SendGrid integration for transactional emails
- **SMS Notifications**: Twilio integration for SMS alerts
- **Push Notifications**: Firebase Cloud Messaging for mobile/web push notifications
- **In-App Notifications**: Database-stored notifications for the application
- **Notification Templates**: Flexible template system for all notification types
- **User Preferences**: Granular notification preference management
- **Analytics & Webhooks**: Delivery tracking and webhook handling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd amazon-backend

# Install new dependencies for Phase 5
npm install @sendgrid/mail twilio firebase-admin stripe
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure the following services:

#### Required Services:
- **MongoDB**: Already configured
- **JWT**: Already configured

#### Optional Services (Configure as needed):

##### Email Service (SendGrid)
```env
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Amazon Clone
```

##### SMS Service (Twilio)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

##### Push Notifications (Firebase)
```env
FIREBASE_ADMIN_SDK_PATH=./config/firebase-admin-sdk.json
```

##### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

### 3. Initialize Notification Templates

```bash
# Create sample notification templates
node src/scripts/initializeNotificationTemplates.js
```

### 4. Test the System

```bash
# Run comprehensive notification tests
node src/scripts/testNotifications.js
```

### 5. Start the Server

```bash
# Start in development mode
npm run dev

# Or start in production mode
npm start
```

## 📋 Service Setup Instructions

### 🔐 Stripe Setup (Payment Processing)

1. **Create Stripe Account**:
   - Go to [stripe.com](https://stripe.com)
   - Create an account and verify your business

2. **Get API Keys**:
   - Navigate to Dashboard → Developers → API keys
   - Copy your Secret key and Publishable key
   - Add them to your `.env` file

3. **Configure Webhooks**:
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret to your `.env` file

### 📧 SendGrid Setup (Email Service)

1. **Create SendGrid Account**:
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for a free account

2. **Get API Key**:
   - Navigate to Settings → API Keys
   - Create a new API key with "Full Access"
   - Add it to your `.env` file

3. **Verify Sender**:
   - Go to Settings → Sender Authentication
   - Add and verify your sender email address

### 📱 Twilio Setup (SMS Service)

1. **Create Twilio Account**:
   - Go to [twilio.com](https://twilio.com)
   - Sign up for a free account

2. **Get Credentials**:
   - Find your Account SID and Auth Token in the Console
   - Add them to your `.env` file

3. **Get Phone Number**:
   - Navigate to Phone Numbers → Manage → Buy a number
   - Choose a number and add it to your `.env` file

### 🔔 Firebase Setup (Push Notifications)

1. **Create Firebase Project**:
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create a new project

2. **Generate Admin SDK**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-admin-sdk.json` in your config folder

3. **Enable Cloud Messaging**:
   - Navigate to Cloud Messaging in the Firebase console
   - Note your Server key for frontend integration

## 🧪 Testing Guide

### Running Tests

```bash
# Test all notification services
node src/scripts/testNotifications.js

# Initialize notification templates
node src/scripts/initializeNotificationTemplates.js
```

### Manual Testing

#### 1. Test Email Notifications
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "email",
    "category": "order_confirmation",
    "templateName": "order_confirmation_email",
    "variables": {
      "customerName": "John Doe",
      "orderNumber": "ORD-12345",
      "total": "99.99",
      "deliveryDate": "2024-01-15"
    }
  }'
```

#### 2. Test SMS Notifications
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "sms",
    "category": "shipping_update",
    "templateName": "order_shipped_sms",
    "variables": {
      "orderNumber": "ORD-12345",
      "trackingUrl": "https://track.example.com/12345"
    }
  }'
```

#### 3. Test Push Notifications
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "push",
    "category": "price_drop",
    "templateName": "price_drop_push",
    "variables": {
      "productName": "iPhone 15",
      "newPrice": "699.99",
      "oldPrice": "799.99",
      "savings": "$100.00"
    }
  }'
```

## 📊 API Endpoints

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/my-notifications` | Get user's notifications |
| POST | `/api/notifications/send` | Send notification |
| PATCH | `/api/notifications/my-notifications/:id/read` | Mark as read |
| GET | `/api/notifications/preferences` | Get preferences |
| PATCH | `/api/notifications/preferences` | Update preferences |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-payment-intent` | Create payment intent |
| POST | `/api/payments/confirm-payment` | Confirm payment |
| GET | `/api/payments/my-payments` | Get user payments |
| POST | `/api/payments/webhook` | Stripe webhook |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/bulk-send` | Send bulk notifications |
| GET | `/api/notifications/analytics` | Get analytics |
| GET | `/api/notifications/templates` | Manage templates |

## 🔧 Configuration Options

### Notification Preferences

Users can configure preferences for:
- **Channels**: Email, SMS, Push, In-App
- **Categories**: Orders, Payments, Shipping, Promotions, Security
- **Timing**: Timezone, Quiet hours, Frequency

### Template Variables

Common template variables:
- `{{customerName}}` - User's name
- `{{orderNumber}}` - Order reference
- `{{total}}` - Order total
- `{{productName}}` - Product name
- `{{trackingUrl}}` - Tracking link

## 🚨 Troubleshooting

### Common Issues

1. **SMS not sending**:
   - Check Twilio credentials
   - Verify phone number format (+1234567890)
   - Check Twilio account balance

2. **Email not delivering**:
   - Verify SendGrid API key
   - Check sender authentication
   - Review spam filters

3. **Push notifications not working**:
   - Verify Firebase configuration
   - Check device token validity
   - Ensure FCM is enabled

4. **Payment failures**:
   - Check Stripe keys (test vs live)
   - Verify webhook endpoint
   - Review Stripe dashboard for errors

### Logs and Debugging

```bash
# Check application logs
tail -f logs/app.log

# Test individual services
node -e "
const smsService = require('./src/services/smsService');
smsService.sendSMS({to: '+1234567890', message: 'Test'})
  .then(console.log)
  .catch(console.error);
"
```

## 🎉 Success Indicators

✅ **Phase 5 is working correctly when**:
- All notification tests pass
- Users can send/receive notifications
- Payment processing works end-to-end
- Webhook events are processed
- User preferences are respected
- Templates render correctly
- Analytics data is collected

## 🔄 Integration with Frontend

To integrate with your React frontend:

1. **Install frontend dependencies**:
```bash
npm install @stripe/stripe-js firebase
```

2. **Configure notification preferences UI**
3. **Implement payment forms with Stripe Elements**
4. **Set up push notification service worker**
5. **Display in-app notifications**

## 📚 Next Steps

After Phase 5 is complete, consider:
- Adding more notification templates
- Implementing notification scheduling
- Adding notification history/analytics dashboard
- Setting up A/B testing for notifications
- Implementing advanced payment features (subscriptions, marketplace payments)

---

**Need Help?** Check the logs, review the test results, and ensure all external services are properly configured.