const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const validation = require('../validators/productValidation');

const router = express.Router();

/**
 * Product Routes
 * Handles product CRUD operations, search, and analytics
 */

// Public routes
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/bestsellers', productController.getBestsellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/analytics', authController.protect, authController.restrictTo('admin'), productController.getProductAnalytics);

router.route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect, 
    authController.restrictTo('admin', 'seller'), 
    validation.validateCreateProduct, 
    productController.createProduct
  );

router.route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect, 
    authController.restrictTo('admin', 'seller'), 
    validation.validateUpdateProduct, 
    productController.updateProduct
  )
  .delete(
    authController.protect, 
    authController.restrictTo('admin', 'seller'), 
    productController.deleteProduct
  );

// Stock management
router.patch('/:id/stock', 
  authController.protect, 
  authController.restrictTo('admin', 'seller'), 
  validation.validateInventoryUpdate,
  productController.updateStock
);

// Admin-only routes
router.use(authController.protect, authController.restrictTo('admin'));

router.get('/admin/all', productController.getAllProductsAdmin);
router.get('/admin/:id', productController.getProductAdmin);
router.patch('/admin/:id', productController.updateProductAdmin);
router.delete('/admin/:id', productController.deleteProductAdmin);

module.exports = router;