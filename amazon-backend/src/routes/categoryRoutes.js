const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const validation = require('../validators/categoryValidation');

const router = express.Router();

/**
 * Category Routes
 * Handles category CRUD operations, hierarchy, and navigation
 */

// Public routes
router.get('/search', categoryController.searchCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/:id/breadcrumb', categoryController.getCategoryBreadcrumb);
router.get('/:id/products', categoryController.getCategoryProducts);

router.route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect, 
    authController.restrictTo('admin'), 
    validation.validateCreateCategory, 
    categoryController.createCategory
  );

router.route('/:id')
  .get(categoryController.getCategory)
  .patch(
    authController.protect, 
    authController.restrictTo('admin'), 
    validation.validateUpdateCategory, 
    categoryController.updateCategory
  )
  .delete(
    authController.protect, 
    authController.restrictTo('admin'), 
    categoryController.deleteCategory
  );

// Admin-only routes
router.use(authController.protect, authController.restrictTo('admin'));

router.patch('/reorder', validation.validateReorderCategories, categoryController.reorderCategories);
router.get('/analytics', categoryController.getCategoryAnalytics);

// Admin CRUD routes
router.get('/admin/all', categoryController.getAllCategoriesAdmin);
router.get('/admin/:id', categoryController.getCategoryAdmin);
router.patch('/admin/:id', categoryController.updateCategoryAdmin);
router.delete('/admin/:id', categoryController.deleteCategoryAdmin);

module.exports = router;