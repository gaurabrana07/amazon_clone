const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');
const validation = require('../validators/cartValidation');

const router = express.Router();

/**
 * Cart Routes
 * All cart routes require authentication
 */

// Protect all cart routes
router.use(authController.protect);

// Cart management routes
router.route('/')
  .get(cartController.getCart)
  .delete(cartController.clearCart);

router.get('/summary', cartController.getCartSummary);
router.post('/validate', cartController.validateCart);

// Cart item management
router.post('/items', validation.validateAddToCart, cartController.addToCart);
router.patch('/items/:itemId', validation.validateUpdateCartItem, cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.post('/items/:itemId/save-later', cartController.saveForLater);

// Coupon management
router.post('/coupon', validation.validateApplyCoupon, cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

// Admin routes for abandoned carts
router.get('/abandoned', 
  authController.restrictTo('admin'), 
  cartController.getAbandonedCarts
);

module.exports = router;