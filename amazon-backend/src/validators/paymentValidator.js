const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Payment Validators
 * Validates payment-related request data
 */

/**
 * Validate payment intent creation
 */
const validatePaymentIntent = (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('Valid order ID is required'),
    
    paymentMethodId: Joi.string()
      .optional()
      .pattern(/^pm_[a-zA-Z0-9]+$/)
      .message('Invalid Stripe payment method ID'),
    
    savePaymentMethod: Joi.boolean()
      .optional()
      .default(false),
    
    useStoredPaymentMethod: Joi.boolean()
      .optional()
      .default(false),
    
    metadata: Joi.object()
      .optional()
      .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate payment confirmation
 */
const validatePaymentConfirmation = (req, res, next) => {
  const schema = Joi.object({
    paymentIntentId: Joi.string()
      .required()
      .pattern(/^pi_[a-zA-Z0-9]+$/)
      .message('Valid Stripe payment intent ID is required'),
    
    paymentMethodId: Joi.string()
      .optional()
      .pattern(/^pm_[a-zA-Z0-9]+$/)
      .message('Invalid Stripe payment method ID')
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate refund request
 */
const validateRefund = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'number.precision': 'Amount can have maximum 2 decimal places'
      }),
    
    reason: Joi.string()
      .valid(
        'duplicate',
        'fraudulent', 
        'requested_by_customer',
        'expired_uncaptured_charge',
        'other'
      )
      .optional()
      .default('requested_by_customer'),
    
    description: Joi.string()
      .max(500)
      .optional(),
    
    metadata: Joi.object()
      .optional()
      .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate payment method addition
 */
const validatePaymentMethod = (req, res, next) => {
  const schema = Joi.object({
    stripePaymentMethodId: Joi.string()
      .required()
      .pattern(/^pm_[a-zA-Z0-9]+$/)
      .message('Valid Stripe payment method ID is required'),
    
    setAsDefault: Joi.boolean()
      .optional()
      .default(false),
    
    nickname: Joi.string()
      .max(50)
      .optional()
      .trim(),
    
    billingAddress: Joi.object({
      line1: Joi.string().max(100).optional(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      postal_code: Joi.string().max(20).optional(),
      country: Joi.string().length(2).optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate payment method update
 */
const validatePaymentMethodUpdate = (req, res, next) => {
  const schema = Joi.object({
    nickname: Joi.string()
      .max(50)
      .optional()
      .trim(),
    
    isDefault: Joi.boolean()
      .optional(),
    
    billingAddress: Joi.object({
      line1: Joi.string().max(100).optional(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      postal_code: Joi.string().max(20).optional(),
      country: Joi.string().length(2).optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

/**
 * Validate payment analytics request
 */
const validatePaymentAnalytics = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'date.iso': 'Start date must be in ISO format'
      }),
    
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref('startDate'))
      .required()
      .messages({
        'date.base': 'End date must be a valid date',
        'date.iso': 'End date must be in ISO format',
        'date.greater': 'End date must be after start date'
      }),
    
    period: Joi.string()
      .valid('hour', 'day', 'week', 'month')
      .optional()
      .default('day'),
    
    provider: Joi.string()
      .valid('stripe', 'paypal', 'apple_pay', 'google_pay')
      .optional(),
    
    status: Joi.string()
      .valid('pending', 'completed', 'failed', 'cancelled', 'refunded')
      .optional(),
    
    currency: Joi.string()
      .length(3)
      .uppercase()
      .optional(),
    
    groupBy: Joi.array()
      .items(Joi.string().valid('provider', 'status', 'currency', 'date'))
      .optional()
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.query = value;
  next();
};

/**
 * Validate webhook signature (Stripe)
 */
const validateStripeWebhook = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return next(new AppError('Missing Stripe signature', 400));
  }

  // The actual signature verification is done in the controller
  // This just ensures the header is present
  next();
};

/**
 * Validate payment search/filter parameters
 */
const validatePaymentFilters = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'completed', 'failed', 'cancelled', 'refunded')
      .optional(),
    
    provider: Joi.string()
      .valid('stripe', 'paypal', 'apple_pay', 'google_pay')
      .optional(),
    
    currency: Joi.string()
      .length(3)
      .uppercase()
      .optional(),
    
    minAmount: Joi.number()
      .positive()
      .precision(2)
      .optional(),
    
    maxAmount: Joi.number()
      .positive()
      .precision(2)
      .greater(Joi.ref('minAmount'))
      .optional(),
    
    startDate: Joi.date()
      .iso()
      .optional(),
    
    endDate: Joi.date()
      .iso()
      .greater(Joi.ref('startDate'))
      .optional(),
    
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    
    orderId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10),
    
    sort: Joi.string()
      .valid('createdAt', '-createdAt', 'amount', '-amount', 'status')
      .optional()
      .default('-createdAt')
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.query = value;
  next();
};

/**
 * Validate payment dispute/chargeback data
 */
const validateDispute = (req, res, next) => {
  const schema = Joi.object({
    disputeId: Joi.string()
      .required(),
    
    reason: Joi.string()
      .valid(
        'credit_not_processed',
        'duplicate',
        'fraudulent',
        'merchandise_not_received',
        'not_received',
        'other',
        'processing_error',
        'product_not_received',
        'product_unacceptable',
        'subscription_canceled',
        'unrecognized'
      )
      .required(),
    
    amount: Joi.number()
      .positive()
      .precision(2)
      .required(),
    
    currency: Joi.string()
      .length(3)
      .uppercase()
      .required(),
    
    evidence: Joi.object()
      .optional(),
    
    metadata: Joi.object()
      .optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  req.body = value;
  next();
};

module.exports = {
  validatePaymentIntent,
  validatePaymentConfirmation,
  validateRefund,
  validatePaymentMethod,
  validatePaymentMethodUpdate,
  validatePaymentAnalytics,
  validateStripeWebhook,
  validatePaymentFilters,
  validateDispute
};