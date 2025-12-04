const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PaymentMethod, PaymentTransaction } = require('../models/Payment');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const notificationService = require('../services/notificationService');

/**
 * Payment Controller
 * Handles all payment-related operations including Stripe integration
 */

/**
 * Create payment intent for order
 */
const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { orderId, paymentMethodId, savePaymentMethod = false } = req.body;
  const userId = req.user.id;

  // Get order
  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Verify order belongs to user
  if (order.user._id.toString() !== userId) {
    return next(new AppError('You can only pay for your own orders', 403));
  }

  // Check if order is already paid
  if (order.paymentStatus === 'completed') {
    return next(new AppError('Order is already paid', 400));
  }

  try {
    // Get or create Stripe customer
    let stripeCustomer;
    if (req.user.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: userId }
      });
      
      // Save stripe customer ID to user
      await req.user.updateOne({ stripeCustomerId: stripeCustomer.id });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.pricing.total * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomer.id,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/order-confirmation/${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId
      }
    });

    // Save payment method if requested
    if (savePaymentMethod && paymentMethodId) {
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      await PaymentMethod.create({
        user: userId,
        stripePaymentMethodId: paymentMethodId,
        type: stripePaymentMethod.type,
        cardDetails: stripePaymentMethod.card ? {
          brand: stripePaymentMethod.card.brand,
          last4: stripePaymentMethod.card.last4,
          expMonth: stripePaymentMethod.card.exp_month,
          expYear: stripePaymentMethod.card.exp_year
        } : undefined,
        isDefault: false
      });
    }

    // Create payment transaction record
    const paymentTransaction = await PaymentTransaction.create({
      user: userId,
      order: order._id,
      amount: order.totalAmount,
      currency: 'USD',
      provider: 'stripe',
      providerTransactionId: paymentIntent.id,
      paymentMethod: paymentMethodId ? {
        type: 'stored_card',
        details: { stripePaymentMethodId: paymentMethodId }
      } : undefined,
      status: 'pending',
      metadata: {
        stripeCustomerId: stripeCustomer.id,
        paymentIntentId: paymentIntent.id
      }
    });

    // Update order with payment transaction
    order.paymentTransaction = paymentTransaction._id;
    await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status
        },
        paymentTransaction: paymentTransaction._id,
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action
      }
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return next(new AppError('Failed to create payment intent', 500));
  }
});

/**
 * Confirm payment intent
 */
const confirmPaymentIntent = catchAsync(async (req, res, next) => {
  const { paymentIntentId } = req.body;
  const userId = req.user.id;

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return next(new AppError('Payment intent not found', 404));
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      providerTransactionId: paymentIntentId
    }).populate('order');

    if (!paymentTransaction) {
      return next(new AppError('Payment transaction not found', 404));
    }

    // Verify ownership
    if (paymentTransaction.user.toString() !== userId) {
      return next(new AppError('Unauthorized', 403));
    }

    // Update payment transaction based on Stripe status
    switch (paymentIntent.status) {
      case 'succeeded':
        paymentTransaction.status = 'completed';
        paymentTransaction.completedAt = new Date();
        paymentTransaction.providerResponse = paymentIntent;
        
        // Update order payment status
        if (paymentTransaction.order) {
          paymentTransaction.order.paymentStatus = 'completed';
          paymentTransaction.order.paidAt = new Date();
          await paymentTransaction.order.save();
          
          // Send payment confirmation notification
          await notificationService.sendPaymentConfirmation(
            userId, 
            paymentTransaction
          );
        }
        break;
        
      case 'requires_action':
        paymentTransaction.status = 'requires_action';
        break;
        
      case 'requires_payment_method':
        paymentTransaction.status = 'failed';
        paymentTransaction.failureReason = 'Payment method failed';
        break;
        
      default:
        paymentTransaction.status = 'pending';
    }

    await paymentTransaction.save();

    res.status(200).json({
      status: 'success',
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        },
        paymentTransaction,
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action
      }
    });

  } catch (error) {
    console.error('Payment confirmation failed:', error);
    return next(new AppError('Failed to confirm payment', 500));
  }
});

/**
 * Handle Stripe webhooks
 */
const handleStripeWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
      
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event.data.object);
      break;
      
    case 'charge.dispute.created':
      await handleChargeDispute(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Handle successful payment intent
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const paymentTransaction = await PaymentTransaction.findOne({
    providerTransactionId: paymentIntent.id
  }).populate('order user');

  if (paymentTransaction) {
    paymentTransaction.status = 'completed';
    paymentTransaction.completedAt = new Date();
    paymentTransaction.providerResponse = paymentIntent;
    await paymentTransaction.save();

    // Update order
    if (paymentTransaction.order) {
      paymentTransaction.order.paymentStatus = 'completed';
      paymentTransaction.order.paidAt = new Date();
      await paymentTransaction.order.save();
    }

    // Send notification
    if (paymentTransaction.user) {
      await notificationService.sendPaymentConfirmation(
        paymentTransaction.user._id, 
        paymentTransaction
      );
    }
  }
};

/**
 * Handle failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  const paymentTransaction = await PaymentTransaction.findOne({
    providerTransactionId: paymentIntent.id
  });

  if (paymentTransaction) {
    paymentTransaction.status = 'failed';
    paymentTransaction.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    paymentTransaction.providerResponse = paymentIntent;
    await paymentTransaction.save();
  }
};

/**
 * Handle payment method attached
 */
const handlePaymentMethodAttached = async (paymentMethod) => {
  // Update payment method in database if it exists
  const savedPaymentMethod = await PaymentMethod.findOne({
    stripePaymentMethodId: paymentMethod.id
  });

  if (savedPaymentMethod) {
    savedPaymentMethod.isActive = true;
    await savedPaymentMethod.save();
  }
};

