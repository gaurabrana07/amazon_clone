const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

/**
 * Cart Controller
 * Handles shopping cart operations including add, remove, update items
 */

// Get user's cart
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOrCreateForUser(req.user.id)
    .populate({
      path: 'items.product',
      select: 'name price images inventory.quantity isActive brand discount',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

  // Check for unavailable products
  const unavailableItems = cart.items.filter(item => 
    !item.product || !item.product.isActive || 
    item.product.inventory.quantity < item.quantity
  );

  if (unavailableItems.length > 0) {
    // Remove unavailable items
    cart.items = cart.items.filter(item => 
      item.product && item.product.isActive && 
      item.product.inventory.quantity >= item.quantity
    );
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        totalSavings: cart.totalSavings,
        couponDiscount: cart.couponDiscount,
        shippingCost: cart.shippingCost,
        taxAmount: cart.taxAmount,
        total: cart.total
      },
      unavailableItems: unavailableItems.length
    }
  });
});

// Add item to cart
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, variant = {} } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isActive) {
    return next(new AppError('Product is not available', 400));
  }

  // Check inventory
  if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
    return next(new AppError(`Only ${product.inventory.quantity} items available in stock`, 400));
  }

  // Get current price
  const currentPrice = product.discount && product.discount.isActive ? 
    product.discount.discountedPrice : product.price;

  const cart = await Cart.findOrCreateForUser(req.user.id);
  
  // Check if adding this quantity would exceed limits
  const existingItem = cart.items.find(item => 
    item.product.toString() === productId &&
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  const newTotalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  
  if (newTotalQuantity > 50) {
    return next(new AppError('Maximum quantity per item is 50', 400));
  }

  if (product.inventory.trackQuantity && product.inventory.quantity < newTotalQuantity) {
    return next(new AppError(`Only ${product.inventory.quantity} items available in stock`, 400));
  }

  await cart.addItem(productId, quantity, variant, currentPrice, product.price);

  // Populate cart for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images inventory.quantity brand'
  });

  logger.info('Item added to cart', {
    userId: req.user.id,
    productId,
    quantity,
    cartTotal: cart.total
  });

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        total: cart.total
      }
    }
  });
});

// Update cart item quantity
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 0 || quantity > 50) {
    return next(new AppError('Quantity must be between 0 and 50', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id, status: 'active' })
    .populate('items.product', 'inventory.quantity inventory.trackQuantity isActive');

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  // Check inventory if increasing quantity
  if (quantity > item.quantity && item.product.inventory.trackQuantity) {
    if (item.product.inventory.quantity < quantity) {
      return next(new AppError(`Only ${item.product.inventory.quantity} items available in stock`, 400));
    }
  }

  await cart.updateItemQuantity(itemId, quantity);

  // Populate cart for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images inventory.quantity brand'
  });

  logger.info('Cart item updated', {
    userId: req.user.id,
    itemId,
    quantity,
    cartTotal: cart.total
  });

  res.status(200).json({
    success: true,
    message: quantity === 0 ? 'Item removed from cart' : 'Item quantity updated',
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        total: cart.total
      }
    }
  });
});

// Remove item from cart
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return next(new AppError('Item not found in cart', 404));
  }

  await cart.removeItem(itemId);

  // Populate cart for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images inventory.quantity brand'
  });

  logger.info('Item removed from cart', {
    userId: req.user.id,
    itemId,
    cartTotal: cart.total
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        total: cart.total
      }
    }
  });
});

// Clear entire cart
exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  await cart.clearCart();

  logger.info('Cart cleared', {
    userId: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: {
      cart,
      summary: {
        itemCount: 0,
        subtotal: 0,
        total: 0
      }
    }
  });
});

