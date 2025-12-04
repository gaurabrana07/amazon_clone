const { body, param, query } = require('express-validator');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

/**
 * Category Validation Middleware
 * Validates category data for CRUD operations and hierarchy management
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

// Create category validation
const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      // Check for duplicate names at the same level
      const query = { 
        name: new RegExp(`^${value}$`, 'i'),
        parent: req.body.parent || null
      };
      const existingCategory = await Category.findOne(query);
      if (existingCategory) {
        throw new Error('Category name already exists at this level');
      }
      return true;
    }),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
    .custom(async (value) => {
      if (value) {
        const parentCategory = await Category.findById(value);
        if (!parentCategory) {
          throw new Error('Parent category does not exist');
        }
        // Check if parent category depth allows for a child
        if (parentCategory.level >= 3) {
          throw new Error('Maximum category depth (4 levels) would be exceeded');
        }
      }
      return true;
    }),
    
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
    
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon cannot exceed 50 characters'),
    
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('IsActive must be a boolean'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('IsFeatured must be a boolean'),
    
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
    
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
    
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
    
  body('metaKeywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array'),
    
  body('metaKeywords.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each meta keyword must be between 1 and 30 characters'),
    
  handleValidationErrors
];

// Update category validation
const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      if (value) {
        // Check for duplicate names at the same level (excluding current category)
        const currentCategory = await Category.findById(req.params.id);
        if (!currentCategory) {
          throw new Error('Category not found');
        }
        
        const query = { 
          name: new RegExp(`^${value}$`, 'i'),
          parent: currentCategory.parent,
          _id: { $ne: req.params.id }
        };
        
        const existingCategory = await Category.findOne(query);
        if (existingCategory) {
          throw new Error('Category name already exists at this level');
        }
      }
      return true;
    }),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('parent')
    .optional()
    .custom(async (value, { req }) => {
      if (value) {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Invalid parent category ID');
        }
        
        const parentCategory = await Category.findById(value);
        if (!parentCategory) {
          throw new Error('Parent category does not exist');
        }
        
        // Check if parent category depth allows for a child
        if (parentCategory.level >= 3) {
          throw new Error('Maximum category depth (4 levels) would be exceeded');
        }
        
        // Prevent circular reference
        if (value === req.params.id) {
          throw new Error('Category cannot be its own parent');
        }
        
        // Check if the new parent is not a descendant
        const currentCategory = await Category.findById(req.params.id);
        if (currentCategory) {
          const descendants = await Category.find({ 
            path: new RegExp(`^${currentCategory.path}`) 
          });
          
          const descendantIds = descendants.map(cat => cat._id.toString());
          if (descendantIds.includes(value)) {
            throw new Error('Cannot move category to its own descendant');
          }
        }
      }
      return true;
    }),
    
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
    
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon cannot exceed 50 characters'),
    
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('IsActive must be a boolean'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('IsFeatured must be a boolean'),
    
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
    
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
    
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
    
  body('metaKeywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array'),
    
  body('metaKeywords.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each meta keyword must be between 1 and 30 characters'),
    
  handleValidationErrors
];

// Search categories validation
const validateSearchCategories = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('level')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('Level must be between 0 and 3'),
    
  query('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),
    
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
    
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
    
  handleValidationErrors
];

// Reorder categories validation
const validateReorderCategories = [
  body('categories')
    .isArray({ min: 1 })
    .withMessage('Categories array is required and must not be empty'),
    
  body('categories.*.id')
    .isMongoId()
    .withMessage('Each category must have a valid ID'),
    
  body('categories.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Each category must have a valid sort order'),
    
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
    .custom(async (value) => {
      if (value) {
        const parentCategory = await Category.findById(value);
        if (!parentCategory) {
          throw new Error('Parent category does not exist');
        }
      }
      return true;
    }),
    
  handleValidationErrors
];

// Category products validation
const validateCategoryProducts = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
    
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
    
  query('includeSubcategories')
    .optional()
    .isBoolean()
    .withMessage('IncludeSubcategories must be a boolean'),
    
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  handleValidationErrors
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateSearchCategories,
  validateReorderCategories,
  validateCategoryProducts,
  validateObjectId,
  handleValidationErrors
};