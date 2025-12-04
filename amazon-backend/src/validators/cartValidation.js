const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Cart Validation Middleware
 * Validates cart operations including add, update, and coupon application
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

// Add to cart validation
const validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
    
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
    
  body('variant')
    .optional()
    .isObject()
    .withMessage('Variant must be an object'),
    
  body('variant.size')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Size cannot exceed 20 characters'),
    
  body('variant.color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color cannot exceed 30 characters'),
    
  body('variant.style')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Style cannot exceed 30 characters'),
    
  handleValidationErrors
];

// Update cart item validation
const validateUpdateCartItem = [
  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),
    
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Quantity must be between 0 and 50'),
    
  handleValidationErrors
];

// Apply coupon validation
const validateApplyCoupon = [
  body('couponCode')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code must contain only uppercase letters and numbers'),
    
  handleValidationErrors
];

// Cart item ID validation
const validateCartItemId = [
  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),
    
  handleValidationErrors
];

module.exports = {
  validateAddToCart,
  validateUpdateCartItem,
  validateApplyCoupon,
  validateCartItemId,
  handleValidationErrors
};