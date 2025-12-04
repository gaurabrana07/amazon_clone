const mongoose = require('mongoose');

/**
 * Order Schema
 * Complete order management with items, payments, shipping, and tracking
 */

// Order item schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productSnapshot: {
    name: String,
    description: String,
    brand: String,
    model: String,
    images: [String],
    specifications: mongoose.Schema.Types.Mixed
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  variant: {
    size: String,
    color: String,
    style: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  itemTotal: {
    type: Number,
    required: [true, 'Item total is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    updates: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String
    }]
  }
}, {
  _id: true,
  timestamps: true
});

// Address schema for shipping and billing
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'United States',
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  }
}, {
  _id: false
});

// Payment schema
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'amazon_pay', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'amazon_payments'],
    default: 'stripe'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    sparse: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },
  failureReason: String,
  refunds: [{
    amount: Number,
    reason: String,
    refundId: String,
    processedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    }
  }],
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  billingAddress: addressSchema,
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  _id: true,
  timestamps: true
});

// Main order schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  items: [orderItemSchema],
  
  // Pricing details
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  },
  
  // Applied coupon
  coupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    appliedAt: Date
  },
  
  // Addresses
  shippingAddress: {
    type: addressSchema,
    required: [true, 'Shipping address is required']
  },
  billingAddress: {
    type: addressSchema,
    required: [true, 'Billing address is required']
  },
  
  // Payment information
  payment: paymentSchema,
  
  // Order status and lifecycle
  status: {
    type: String,
    enum: [
      'pending_payment', 'payment_failed', 'confirmed', 'processing',
      'shipped', 'partially_shipped', 'delivered', 'partially_delivered',
      'cancelled', 'refunded', 'partially_refunded', 'returned'
    ],
    default: 'pending_payment',
    index: true
  },
  
  // Important dates
  placedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Shipping details
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    instructions: String,
    requiresSignature: {
      type: Boolean,
      default: false
    }
  },
  
  // Order notes and communication
  notes: {
    customer: String,
    internal: String,
    admin: String
  },
  
  // Customer service
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification', 'call']
    },
    subject: String,
    content: String,
    sentAt: Date,
    sentBy: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'bounced']
    }
  }],
  
  // Returns and exchanges
  returns: [{
    items: [{
      orderItem: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      reason: String
    }],
    reason: {
      type: String,
      enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged', 'other']
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'received', 'processed', 'refunded']
    },
    requestedAt: Date,
    processedAt: Date,
    refundAmount: Number,
    notes: String
  }],
  
  // Analytics and tracking
  analytics: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone', 'store']
    },
    campaign: String,
    referrer: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    conversionTime: Number, // Time from first visit to order
    cartAbandonmentTime: Number // Time cart was abandoned before order
  },
  
  // System metadata
  metadata: {
    ip: String,
    userAgent: String,
    sessionId: String,
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ placedAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'shipping.estimatedDelivery': 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.placedAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for is deliverable
orderSchema.virtual('isDeliverable').get(function() {
  return ['confirmed', 'processing', 'shipped', 'partially_shipped'].includes(this.status);
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending_payment', 'confirmed', 'processing'].includes(this.status);
});

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await this.constructor.generateOrderNumber();
  }
  next();
});

// Method to generate unique order number
orderSchema.statics.generateOrderNumber = async function() {
  const prefix = 'AMZ';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  let orderNumber;
  let exists = true;
  let counter = 0;
  
  while (exists && counter < 10) {
    orderNumber = `${prefix}${timestamp}${random}${counter || ''}`;
    exists = await this.findOne({ orderNumber });
    counter++;
  }
  
  if (exists) {
    throw new Error('Unable to generate unique order number');
  }
  
  return orderNumber;
};

// Method to confirm order
orderSchema.methods.confirmOrder = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

// Method to ship order
orderSchema.methods.shipOrder = function(carrier, trackingNumber, estimatedDelivery) {
  this.status = 'shipped';
  this.shippedAt = new Date();
  this.shipping.carrier = carrier;
  this.shipping.estimatedDelivery = estimatedDelivery;
  
  // Update all items to shipped
  this.items.forEach(item => {
    if (item.status === 'confirmed' || item.status === 'processing') {
      item.status = 'shipped';
      if (trackingNumber) {
        item.tracking.trackingNumber = trackingNumber;
        item.tracking.carrier = carrier;
        item.tracking.estimatedDelivery = estimatedDelivery;
      }
    }
  });
  
  return this.save();
};

// Method to deliver order
orderSchema.methods.deliverOrder = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  this.shipping.actualDelivery = new Date();
  
  // Update all items to delivered
  this.items.forEach(item => {
    if (item.status === 'shipped') {
      item.status = 'delivered';
      if (item.tracking) {
        item.tracking.actualDelivery = new Date();
      }
    }
  });
  
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason) {
  if (!this.canBeCancelled) {
    throw new Error('Order cannot be cancelled in current status');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.notes.internal = reason;
  
  // Update all items to cancelled
  this.items.forEach(item => {
    if (['pending', 'confirmed', 'processing'].includes(item.status)) {
      item.status = 'cancelled';
    }
  });
  
  return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = function(amount, reason) {
  if (!this.payment.refunds) {
    this.payment.refunds = [];
  }
  
  this.payment.refunds.push({
    amount,
    reason,
    processedAt: new Date(),
    status: 'pending'
  });
  
  const totalRefunded = this.payment.refunds.reduce((total, refund) => total + refund.amount, 0);
  
  if (totalRefunded >= this.pricing.total) {
    this.payment.status = 'refunded';
    this.status = 'refunded';
  } else {
    this.payment.status = 'partially_refunded';
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Method to add tracking update
orderSchema.methods.addTrackingUpdate = function(itemId, status, location, description) {
  const item = this.items.id(itemId);
  if (item) {
    if (!item.tracking.updates) {
      item.tracking.updates = [];
    }
    
    item.tracking.updates.push({
      status,
      location,
      description,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status, limit = 50) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .sort({ placedAt: -1 })
    .limit(limit);
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'shipped', 'confirmed'] },
        placedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$placedAt' },
          month: { $month: '$placedAt' },
          day: { $dayOfMonth: '$placedAt' }
        },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        totalItems: { $sum: { $size: '$items' } },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;