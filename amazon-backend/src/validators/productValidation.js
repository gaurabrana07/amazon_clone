const { body, param, query } = require('express-validator');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

/**
 * Product Validation Middleware
 * Validates product data for CRUD operations
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

// Create product validation
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
    
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID')
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category) {
        throw new Error('Category does not exist');
      }
      return true;
    }),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
    
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
    
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
    
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
    
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
    
  body('inventory.trackQuantity')
    .optional()
    .isBoolean()
    .withMessage('Track quantity must be a boolean'),
    
  body('shipping.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
    
  body('shipping.dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
    
  body('shipping.dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
    
  body('shipping.dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
    
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
    
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
    
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
    
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
    
  handleValidationErrors
];

// Update product validation
const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
    
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID')
    .custom(async (value) => {
      if (value) {
        const category = await Category.findById(value);
        if (!category) {
          throw new Error('Category does not exist');
        }
      }
      return true;
    }),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
    
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
    
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
    
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
    
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
    
  body('inventory.trackQuantity')
    .optional()
    .isBoolean()
    .withMessage('Track quantity must be a boolean'),
    
  body('shipping.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
    
  body('shipping.dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
    
  body('shipping.dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
    
  body('shipping.dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
    
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
    
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
    
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
    
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
    
  handleValidationErrors
];

// Search product validation
const validateSearchProducts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .isIn(['price', '-price', 'createdAt', '-createdAt', 'name', '-name', 'rating', '-rating'])
    .withMessage('Invalid sort option'),
    
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
    
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
    
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
    
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('InStock must be a boolean'),
    
  handleValidationErrors
];

// Product review validation
const validateProductReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
    
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
    
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters'),
    
  handleValidationErrors
];

// Inventory update validation
const validateInventoryUpdate = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
    
  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['set', 'increment', 'decrement'])
    .withMessage('Operation must be set, increment, or decrement'),
    
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
    
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
    
  handleValidationErrors
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateSearchProducts,
  validateProductReview,
  validateInventoryUpdate,
  validateObjectId,
  handleValidationErrors
};