// Apply coupon to cart
exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  if (cart.items.length === 0) {
    return next(new AppError('Cannot apply coupon to empty cart', 400));
  }

  // Validate coupon (this would typically check a Coupon model)
  // For now, we'll use hardcoded coupons
  const validCoupons = {
    'SAVE10': { discount: 10, type: 'percentage', minOrder: 50 },
    'WELCOME20': { discount: 20, type: 'percentage', minOrder: 100 },
    'FLAT5': { discount: 5, type: 'fixed', minOrder: 25 }
  };

  const coupon = validCoupons[couponCode.toUpperCase()];
  if (!coupon) {
    return next(new AppError('Invalid coupon code', 400));
  }

  if (cart.subtotal < coupon.minOrder) {
    return next(new AppError(`Minimum order value of $${coupon.minOrder} required for this coupon`, 400));
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

  await cart.applyCoupon(couponCode.toUpperCase(), coupon.discount, coupon.type, validUntil);

  // Populate cart for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images inventory.quantity brand'
  });

  logger.info('Coupon applied to cart', {
    userId: req.user.id,
    couponCode,
    discount: coupon.discount,
    cartTotal: cart.total
  });

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        couponDiscount: cart.couponDiscount,
        total: cart.total
      }
    }
  });
});

// Remove coupon from cart
exports.removeCoupon = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  await cart.removeCoupon();

  // Populate cart for response
  await cart.populate({
    path: 'items.product',
    select: 'name price images inventory.quantity brand'
  });

  logger.info('Coupon removed from cart', {
    userId: req.user.id,
    cartTotal: cart.total
  });

  res.status(200).json({
    success: true,
    message: 'Coupon removed',
    data: {
      cart,
      summary: {
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        couponDiscount: 0,
        total: cart.total
      }
    }
  });
});

// Get cart summary
exports.getCartSummary = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id, status: 'active' });
  
  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        itemCount: 0,
        subtotal: 0,
        total: 0,
        isEmpty: true
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      totalSavings: cart.totalSavings,
      couponDiscount: cart.couponDiscount,
      shippingCost: cart.shippingCost,
      taxAmount: cart.taxAmount,
      total: cart.total,
      isEmpty: cart.items.length === 0,
      hasCoupon: !!cart.coupon
    }
  });
});

// Validate cart for checkout
exports.validateCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id, status: 'active' })
    .populate('items.product', 'inventory.quantity inventory.trackQuantity isActive price discount');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  const issues = [];
  let hasChanges = false;

  // Validate each item
  for (let item of cart.items) {
    if (!item.product || !item.product.isActive) {
      issues.push({
        itemId: item._id,
        type: 'unavailable',
        message: 'Product is no longer available'
      });
      continue;
    }

    // Check inventory
    if (item.product.inventory.trackQuantity && 
        item.product.inventory.quantity < item.quantity) {
      issues.push({
        itemId: item._id,
        type: 'insufficient_stock',
        message: `Only ${item.product.inventory.quantity} items available`,
        availableQuantity: item.product.inventory.quantity
      });
    }

    // Check price changes
    const currentPrice = item.product.discount && item.product.discount.isActive ? 
      item.product.discount.discountedPrice : item.product.price;
    
    if (item.price !== currentPrice) {
      issues.push({
        itemId: item._id,
        type: 'price_change',
        message: 'Price has changed',
        oldPrice: item.price,
        newPrice: currentPrice
      });
      
      // Update price automatically
      item.price = currentPrice;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: {
      isValid: issues.length === 0,
      issues,
      cart: hasChanges ? cart : undefined
    }
  });
});

// Save cart for later (move to wishlist)
exports.saveForLater = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  // This would typically move item to wishlist
  // For now, we'll just remove from cart
  await exports.removeFromCart(req, res, next);
});

// Get abandoned carts (Admin only)
exports.getAbandonedCarts = catchAsync(async (req, res, next) => {
  const { hours = 24, page = 1, limit = 20 } = req.query;

  const abandonedCarts = await Cart.getAbandonedCarts(parseInt(hours))
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate({
      path: 'items.product',
      select: 'name price images'
    });

  const total = await Cart.countDocuments({
    status: 'active',
    lastActivity: { $lt: new Date(Date.now() - hours * 60 * 60 * 1000) },
    'items.0': { $exists: true }
  });

  res.status(200).json({
    success: true,
    data: {
      carts: abandonedCarts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = exports;