const mongoose = require('mongoose');

/**
 * Shopping Cart Schema
 * Manages user shopping cart with items, quantities, and calculations
 */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50 items']
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
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item total
cartItemSchema.virtual('itemTotal').get(function() {
  return this.price * this.quantity;
});

// Virtual for savings
cartItemSchema.virtual('savings').get(function() {
  return (this.originalPrice - this.price) * this.quantity;
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    appliedAt: Date,
    validUntil: Date
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  metadata: {
    sessionId: String,
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'expired'],
    default: 'active',
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ lastActivity: 1 });
cartSchema.index({ expiresAt: 1 });

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + item.itemTotal, 0);
});

// Virtual for total savings
cartSchema.virtual('totalSavings').get(function() {
  return this.items.reduce((total, item) => total + item.savings, 0);
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for coupon discount amount
cartSchema.virtual('couponDiscount').get(function() {
  if (!this.coupon || !this.coupon.discount) return 0;
  
  const subtotal = this.subtotal;
  if (this.coupon.discountType === 'percentage') {
    return (subtotal * this.coupon.discount) / 100;
  }
  return Math.min(this.coupon.discount, subtotal);
});

// Virtual for shipping cost (calculated based on items)
cartSchema.virtual('shippingCost').get(function() {
  const subtotal = this.subtotal;
  const freeShippingThreshold = 50; // $50 for free shipping
  
  if (subtotal >= freeShippingThreshold) return 0;
  
  // Standard shipping rate
  const standardShipping = 5.99;
  const heavyItemSurcharge = this.items.some(item => 
    item.product && item.product.shipping && item.product.shipping.weight > 10
  ) ? 2.00 : 0;
  
  return standardShipping + heavyItemSurcharge;
});

// Virtual for tax amount (8.5% tax rate)
cartSchema.virtual('taxAmount').get(function() {
  const taxableAmount = this.subtotal - this.couponDiscount;
  return Math.max(0, taxableAmount * 0.085);
});

// Virtual for final total
cartSchema.virtual('total').get(function() {
  return this.subtotal - this.couponDiscount + this.shippingCost + this.taxAmount;
});

// Middleware to update lastActivity before save
cartSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  
  // Update lastModified for modified items
  this.items.forEach(item => {
    if (item.isModified()) {
      item.lastModified = new Date();
    }
  });
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, variant = {}, price, originalPrice) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  
  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price;
    this.items[existingItemIndex].originalPrice = originalPrice;
    this.items[existingItemIndex].lastModified = new Date();
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      variant,
      price,
      originalPrice,
      discount: Math.max(0, originalPrice - price)
    });
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items.id(itemId).remove();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      item.remove();
    } else {
      item.quantity = quantity;
      item.lastModified = new Date();
    }
  }
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.coupon = undefined;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discount, discountType = 'percentage', validUntil) {
  this.coupon = {
    code: couponCode,
    discount,
    discountType,
    appliedAt: new Date(),
    validUntil
  };
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.coupon = undefined;
  return this.save();
};

// Method to convert cart to order data
cartSchema.methods.toOrderData = function() {
  return {
    items: this.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      variant: item.variant,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      itemTotal: item.itemTotal
    })),
    pricing: {
      subtotal: this.subtotal,
      couponDiscount: this.couponDiscount,
      shippingCost: this.shippingCost,
      taxAmount: this.taxAmount,
      total: this.total
    },
    coupon: this.coupon,
    shippingAddress: this.shippingAddress,
    billingAddress: this.billingAddress
  };
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId, status: 'active' })
    .populate({
      path: 'items.product',
      select: 'name price images inventory.quantity isActive'
    });
  
  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  }
  
  return cart;
};

// Static method to get abandoned carts
cartSchema.statics.getAbandonedCarts = function(hours = 24) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    status: 'active',
    lastActivity: { $lt: cutoffDate },
    'items.0': { $exists: true } // Has at least one item
  }).populate('user', 'name email');
};

// Static method to cleanup expired carts
cartSchema.statics.cleanupExpiredCarts = function() {
  return this.deleteMany({
    status: 'expired',
    expiresAt: { $lt: new Date() }
  });
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;