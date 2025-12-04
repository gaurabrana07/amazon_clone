const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const validation = require('../validators/orderValidation');

const router = express.Router();

/**
 * Order Routes
 * Handles order creation, management, and tracking
 */

// Public route for order tracking
router.get('/track/:orderNumber', orderController.trackOrder);

// Protect all other routes
router.use(authController.protect);

// Customer order routes
router.route('/')
  .get(orderController.getMyOrders)
  .post(validation.validateCreateOrder, orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrder)
  .delete(validation.validateOrderId, orderController.cancelOrder);

// Order item management
router.post('/:id/items/:itemId/return', 
  validation.validateReturnOrderItem, 
  orderController.returnOrderItem
);

// Admin routes
router.use(authController.restrictTo('admin'));

router.get('/admin/all', orderController.getAllOrders);
router.patch('/admin/:id/status', 
  validation.validateUpdateOrderStatus, 
  orderController.updateOrderStatus
);
router.get('/admin/analytics', orderController.getOrderAnalytics);

module.exports = router;