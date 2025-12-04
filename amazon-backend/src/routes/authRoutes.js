const express = require('express');
const authController = require('../controllers/authController');
const validation = require('../validators/authValidation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

/**
 * Authentication Routes
 * Handles user authentication, registration, password management
 */

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  }
});

// Public routes
router.post('/register', validation.validateRegister, authController.register);
router.post('/login', authLimiter, validation.validateLogin, authController.login);
router.post('/logout', authController.logout);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', validation.validateEmail, authController.resendEmailVerification);

// Password management
router.post('/forgot-password', passwordLimiter, validation.validateEmail, authController.forgotPassword);
router.patch('/reset-password/:token', validation.validateResetPassword, authController.resetPassword);

// Token management
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.use(authController.protect);

router.patch('/update-password', validation.validateUpdatePassword, authController.updatePassword);
router.get('/me', authController.getMe);

module.exports = router;