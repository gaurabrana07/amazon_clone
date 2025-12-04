const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const { logger } = require('../utils/logger');

/**
 * Email Service
 * Handles all email communications including transactional and marketing emails
 */

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      // Use SendGrid in production only if properly configured
      return nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    // Use Mailtrap for development or if SendGrid not configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }

    // Fallback: Create a test transport (emails won't be sent)
    logger.warn('Email service not properly configured. Using test transport.');
    return nodemailer.createTransporter({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a template
    const html = this.generateTemplate(template);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html, {
        wordwrap: 80
      })
    };

    // 3) Create a transport and send email
    try {
      await this.newTransport().sendMail(mailOptions);
      logger.info(`Email sent successfully to ${this.to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${this.to}: ${error.message}`);
      throw error;
    }
  }

  generateTemplate(type) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amazon Clone</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #ff9900;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #232f3e;
          }
          .content {
            padding: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ff9900;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #e68900;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #ddd;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          .highlight {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .security-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Amazon Clone</div>
          </div>
          <div class="content">
            {{CONTENT}}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Amazon Clone. All rights reserved.</p>
            <p>This email was sent to ${this.to}</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let content = '';

    switch (type) {
      case 'welcome':
        content = `
          <h2>Welcome to Amazon Clone, ${this.firstName}! 🎉</h2>
          <p>Thank you for joining our community. We're excited to have you on board!</p>
          
          <div class="highlight">
            <p><strong>To get started, please verify your email address:</strong></p>
            <p style="text-align: center;">
              <a href="${this.url}" class="button">Verify Email Address</a>
            </p>
            <p><small>This link will expire in 24 hours.</small></p>
          </div>

          <h3>What's next?</h3>
          <ul>
            <li>✅ Verify your email address</li>
            <li>🛍️ Start shopping from millions of products</li>
            <li>⭐ Create your wishlist</li>
            <li>🚚 Enjoy fast and reliable delivery</li>
          </ul>

          <p>If you didn't create this account, please ignore this email.</p>
        `;
        break;

      case 'emailVerification':
        content = `
          <h2>Verify Your Email Address</h2>
          <p>Hi ${this.firstName},</p>
          <p>Please click the button below to verify your email address:</p>
          
          <div style="text-align: center;">
            <a href="${this.url}" class="button">Verify Email Address</a>
          </div>

          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${this.url}
          </p>

          <div class="security-notice">
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>This link will expire in 24 hours</li>
              <li>If you didn't request this verification, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        `;
        break;

      case 'passwordReset':
        content = `
          <h2>Reset Your Password</h2>
          <p>Hi ${this.firstName},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${this.url}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${this.url}
          </p>

          <div class="security-notice">
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
              <li>Consider changing your password if you suspect unauthorized access</li>
            </ul>
          </div>

          <p>If you continue to have problems, please contact our support team.</p>
        `;
        break;

      case 'passwordChanged':
        content = `
          <h2>Password Changed Successfully</h2>
          <p>Hi ${this.firstName},</p>
          <p>Your password has been successfully changed.</p>
          
          <div class="highlight">
            <p><strong>Password changed at:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div class="security-notice">
            <p><strong>Didn't change your password?</strong></p>
            <p>If you didn't make this change, please contact our support team immediately and consider:</p>
            <ul>
              <li>Changing your password again</li>
              <li>Reviewing your account security</li>
              <li>Enabling two-factor authentication</li>
            </ul>
          </div>

          <p>Thank you for keeping your account secure!</p>
        `;
        break;

      case 'accountDeactivated':
        content = `
          <h2>Account Deactivated</h2>
          <p>Hi ${this.firstName},</p>
          <p>Your account has been deactivated as requested.</p>
          
          <div class="highlight">
            <p>Your account data will be retained for 30 days in case you want to reactivate it.</p>
            <p>After 30 days, your account and all associated data will be permanently deleted.</p>
          </div>

          <p><strong>To reactivate your account:</strong></p>
          <p>Simply log in with your credentials within the next 30 days.</p>

          <p>We're sorry to see you go. If you have any feedback about your experience, we'd love to hear from you.</p>
        `;
        break;

      default:
        content = `
          <h2>Hello ${this.firstName}!</h2>
          <p>Thank you for using Amazon Clone.</p>
        `;
    }

    return baseTemplate.replace('{{CONTENT}}', content);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Amazon Clone! Please verify your account');
  }

  async sendEmailVerification() {
    await this.send('emailVerification', 'Verify your email address');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset your password (valid for 10 minutes)');
  }

  async sendPasswordChanged() {
    await this.send('passwordChanged', 'Your password has been changed');
  }

  async sendAccountDeactivated() {
    await this.send('accountDeactivated', 'Your account has been deactivated');
  }

  // Marketing emails
  async sendOrderConfirmation(orderDetails) {
    // Implementation for order confirmation emails
    await this.send('orderConfirmation', 'Order Confirmation');
  }

  async sendShippingUpdate(trackingInfo) {
    // Implementation for shipping update emails
    await this.send('shippingUpdate', 'Your order is on the way!');
  }

  async sendPromotionalEmail(promoDetails) {
    // Implementation for promotional emails
    await this.send('promotional', promoDetails.subject);
  }
}

module.exports = Email;