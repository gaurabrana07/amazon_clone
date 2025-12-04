const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const { logger } = require('../utils/logger');

/**
 * Product Controller
 * Handles product CRUD operations, search, filtering, and analytics
 */

/**
 * @desc    Get all products with advanced filtering
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Build filter object
  const filter = { status: 'active' };
  
  // Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  // Brand filter
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: 'i' };
  }
  
  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  // Rating filter
  if (req.query.minRating) {
    filter.ratingsAverage = { $gte: parseFloat(req.query.minRating) };
  }
  
  // Availability filter
  if (req.query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }
  
  // Featured filter
  if (req.query.featured === 'true') {
    filter.isFeatured = true;
  }
  
  // Execute query with APIFeatures
  const features = new APIFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  // Add search functionality
  if (req.query.search) {
    features.search(['name', 'description', 'tags']);
  }
  
  const products = await features.query
    .populate('category', 'name slug')
    .populate('vendor', 'firstName lastName');
  
  // Get total count for pagination
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products
    },
    pagination: {
      total,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 20,
      pages: Math.ceil(total / (req.query.limit * 1 || 20))
    }
  });
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = catchAsync(async (req, res, next) => {
  let query;
  
  // Check if parameter is MongoDB ObjectId or slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    query = Product.findById(req.params.id);
  } else {
    query = Product.findOne({ slug: req.params.id });
  }
  
  const product = await query
    .populate('category', 'name slug path')
    .populate('vendor', 'firstName lastName email');
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Increment view count
  await product.incrementViewCount();
  
  // Get related products
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    status: 'active'
  })
  .limit(4)
  .select('name price images ratingsAverage slug');
  
  res.status(200).json({
    success: true,
    data: {
      product,
      relatedProducts
    }
  });
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin/Vendor)
 */
exports.createProduct = catchAsync(async (req, res, next) => {
  // Add vendor information if user is a vendor
  if (req.user.role === 'seller') {
    req.body.vendor = req.user._id;
  }
  
  // Validate category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  const product = await Product.create(req.body);
  
  // Update category product count
  await category.updateProductCount();
  
  logger.info(`Product created: ${product.name} by ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product
    }
  });
});

/**
 * @desc    Update product
 * @route   PATCH /api/products/:id
 * @access  Private (Admin/Vendor)
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Check if user owns the product (for vendors)
  if (req.user.role === 'seller' && product.vendor.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own products', 403));
  }
  
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('category', 'name slug');
  
  logger.info(`Product updated: ${updatedProduct.name} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product: updatedProduct
    }
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin/Vendor)
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Check if user owns the product (for vendors)
  if (req.user.role === 'seller' && product.vendor.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own products', 403));
  }
  
  await Product.findByIdAndDelete(req.params.id);
  
  // Update category product count
  const category = await Category.findById(product.category);
  if (category) {
    await category.updateProductCount();
  }
  
  logger.info(`Product deleted: ${product.name} by ${req.user.email}`);
  
  res.status(204).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q, category, brand, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
  
  if (!q) {
    return next(new AppError('Search query is required', 400));
  }
  
  // Build search query
  const searchQuery = {
    $text: { $search: q },
    status: 'active'
  };
  
  // Add filters
  if (category) searchQuery.category = category;
  if (brand) searchQuery.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
    if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
  }
  
  // Build sort criteria
  let sortCriteria = { score: { $meta: 'textScore' } };
  if (sort) {
    switch (sort) {
      case 'price-low':
        sortCriteria = { price: 1 };
        break;
      case 'price-high':
        sortCriteria = { price: -1 };
        break;
      case 'rating':
        sortCriteria = { ratingsAverage: -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'popular':
        sortCriteria = { salesCount: -1 };
        break;
    }
  }
  
  const products = await Product.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('category', 'name slug')
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  const total = await Product.countDocuments(searchQuery);
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products,
      searchTerm: q
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
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const products = await Product.getFeatured(limit);
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products
    }
  });
});

/**
 * @desc    Get bestselling products
 * @route   GET /api/products/bestsellers
 * @access  Public
 */
exports.getBestsellers = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const products = await Product.getBestsellers(limit);
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products
    }
  });
});

/**
 * @desc    Get new arrival products
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
exports.getNewArrivals = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const products = await Product.getNewArrivals(limit);
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products
    }
  });
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  const products = await Product.findByCategory(categoryId, {
    sort,
    limit: parseInt(limit),
    skip: (page - 1) * limit
  });
  
  const total = await Product.countDocuments({ 
    category: categoryId, 
    status: 'active' 
  });
  
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug
      }
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
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Admin/Vendor)
 */
exports.updateStock = catchAsync(async (req, res, next) => {
  const { quantity, operation = 'set' } = req.body;
  
  if (!quantity || quantity < 0) {
    return next(new AppError('Please provide a valid quantity', 400));
  }
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Check permissions
  if (req.user.role === 'seller' && product.vendor.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update stock for your own products', 403));
  }
  
  if (operation === 'set') {
    product.stock = quantity;
  } else if (operation === 'add') {
    product.stock += quantity;
  } else if (operation === 'subtract') {
    product.stock = Math.max(0, product.stock - quantity);
  }
  
  await product.save();
  
  logger.info(`Stock updated for product ${product.name}: ${product.stock} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        stockStatus: product.stockStatus
      }
    }
  });
});

/**
 * @desc    Get product analytics
 * @route   GET /api/products/analytics
 * @access  Private (Admin)
 */
exports.getProductAnalytics = catchAsync(async (req, res, next) => {
  const analytics = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        averagePrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' },
        lowStockProducts: {
          $sum: { $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0] }
        },
        outOfStockProducts: {
          $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
        }
      }
    }
  ]);
  
  // Get top categories
  const topCategories = await Product.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        productCount: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    }
  ]);
  
  // Get top brands
  const topBrands = await Product.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$brand',
        productCount: { $sum: 1 },
        averageRating: { $avg: '$ratingsAverage' }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      overview: analytics[0] || {},
      topCategories,
      topBrands
    }
  });
});

// Admin-only routes using factory functions
exports.getAllProductsAdmin = factory.getAll(Product);
exports.getProductAdmin = factory.getOne(Product, 'category vendor');
exports.updateProductAdmin = factory.updateOne(Product);
exports.deleteProductAdmin = factory.deleteOne(Product);