const mongoose = require('mongoose');

/**
 * Payment Schema
 * Handles all payment transactions, methods, and processing
 */

// Payment method schema for stored payment methods
const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_account'],
    required: [true, 'Payment method type is required']
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'apple', 'google'],
    required: [true, 'Payment provider is required']
  },
  providerPaymentMethodId: {
    type: String,
    required: [true, 'Provider payment method ID is required'],
    index: true
  },
  
  // Card details (for display purposes only - sensitive data stays with provider)
  card: {
    brand: String, // visa, mastercard, amex, etc.
    last4: String,
    expiryMonth: Number,
    expiryYear: Number,
    funding: String, // credit, debit, prepaid
    country: String
  },
  
  // PayPal details
  paypal: {
    email: String,
    payerId: String
  },
  
  // Bank account details (ACH)
  bankAccount: {
    bankName: String,
    accountType: String, // checking, savings
    last4: String,
    routingNumber: String // encrypted
  },
  
  // Digital wallet details
  digitalWallet: {
    email: String,
    phone: String
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Billing address
  billingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Usage tracking
  usageStats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    totalSpent: {
      type: Number,
      default: 0
    },
    successfulTransactions: {
      type: Number,
      default: 0
    },
    failedTransactions: {
      type: Number,
      default: 0
    }
  },
  
  // Security and verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationMethod: String
  },
  
  metadata: {
    fingerprint: String,
    customerIp: String,
    deviceId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Payment transaction schema
const paymentTransactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  
  // Transaction details
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    index: true
  },
  providerTransactionId: {
    type: String,
    required: [true, 'Provider transaction ID is required'],
    index: true
  },
  
  type: {
    type: String,
    enum: ['payment', 'refund', 'partial_refund', 'chargeback', 'dispute'],
    required: [true, 'Transaction type is required'],
    index: true
  },
  
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'apple', 'google', 'bank'],
    required: [true, 'Payment provider is required']
  },
  
  // Amount details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  
  // Fees and charges
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: [
      'pending', 'processing', 'requires_action', 'requires_confirmation',
      'succeeded', 'failed', 'canceled', 'disputed', 'refunded'
    ],
    default: 'pending',
    index: true
  },
  
  // Detailed status information
  statusDetails: {
    code: String,
    message: String,
    declineCode: String,
    networkStatus: String,
    reason: String
  },
  
  // Timeline tracking
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Refund information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    processedAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Risk assessment
  riskAssessment: {
    score: Number, // 0-100, higher = riskier
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    },
    factors: [String],
    reviewRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // 3D Secure / Authentication
  authentication: {
    threeDSecure: {
      status: String,
      version: String,
      authenticationFlow: String
    },
    biometric: {
      used: Boolean,
      type: String
    }
  },
  
  // Billing and shipping info
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  
  // Payment metadata
  metadata: {
    ip: String,
    userAgent: String,
    deviceFingerprint: String,
    sessionId: String,
    customerNote: String,
    internalNote: String
  },
  
  // Webhook and notification tracking
  webhooks: [{
    event: String,
    timestamp: Date,
    processed: Boolean,
    attempts: Number,
    lastAttempt: Date
  }],
  
  // Processing timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  settledAt: Date,
  failedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentMethodSchema.index({ user: 1, isDefault: 1 });
paymentMethodSchema.index({ user: 1, type: 1 });
paymentMethodSchema.index({ providerPaymentMethodId: 1 });

paymentTransactionSchema.index({ order: 1 });
paymentTransactionSchema.index({ user: 1, status: 1 });
paymentTransactionSchema.index({ transactionId: 1 }, { unique: true });
paymentTransactionSchema.index({ providerTransactionId: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

// Virtual for payment method display name
paymentMethodSchema.virtual('displayName').get(function() {
  if (this.type === 'credit_card' || this.type === 'debit_card') {
    return `${this.card.brand.toUpperCase()} •••• ${this.card.last4}`;
  } else if (this.type === 'paypal') {
    return `PayPal ${this.paypal.email}`;
  } else if (this.type === 'bank_account') {
    return `${this.bankAccount.bankName} •••• ${this.bankAccount.last4}`;
  }
  return this.type.replace('_', ' ').toUpperCase();
});

// Virtual for success rate
paymentMethodSchema.virtual('successRate').get(function() {
  const total = this.usageStats.successfulTransactions + this.usageStats.failedTransactions;
  if (total === 0) return 100;
  return (this.usageStats.successfulTransactions / total) * 100;
});

// Virtual for net amount (after fees)
paymentTransactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.total;
});

// Virtual for is refundable
paymentTransactionSchema.virtual('isRefundable').get(function() {
  return this.status === 'succeeded' && this.type === 'payment';
});

// Pre-save middleware to ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Pre-save middleware to add timeline entry
paymentTransactionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      description: `Status changed to ${this.status}`
    });
  }
  next();
});

// Method to generate transaction ID
paymentTransactionSchema.statics.generateTransactionId = function() {
  const prefix = 'TXN';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// Method to record usage
paymentMethodSchema.methods.recordUsage = function(amount, success = true) {
  this.usageStats.timesUsed += 1;
  this.usageStats.lastUsed = new Date();
  
  if (success) {
    this.usageStats.successfulTransactions += 1;
    this.usageStats.totalSpent += amount;
  } else {
    this.usageStats.failedTransactions += 1;
  }
  
  return this.save();
};

// Method to process refund
paymentTransactionSchema.methods.processRefund = function(amount, reason) {
  if (!this.isRefundable) {
    throw new Error('Transaction is not refundable');
  }
  
  const refundAmount = amount || this.amount;
  const totalRefunded = this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  
  if (totalRefunded + refundAmount > this.amount) {
    throw new Error('Refund amount exceeds transaction amount');
  }
  
  this.refunds.push({
    refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    amount: refundAmount,
    reason,
    status: 'pending',
    processedAt: new Date()
  });
  
  // Update status
  const newTotalRefunded = totalRefunded + refundAmount;
  if (newTotalRefunded === this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Static method to get transaction analytics
paymentTransactionSchema.statics.getTransactionAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        type: 'payment'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

module.exports = { PaymentMethod, PaymentTransaction };