const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { logger } = require('../utils/logger');

/**
 * Category Controller
 * Handles category CRUD operations, hierarchy management, and navigation
 */

/**
 * @desc    Get all categories with hierarchy
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { tree, parent, featured, level } = req.query;
  
  let categories;
  
  if (tree === 'true') {
    // Get category tree structure
    const parentId = parent || null;
    const maxDepth = req.query.depth ? parseInt(req.query.depth) : 3;
    categories = await Category.getTree(parentId, maxDepth);
  } else if (featured === 'true') {
    // Get featured categories
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    categories = await Category.getFeatured(limit);
  } else {
    // Get flat list of categories
    const filter = { status: 'active', isVisible: true };
    
    if (parent !== undefined) {
      filter.parent = parent === 'null' ? null : parent;
    }
    
    if (level !== undefined) {
      filter.level = parseInt(level);
    }
    
    categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 });
  }
  
  res.status(200).json({
    success: true,
    results: categories.length,
    data: {
      categories
    }
  });
});

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategory = catchAsync(async (req, res, next) => {
  let query;
  
  // Check if parameter is MongoDB ObjectId or slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    query = Category.findById(req.params.id);
  } else {
    query = Category.findOne({ slug: req.params.id });
  }
  
  const category = await query
    .populate('parent', 'name slug path')
    .populate('children');
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  // Get breadcrumb trail
  const breadcrumb = await Category.getBreadcrumb(category._id);
  
  // Get subcategories
  const subcategories = await Category.find({
    parent: category._id,
    status: 'active',
    isVisible: true
  }).sort({ sortOrder: 1, name: 1 });
  
  res.status(200).json({
    success: true,
    data: {
      category,
      breadcrumb,
      subcategories
    }
  });
});

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
exports.createCategory = catchAsync(async (req, res, next) => {
  // Validate parent category if provided
  if (req.body.parent) {
    const parent = await Category.findById(req.body.parent);
    if (!parent) {
      return next(new AppError('Parent category not found', 404));
    }
    
    // Check maximum depth
    if (parent.level >= 4) {
      return next(new AppError('Maximum category depth (5 levels) exceeded', 400));
    }
  }
  
  const category = await Category.create(req.body);
  
  logger.info(`Category created: ${category.name} by ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      category
    }
  });
});

/**
 * @desc    Update category
 * @route   PATCH /api/categories/:id
 * @access  Private (Admin)
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  // Validate parent change to prevent circular references
  if (req.body.parent && req.body.parent !== category.parent?.toString()) {
    if (req.body.parent === category._id.toString()) {
      return next(new AppError('Category cannot be its own parent', 400));
    }
    
    // Check if new parent is a descendant
    const descendants = await category.getDescendants();
    const descendantIds = descendants.map(d => d._id.toString());
    
    if (descendantIds.includes(req.body.parent)) {
      return next(new AppError('Cannot set descendant as parent (circular reference)', 400));
    }
    
    // Check parent exists and depth limit
    const newParent = await Category.findById(req.body.parent);
    if (!newParent) {
      return next(new AppError('Parent category not found', 404));
    }
    
    if (newParent.level >= 4) {
      return next(new AppError('Maximum category depth (5 levels) exceeded', 400));
    }
  }
  
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('parent', 'name slug');
  
  logger.info(`Category updated: ${updatedCategory.name} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: {
      category: updatedCategory
    }
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ 
    category: category._id, 
    status: { $ne: 'deleted' } 
  });
  
  if (productCount > 0) {
    return next(new AppError(`Cannot delete category with ${productCount} products. Please move or delete products first.`, 400));
  }
  
  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parent: category._id });
  
  if (subcategoryCount > 0) {
    return next(new AppError(`Cannot delete category with ${subcategoryCount} subcategories. Please move or delete subcategories first.`, 400));
  }
  
  await Category.findByIdAndDelete(req.params.id);
  
  logger.info(`Category deleted: ${category.name} by ${req.user.email}`);
  
  res.status(204).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * @desc    Search categories
 * @route   GET /api/categories/search
 * @access  Public
 */
