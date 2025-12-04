const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Address Validation Middleware
 * Validates address operations including creation, updates, and delivery verification
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

// Create address validation
const validateCreateAddress = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
    
  body('addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),
    
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),
    
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
    
  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
    
  body('postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid US postal code (e.g., 12345 or 12345-6789)'),
    
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
    
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
    .withMessage('Please enter a valid US phone number'),
    
  body('addressType')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
    
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean'),
    
  body('deliveryInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Delivery instructions cannot exceed 500 characters'),
    
  body('accessCodes.building')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Building access code cannot exceed 50 characters'),
    
  body('accessCodes.gate')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Gate access code cannot exceed 50 characters'),
    
  body('accessCodes.other')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Other access code cannot exceed 100 characters'),
    
  handleValidationErrors
];

// Update address validation
const validateUpdateAddress = [
  param('id')
    .isMongoId()
    .withMessage('Invalid address ID'),
    
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
    
  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),
    
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters'),
    
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
    
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
    
  body('postalCode')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid US postal code (e.g., 12345 or 12345-6789)'),
    
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
    
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
    .withMessage('Please enter a valid US phone number'),
    
  body('addressType')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
    
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean'),
    
  body('deliveryInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Delivery instructions cannot exceed 500 characters'),
    
  body('accessCodes.building')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Building access code cannot exceed 50 characters'),
    
  body('accessCodes.gate')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Gate access code cannot exceed 50 characters'),
    
  body('accessCodes.other')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Other access code cannot exceed 100 characters'),
    
  handleValidationErrors
];

// Address ID validation
const validateAddressId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid address ID'),
    
  handleValidationErrors
];

// Address type validation
const validateAddressType = [
  param('type')
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
    
  handleValidationErrors
];

// Shipping estimate validation
const validateShippingEstimate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid address ID'),
    
  query('weight')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Weight must be between 0.1 and 100 pounds'),
    
  query('items')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Items count must be between 1 and 50'),
    
  query('orderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order value must be a positive number'),
    
  handleValidationErrors
];

// Address search validation (Admin)
const validateAddressSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('postalCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid US postal code'),
    
  query('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
    
  query('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
    
  query('query')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters'),
    
  handleValidationErrors
];

module.exports = {
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressId,
  validateAddressType,
  validateShippingEstimate,
  validateAddressSearch,
  handleValidationErrors
};