/**
 * Handle charge dispute
 */
const handleChargeDispute = async (dispute) => {
  // Find related payment transaction
  const paymentTransaction = await PaymentTransaction.findOne({
    'providerResponse.charges.data.id': dispute.charge
  });

  if (paymentTransaction) {
    paymentTransaction.status = 'disputed';
    paymentTransaction.disputeDetails = {
      disputeId: dispute.id,
      reason: dispute.reason,
      amount: dispute.amount / 100,
      createdAt: new Date(dispute.created * 1000)
    };
    await paymentTransaction.save();
  }
};

/**
 * Create refund
 */
const createRefund = catchAsync(async (req, res, next) => {
  const { transactionId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.user.id;

  // Get payment transaction
  const paymentTransaction = await PaymentTransaction.findById(transactionId)
    .populate('order user');

  if (!paymentTransaction) {
    return next(new AppError('Payment transaction not found', 404));
  }

  // Verify ownership (user or admin)
  if (paymentTransaction.user._id.toString() !== userId && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized', 403));
  }

  // Check if payment is completed
  if (paymentTransaction.status !== 'completed') {
    return next(new AppError('Can only refund completed payments', 400));
  }

  try {
    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentTransaction.providerTransactionId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents or full refund
      reason: reason || 'requested_by_customer',
      metadata: {
        transactionId: transactionId,
        userId: userId
      }
    });

    // Process refund in payment transaction
    const refundAmount = amount || paymentTransaction.amount;
    await paymentTransaction.processRefund(refundAmount, reason, {
      stripeRefundId: refund.id,
      stripeRefund: refund
    });

    res.status(200).json({
      status: 'success',
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        },
        paymentTransaction
      }
    });

  } catch (error) {
    console.error('Refund creation failed:', error);
    return next(new AppError('Failed to create refund', 500));
  }
});

/**
 * Get saved payment methods
 */
const getPaymentMethods = catchAsync(async (req, res, next) => {
  const paymentMethods = await PaymentMethod.find({ 
    user: req.user.id, 
    isActive: true 
  }).sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: paymentMethods.length,
    data: { paymentMethods }
  });
});

/**
 * Add payment method
 */
const addPaymentMethod = catchAsync(async (req, res, next) => {
  const { stripePaymentMethodId, setAsDefault = false } = req.body;
  const userId = req.user.id;

  try {
    // Get Stripe customer
    let stripeCustomer;
    if (req.user.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: userId }
      });
      
      await req.user.updateOne({ stripeCustomerId: stripeCustomer.id });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(stripePaymentMethodId, {
      customer: stripeCustomer.id
    });

    // Get payment method details
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    // If setting as default, remove default from other methods
    if (setAsDefault) {
      await PaymentMethod.updateMany(
        { user: userId },
        { isDefault: false }
      );
    }

    // Create payment method record
    const paymentMethod = await PaymentMethod.create({
      user: userId,
      stripePaymentMethodId,
      type: stripePaymentMethod.type,
      cardDetails: stripePaymentMethod.card ? {
        brand: stripePaymentMethod.card.brand,
        last4: stripePaymentMethod.card.last4,
        expMonth: stripePaymentMethod.card.exp_month,
        expYear: stripePaymentMethod.card.exp_year
      } : undefined,
      isDefault: setAsDefault
    });

    res.status(201).json({
      status: 'success',
      data: { paymentMethod }
    });

  } catch (error) {
    console.error('Add payment method failed:', error);
    return next(new AppError('Failed to add payment method', 500));
  }
});

/**
 * Remove payment method
 */
const removePaymentMethod = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const paymentMethod = await PaymentMethod.findOne({ 
    _id: id, 
    user: userId 
  });

  if (!paymentMethod) {
    return next(new AppError('Payment method not found', 404));
  }

  try {
    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

    // Remove from database
    await paymentMethod.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    console.error('Remove payment method failed:', error);
    return next(new AppError('Failed to remove payment method', 500));
  }
});

/**
 * Set default payment method
 */
const setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Remove default from all methods
  await PaymentMethod.updateMany(
    { user: userId },
    { isDefault: false }
  );

  // Set new default
  const paymentMethod = await PaymentMethod.findOneAndUpdate(
    { _id: id, user: userId },
    { isDefault: true },
    { new: true }
  );

  if (!paymentMethod) {
    return next(new AppError('Payment method not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { paymentMethod }
  });
});

/**
 * Get payment transaction details
 */
const getPaymentTransaction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const paymentTransaction = await PaymentTransaction.findOne({
    _id: id,
    user: userId
  }).populate('order');

  if (!paymentTransaction) {
    return next(new AppError('Payment transaction not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { paymentTransaction }
  });
});

/**
 * Get user's payment history
 */
const getPaymentHistory = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const paymentTransactions = await PaymentTransaction.find({ user: userId })
    .populate('order', 'orderNumber totalAmount createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PaymentTransaction.countDocuments({ user: userId });

  res.status(200).json({
    status: 'success',
    results: paymentTransactions.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: { paymentTransactions }
  });
});

/**
 * Get payment analytics (admin only)
 */
const getPaymentAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, period = 'day' } = req.query;

  const analytics = await PaymentTransaction.getAnalytics(
    new Date(startDate),
    new Date(endDate),
    period
  );

  res.status(200).json({
    status: 'success',
    data: { analytics }
  });
});

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  handleStripeWebhook,
  createRefund,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentTransaction,
  getPaymentHistory,
  getPaymentAnalytics,
  
  // Factory methods for CRUD operations
  getAllPaymentTransactions: factory.getAll(PaymentTransaction),
  updatePaymentTransaction: factory.updateOne(PaymentTransaction),
  deletePaymentTransaction: factory.deleteOne(PaymentTransaction)
};