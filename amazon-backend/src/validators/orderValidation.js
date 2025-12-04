const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Order Validation Middleware
 * Validates order operations including creation, cancellation, and returns
 */

// Validation middleware to handle errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create order validation
const validateCreateOrder = [
  body('shippingAddressId')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isMongoId()
    .withMessage('Invalid shipping address ID'),
    
  body('billingAddressId')
    .optional()
    .isMongoId()
    .withMessage('Invalid billing address ID'),
    
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'amazon_pay'])
    .withMessage('Invalid payment method'),
    
  body('saveAddress')
    .optional()
    .isBoolean()
    .withMessage('Save address must be a boolean'),
    
  handleValidationErrors
];

// Order ID validation
const validateOrderId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
    
  handleValidationErrors
];

// Return order item validation
const validateReturnOrderItem = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
    
  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),
    
  body('reason')
    .notEmpty()
    .withMessage('Return reason is required')
    .isIn(['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged', 'other'])
    .withMessage('Invalid return reason'),
    
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  handleValidationErrors
];

// Update order status validation (Admin)
const validateUpdateOrderStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
    
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'pending_payment', 'payment_failed', 'confirmed', 'processing',
      'shipped', 'partially_shipped', 'delivered', 'partially_delivered',
      'cancelled', 'refunded', 'partially_refunded', 'returned'
    ])
    .withMessage('Invalid order status'),
    
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters'),
    
  body('carrier')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Carrier name cannot exceed 50 characters'),
    
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
    
  handleValidationErrors
];

// Order search validation
const validateOrderSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('status')
    .optional()
    .isIn([
      'pending_payment', 'payment_failed', 'confirmed', 'processing',
      'shipped', 'partially_shipped', 'delivered', 'partially_delivered',
      'cancelled', 'refunded', 'partially_refunded', 'returned'
    ])
    .withMessage('Invalid order status'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
    
  handleValidationErrors
];

// Order tracking validation
const validateOrderTracking = [
  param('orderNumber')
    .notEmpty()
    .withMessage('Order number is required')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Invalid order number format'),
    
  handleValidationErrors
];

// Cancel order validation
const validateCancelOrder = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
    
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters'),
    
  handleValidationErrors
];

module.exports = {
  validateCreateOrder,
  validateOrderId,
  validateReturnOrderItem,
  validateUpdateOrderStatus,
  validateOrderSearch,
  validateOrderTracking,
  validateCancelOrder,
  handleValidationErrors
};