const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const validation = require('../validators/userValidation');

const router = express.Router();

/**
 * User Routes
 * Handles user profile management and admin operations
 */

// All routes after this middleware are protected
router.use(authController.protect);

// Current user routes
router.get('/me', userController.getMe);
router.patch('/update-me', validation.validateUpdateProfile, userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Address management
router.route('/addresses')
  .get(userController.getAddresses)
  .post(validation.validateAddress, userController.addAddress);

router.route('/addresses/:addressId')
  .patch(validation.validateAddress, userController.updateAddress)
  .delete(userController.deleteAddress);

// Preferences
router.patch('/preferences', validation.validatePreferences, userController.updatePreferences);

// Admin only routes
router.use(authController.restrictTo('admin'));

// User statistics and search
router.get('/stats', userController.getUserStats);
router.get('/search', userController.searchUsers);

// User management
router.patch('/:id/toggle-status', userController.toggleUserStatus);
router.patch('/:id/role', validation.validateRole, userController.updateUserRole);

// CRUD operations
router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;