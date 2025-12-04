const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

/**
 * Order Controller
 * Handles order creation, management, and tracking
 */

// Create order from cart
exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddressId, billingAddressId, paymentMethod, saveAddress = false } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id, status: 'active' })
    .populate('items.product', 'name description brand model images specifications inventory.quantity inventory.trackQuantity isActive');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  // Validate cart items
  for (let item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return next(new AppError(`Product ${item.product?.name || 'unknown'} is no longer available`, 400));
    }

    if (item.product.inventory.trackQuantity && item.product.inventory.quantity < item.quantity) {
      return next(new AppError(`Insufficient stock for ${item.product.name}. Only ${item.product.inventory.quantity} available`, 400));
    }
  }

  // Get addresses
  const shippingAddress = await Address.findById(shippingAddressId);
  const billingAddress = billingAddressId ? 
    await Address.findById(billingAddressId) : shippingAddress;

  if (!shippingAddress) {
    return next(new AppError('Shipping address not found', 404));
  }

  if (shippingAddress.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  // Create order data
  const orderData = {
    user: req.user.id,
    items: cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: {
        name: item.product.name,
        description: item.product.description,
        brand: item.product.brand,
        model: item.product.model,
        images: item.product.images,
        specifications: item.product.specifications
      },
      quantity: item.quantity,
      variant: item.variant,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      itemTotal: item.itemTotal
    })),
    pricing: {
      subtotal: cart.subtotal,
      couponDiscount: cart.couponDiscount,
      shippingCost: cart.shippingCost,
      taxAmount: cart.taxAmount,
      total: cart.total
    },
    coupon: cart.coupon,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      phoneNumber: shippingAddress.phoneNumber,
      addressType: shippingAddress.addressType
    },
    billingAddress: {
      fullName: billingAddress.fullName,
      addressLine1: billingAddress.addressLine1,
      addressLine2: billingAddress.addressLine2,
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: billingAddress.postalCode,
      country: billingAddress.country,
      phoneNumber: billingAddress.phoneNumber,
      addressType: billingAddress.addressType
    },
    payment: {
      method: paymentMethod,
      provider: 'stripe', // Default provider
      amount: cart.total,
      status: 'pending'
    },
    analytics: {
      source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
      device: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      conversionTime: Date.now() - new Date(cart.createdAt).getTime()
    },
    metadata: {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionID
    }
  };

  // Create order
  const order = new Order(orderData);
  await order.save();

  // Reserve inventory
  for (let item of cart.items) {
    if (item.product.inventory.trackQuantity) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }
  }

  // Update cart status
  cart.status = 'converted';
  await cart.save();

  logger.info('Order created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: req.user.id,
    total: order.pricing.total,
    itemCount: order.items.length
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.pricing.total,
        estimatedDelivery: order.shipping.estimatedDelivery,
        items: order.items.length
      }
    }
  });
});

// Get user's orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { user: req.user.id };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('items.product', 'name images brand')
    .sort({ placedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('items.product', 'name images brand model')
    .populate('user', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized access to order', 403));
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
});

// Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized access to order', 403));
  }

  if (!order.canBeCancelled) {
    return next(new AppError('Order cannot be cancelled in current status', 400));
  }

  // Restore inventory
  for (let item of order.items) {
    const product = await Product.findById(item.product);
    if (product && product.inventory.trackQuantity) {
      product.inventory.quantity += item.quantity;
      await product.save();
    }
  }

  await order.cancelOrder(reason);

  logger.info('Order cancelled', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: req.user.id,
    reason
  });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

// Track order (public route - allows tracking with just order number)
exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .populate('items.product', 'name images');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // If user is authenticated, verify ownership (skip for public tracking)
  if (req.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized access to order', 403));
  }

  const trackingInfo = {
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.placedAt,
    confirmedAt: order.confirmedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    estimatedDelivery: order.shipping.estimatedDelivery,
    carrier: order.shipping.carrier,
    items: order.items.map(item => ({
      name: item.productSnapshot.name,
      quantity: item.quantity,
      status: item.status,
      tracking: item.tracking
    }))
  };

  res.status(200).json({
    success: true,
    data: { tracking: trackingInfo }
  });
});

// Return order item
exports.returnOrderItem = catchAsync(async (req, res, next) => {
  const { id, itemId } = req.params;
  const { reason, quantity } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  if (order.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to order', 403));
  }

  const item = order.items.id(itemId);
  if (!item) {
    return next(new AppError('Order item not found', 404));
  }

  if (item.status !== 'delivered') {
    return next(new AppError('Item must be delivered before return', 400));
  }

  // Check return window (30 days)
  const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  if (Date.now() - new Date(order.deliveredAt).getTime() > returnWindow) {
    return next(new AppError('Return window has expired', 400));
  }

  // Create return request
  const returnRequest = {
    items: [{
      orderItem: itemId,
      quantity: quantity || item.quantity,
      reason
    }],
    reason,
    status: 'requested',
    requestedAt: new Date(),
    refundAmount: (item.price * (quantity || item.quantity))
  };

  if (!order.returns) {
    order.returns = [];
  }
  order.returns.push(returnRequest);

  await order.save();

  logger.info('Return requested', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    itemId,
    reason,
    quantity
  });

  res.status(200).json({
    success: true,
    message: 'Return request submitted successfully',
    data: { returnRequest }
  });
});

// Admin: Get all orders
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { 'shippingAddress.fullName': new RegExp(search, 'i') }
    ];
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name images brand')
    .sort({ placedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Admin: Update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier, estimatedDelivery } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const oldStatus = order.status;
  order.status = status;

  // Handle status-specific updates
  switch (status) {
    case 'confirmed':
      order.confirmedAt = new Date();
      break;
    case 'shipped':
      order.shippedAt = new Date();
      if (carrier) order.shipping.carrier = carrier;
      if (estimatedDelivery) order.shipping.estimatedDelivery = new Date(estimatedDelivery);
      if (trackingNumber) {
        order.items.forEach(item => {
          item.tracking.trackingNumber = trackingNumber;
          item.tracking.carrier = carrier;
          item.status = 'shipped';
        });
      }
      break;
    case 'delivered':
      order.deliveredAt = new Date();
      order.shipping.actualDelivery = new Date();
      order.items.forEach(item => {
        item.status = 'delivered';
        if (item.tracking) {
          item.tracking.actualDelivery = new Date();
        }
      });
      break;
  }

  await order.save();

  logger.info('Order status updated', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    oldStatus,
    newStatus: status,
    updatedBy: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// Admin: Get order analytics
exports.getOrderAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, period = 'daily' } = req.query;

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Sales analytics
  const salesData = await Order.getSalesAnalytics(start, end);

  // Order status distribution
  const statusDistribution = await Order.aggregate([
    {
      $match: {
        placedAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.total' }
      }
    }
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: { placedAt: { $gte: start, $lte: end } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.itemTotal' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: { start, end },
      salesData,
      statusDistribution,
      topProducts,
      summary: {
        totalOrders: salesData.reduce((sum, day) => sum + day.totalOrders, 0),
        totalRevenue: salesData.reduce((sum, day) => sum + day.totalRevenue, 0),
        averageOrderValue: salesData.length > 0 ? 
          salesData.reduce((sum, day) => sum + day.averageOrderValue, 0) / salesData.length : 0
      }
    }
  });
});

module.exports = exports;