exports.searchCategories = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }
  
  const categories = await Category.search(q);
  
  res.status(200).json({
    success: true,
    results: categories.length,
    data: {
      categories,
      searchTerm: q
    }
  });
});

/**
 * @desc    Get category breadcrumb
 * @route   GET /api/categories/:id/breadcrumb
 * @access  Public
 */
exports.getCategoryBreadcrumb = catchAsync(async (req, res, next) => {
  const breadcrumb = await Category.getBreadcrumb(req.params.id);
  
  if (breadcrumb.length === 0) {
    return next(new AppError('Category not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      breadcrumb
    }
  });
});

/**
 * @desc    Get category tree structure
 * @route   GET /api/categories/tree
 * @access  Public
 */
exports.getCategoryTree = catchAsync(async (req, res, next) => {
  const { parent, depth = 3 } = req.query;
  
  const parentId = parent === 'null' || !parent ? null : parent;
  const maxDepth = parseInt(depth);
  
  const tree = await Category.getTree(parentId, maxDepth);
  
  res.status(200).json({
    success: true,
    data: {
      tree
    }
  });
});

/**
 * @desc    Get featured categories
 * @route   GET /api/categories/featured
 * @access  Public
 */
exports.getFeaturedCategories = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const categories = await Category.getFeatured(limit);
  
  res.status(200).json({
    success: true,
    results: categories.length,
    data: {
      categories
    }
  });
});

/**
 * @desc    Get category with products
 * @route   GET /api/categories/:id/products
 * @access  Public
 */
exports.getCategoryProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  // Get all descendant categories to include products from subcategories
  const descendants = await category.getDescendants();
  const categoryIds = [category._id, ...descendants.map(d => d._id)];
  
  const products = await Product.find({
    category: { $in: categoryIds },
    status: 'active'
  })
  .populate('category', 'name slug')
  .sort(sort)
  .skip((page - 1) * limit)
  .limit(parseInt(limit));
  
  const total = await Product.countDocuments({
    category: { $in: categoryIds },
    status: 'active'
  });
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      products
    },
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Update category sort order
 * @route   PATCH /api/categories/reorder
 * @access  Private (Admin)
 */
exports.reorderCategories = catchAsync(async (req, res, next) => {
  const { categories } = req.body;
  
  if (!categories || !Array.isArray(categories)) {
    return next(new AppError('Please provide an array of categories with new order', 400));
  }
  
  // Update sort order for each category
  const updatePromises = categories.map((cat, index) => 
    Category.findByIdAndUpdate(cat.id, { sortOrder: index })
  );
  
  await Promise.all(updatePromises);
  
  logger.info(`Category order updated by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Category order updated successfully'
  });
});

/**
 * @desc    Get category analytics
 * @route   GET /api/categories/analytics
 * @access  Private (Admin)
 */
exports.getCategoryAnalytics = catchAsync(async (req, res, next) => {
  const analytics = await Category.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        featuredCategories: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
        },
        categoriesWithProducts: {
          $sum: { $cond: [{ $gt: ['$productCount', 0] }, 1, 0] }
        },
        averageProductsPerCategory: { $avg: '$productCount' }
      }
    }
  ]);
  
  // Get categories by level
  const levelDistribution = await Category.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Get top categories by product count
  const topCategories = await Category.find({ status: 'active' })
    .sort({ productCount: -1 })
    .limit(10)
    .select('name productCount');
  
  res.status(200).json({
    success: true,
    data: {
      overview: analytics[0] || {},
      levelDistribution,
      topCategories
    }
  });
});

// Admin-only routes using factory functions
exports.getAllCategoriesAdmin = factory.getAll(Category);
exports.getCategoryAdmin = factory.getOne(Category, 'parent children');
exports.updateCategoryAdmin = factory.updateOne(Category);
exports.deleteCategoryAdmin = factory.deleteOne(Category);