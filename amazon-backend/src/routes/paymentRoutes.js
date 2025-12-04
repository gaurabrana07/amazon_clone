const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');
const { validatePaymentIntent, validateRefund, validatePaymentMethod } = require('../validators/paymentValidator');

const router = express.Router();

// Stripe webhook (must be before auth middleware)
router.post('/webhook/stripe', 
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

// Protect all routes after this middleware
router.use(authController.protect);

/**
 * Payment Intent Routes
 */
router.post('/payment-intent', 
  validatePaymentIntent,
  paymentController.createPaymentIntent
);

router.post('/payment-intent/confirm', 
  paymentController.confirmPaymentIntent
);

/**
 * Payment Method Routes
 */
router.route('/payment-methods')
  .get(paymentController.getPaymentMethods)
  .post(validatePaymentMethod, paymentController.addPaymentMethod);

router.route('/payment-methods/:id')
  .delete(paymentController.removePaymentMethod);

router.patch('/payment-methods/:id/default',
  paymentController.setDefaultPaymentMethod
);

/**
 * Payment Transaction Routes
 */
router.get('/transactions',
  paymentController.getPaymentHistory
);

router.get('/transactions/:id',
  paymentController.getPaymentTransaction
);

router.post('/transactions/:id/refund',
  validateRefund,
  paymentController.createRefund
);

/**
 * Admin Routes
 */
router.use(authController.restrictTo('admin'));

router.get('/analytics',
  paymentController.getPaymentAnalytics
);

router.route('/admin/transactions')
  .get(paymentController.getAllPaymentTransactions);

router.route('/admin/transactions/:id')
  .patch(paymentController.updatePaymentTransaction)
  .delete(paymentController.deletePaymentTransaction);

module.exports = router;