const express = require('express');
const addressController = require('../controllers/addressController');
const authController = require('../controllers/authController');
const validation = require('../validators/addressValidation');

const router = express.Router();

/**
 * Address Routes
 * Handles user address management for shipping and billing
 */

// Protect all routes
router.use(authController.protect);

// User address routes
router.route('/')
  .get(addressController.getMyAddresses)
  .post(validation.validateCreateAddress, addressController.createAddress);

router.get('/default', addressController.getDefaultAddress);
router.get('/type/:type', validation.validateAddressType, addressController.getAddressesByType);

router.route('/:id')
  .get(validation.validateAddressId, addressController.getAddress)
  .patch(validation.validateUpdateAddress, addressController.updateAddress)
  .delete(validation.validateAddressId, addressController.deleteAddress);

// Address utility routes
router.patch('/:id/default', validation.validateAddressId, addressController.setDefaultAddress);
router.post('/:id/verify', validation.validateAddressId, addressController.verifyAddress);
router.get('/:id/shipping-estimate', validation.validateAddressId, addressController.getShippingEstimate);
router.post('/:id/validate-delivery', validation.validateAddressId, addressController.validateAddressForDelivery);

// Admin routes
router.get('/admin/search', 
  authController.restrictTo('admin'), 
  addressController.searchAddresses
);

module.exports = router;