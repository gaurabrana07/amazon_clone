const twilio = require('twilio');
const AppError = require('../utils/AppError');

/**
 * SMS Service
 * Handles SMS notifications using Twilio
 */

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.isEnabled = false;
    
    // Safely initialize Twilio client
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if(!accountSid || !authToken || 
          accountSid.includes('your') || authToken.includes('your') ||
          accountSid === 'disabled' || authToken === 'disabled' ||
          accountSid === 'your_twilio_account_sid' || authToken === 'your_twilio_auth_token'){
        return;
      }
      
      if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 10) {
        this.client = twilio(accountSid, authToken);
        this.isEnabled = true;
        console.log('✓ Twilio SMS service initialized');
      } else if (accountSid || authToken) {
        console.warn('⚠ Invalid Twilio credentials format - SMS service disabled');
      }
    } 
    catch(error){
      console.error('✗ Failed to initialize Twilio SMS service:', error.message);
      this.client = null;
      this.isEnabled = false;
    }
  }

  /**
   * Check if SMS service is available
   */
  isAvailable(){
    return this.client !== null && this.fromNumber;
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber){
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phoneNumber;
    } else {
      return `+${cleaned}`;
    }
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400);
    }

    const formatted = this.formatPhoneNumber(phoneNumber);
    
    // Basic validation - E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(formatted)) {
      throw new AppError('Invalid phone number format', 400);
    }

    return formatted;
  }

  /**
   * Send SMS message
   */
  async sendSMS(options) {
    const { to, message, from, statusCallback } = options;

    if (!this.isAvailable()) {
      console.warn('SMS service not available - simulating SMS send');
      return {
        success: true,
        sid: `sim_${Date.now()}`,
        status: 'sent',
        to: to,
        message: 'SMS service not configured - message simulated',
        simulation: true
      };
    }

    try {
      // Validate and format phone number
      const formattedTo = this.validatePhoneNumber(to);
      
      // Prepare message options
      const messageOptions = {
        body: message,
        from: from || this.fromNumber,
        to: formattedTo
      };

      // Add status callback if provided
      if (statusCallback) {
        messageOptions.statusCallback = statusCallback;
        messageOptions.statusCallbackMethod = 'POST';
      }

      // Send SMS
      const result = await this.client.messages.create(messageOptions);

      console.log(`✓ SMS sent successfully: ${result.sid}`);

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        dateCreated: result.dateCreated,
        dateSent: result.dateSent,
        uri: result.uri,
        accountSid: result.accountSid,
        numSegments: result.numSegments,
        price: result.price,
        priceUnit: result.priceUnit,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      };

    } catch (error) {
      console.error('✗ SMS sending failed:', error.message);
      
      throw new AppError(
        `SMS sending failed: ${error.message}`,
        error.status || 500
      );
    }
  }

  /**
   * Send SMS with template
   */
  async sendSMSWithTemplate(options) {
    const { to, templateId, variables = {}, from } = options;

    // For now, we'll use a simple template system
    // In a real application, you might store templates in the database
    const templates = {
      'order_confirmation': 'Hi {{customerName}}! Your order #{{orderNumber}} has been confirmed. Total: ${{orderTotal}}. Thank you for shopping with us!',
      'shipping_update': 'Your order #{{orderNumber}} has shipped! Track it here: {{trackingUrl}}. Expected delivery: {{deliveryDate}}',
      'payment_failed': 'Payment failed for order #{{orderNumber}}. Please update your payment method to complete your purchase.',
      'otp_verification': 'Your verification code is: {{otpCode}}. This code expires in 10 minutes.',
      'password_reset': 'Your password reset code is: {{resetCode}}. Use this code to reset your password.',
      'delivery_notification': 'Your order #{{orderNumber}} has been delivered! We hope you love your purchase.',
      'cart_abandonment': 'Hi {{customerName}}! You left items in your cart. Complete your purchase now and save!'
    };

    const template = templates[templateId];
    if (!template) {
      throw new AppError(`SMS template '${templateId}' not found`, 404);
    }

    // Replace variables in template
    let message = template;
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), variables[key]);
    });

    return this.sendSMS({
      to,
      message,
      from
    });
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(messages) {
    if (!Array.isArray(messages)) {
      throw new AppError('Messages must be an array', 400);
    }

    const results = [];

    for (const messageData of messages) {
      try {
        const result = await this.sendSMS(messageData);
        results.push({
          ...messageData,
          result,
          success: true
        });
      } catch (error) {
        results.push({
          ...messageData,
          error: error.message,
          success: false
        });
      }
    }

    return {
      total: messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(phoneNumber, otp, expiryMinutes = 10) {
    return this.sendSMSWithTemplate({
      to: phoneNumber,
      templateId: 'otp_verification',
      variables: {
        otpCode: otp,
        expiryMinutes
      }
    });
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordReset(phoneNumber, resetCode) {
    return this.sendSMSWithTemplate({
      to: phoneNumber,
      templateId: 'password_reset',
      variables: {
        resetCode
      }
    });
  }

  /**
   * Get SMS delivery status
   */
  async getMessageStatus(messageSid) {
    if (!this.isAvailable()) {
      return {
        sid: messageSid,
        status: 'delivered',
        simulation: true
      };
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        direction: message.direction,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        numSegments: message.numSegments,
        price: message.price,
        priceUnit: message.priceUnit,
        uri: message.uri
      };

    } catch (error) {
      console.error('Failed to get message status:', error.message);
      throw new AppError(`Failed to get message status: ${error.message}`, 500);
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo() {
    if (!this.isAvailable()) {
      return {
        available: false,
        reason: 'SMS service not configured'
      };
    }

    try {
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      return {
        available: true,
        accountSid: account.sid,
        accountName: account.friendlyName,
        status: account.status,
        type: account.type,
        dateCreated: account.dateCreated,
        dateUpdated: account.dateUpdated
      };

    } catch (error) {
      console.error('Failed to get account info:', error.message);
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature, url) {
    if (!this.isAvailable()) {
      return true; // Skip validation in simulation mode
    }

    try {
      return twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        payload
      );
    } catch (error) {
      console.error('Webhook signature validation failed:', error.message);
      return false;
    }
  }

  /**
   * Handle status webhooks
   */
  async handleStatusWebhook(payload) {
    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage
    } = payload;

    console.log(`SMS Status Update: ${MessageSid} - ${MessageStatus}`);

    // Return standardized status information
    return {
      messageSid: MessageSid,
      status: MessageStatus,
      to: To,
      from: From,
      errorCode: ErrorCode,
      errorMessage: ErrorMessage,
      timestamp: new Date(),
      isDelivered: MessageStatus === 'delivered',
      isFailed: ['failed', 'undelivered'].includes(MessageStatus)
    };
  }

  /**
   * Get SMS analytics
   */
  async getAnalytics(startDate, endDate) {
    if (!this.isAvailable()) {
      return {
        available: false,
        reason: 'SMS service not configured'
      };
    }

    try {
      // Fetch messages from the specified date range
      const messages = await this.client.messages.list({
        dateSentAfter: new Date(startDate),
        dateSentBefore: new Date(endDate),
        limit: 1000 // Twilio's default limit
      });

      // Analyze the messages
      const analytics = {
        totalMessages: messages.length,
        successful: 0,
        failed: 0,
        pending: 0,
        delivered: 0,
        undelivered: 0,
        totalCost: 0,
        avgCostPerMessage: 0,
        messagesByDay: {},
        statusBreakdown: {},
        errorCodes: {}
      };

      messages.forEach(message => {
        // Count by status
        analytics.statusBreakdown[message.status] = 
          (analytics.statusBreakdown[message.status] || 0) + 1;

        // Count specific statuses
        switch (message.status) {
          case 'delivered':
            analytics.delivered++;
            analytics.successful++;
            break;
          case 'sent':
          case 'queued':
          case 'accepted':
            analytics.pending++;
            break;
          case 'failed':
          case 'undelivered':
            analytics.failed++;
            if (message.errorCode) {
              analytics.errorCodes[message.errorCode] = 
                (analytics.errorCodes[message.errorCode] || 0) + 1;
            }
            break;
        }

        // Calculate costs
        if (message.price) {
          analytics.totalCost += parseFloat(message.price);
        }

        // Group by day
        if (message.dateSent) {
          const day = message.dateSent.toISOString().split('T')[0];
          analytics.messagesByDay[day] = (analytics.messagesByDay[day] || 0) + 1;
        }
      });

      analytics.avgCostPerMessage = analytics.totalMessages > 0 ? 
        analytics.totalCost / analytics.totalMessages : 0;

      return {
        available: true,
        period: { startDate, endDate },
        analytics
      };

    } catch (error) {
      console.error('Failed to get SMS analytics:', error.message);
      throw new AppError(`Failed to get SMS analytics: ${error.message}`, 500);
    }
  }

  /**
   * Test SMS configuration
   */
  async testConfiguration(testPhoneNumber) {
    try {
      const testMessage = `Test message from Amazon Clone backend. Time: ${new Date().toISOString()}`;
      
      const result = await this.sendSMS({
        to: testPhoneNumber,
        message: testMessage
      });

      return {
        success: true,
        message: 'Test SMS sent successfully',
        result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SMSService();