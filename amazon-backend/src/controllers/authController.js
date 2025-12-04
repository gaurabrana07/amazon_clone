const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
// const Email = require('../services/emailService'); // Temporarily disabled
const { logger } = require('../utils/logger');

/**
 * Authentication Controller
 * Handles user registration, login, password reset, and token management
 */

// Generate JWT tokens
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// Create and send token response
const createSendToken = (user, statusCode, req, res, message = 'Success') => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax'
  };

  // Set cookies
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    data: {
      user
    }
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    dateOfBirth,
    gender
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    email: email.toLowerCase() 
  });
  
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    dateOfBirth,
    gender
  });

  // Generate email verification token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;
    
    // await new Email(user, verifyURL).sendWelcome(); // Temporarily disabled
    logger.info(`User registered, verification email would be sent to: ${user.email}`);
    logger.info(`Verification URL: ${verifyURL}`);
    
    logger.info(`User registered successfully: ${user.email}`);
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    logger.error('Email sending failed during registration:', err);
  }

  createSendToken(user, 201, req, res, 'User registered successfully! Please check your email for verification.');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  try {
    // Find user and check password
    const user = await User.findByCredentials(email, password);
    
    logger.info(`User logged in successfully: ${user.email}`);
    
    createSendToken(user, 200, req, res, 'Logged in successfully');
  } catch (error) {
    logger.warn(`Failed login attempt for email: ${email}`);
    return next(new AppError(error.message, 401));
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  // Clear cookies
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Protect routes - Authentication middleware
 * @route   Middleware
 * @access  Private
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist.', 401)
    );
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  // 5) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * @desc    Restrict to certain roles
 * @route   Middleware
 * @access  Private
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ 
    email: req.body.email.toLowerCase(),
    isActive: true 
  });
  
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // await new Email(user, resetURL).sendPasswordReset(); // Temporarily disabled
    logger.info(`Password reset email would be sent to: ${user.email}`);
    logger.info(`Reset URL: ${resetURL}`);

    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Email sending failed during password reset:', err);
    return next(
      new AppError('There was an error sending the email. Try again later.', 500)
    );
  }
});

/**
 * @desc    Reset password
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    isActive: true
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user (done in pre-save middleware)

  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res, 'Password reset successful');
});

/**
 * @desc    Update password
 * @route   PATCH /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res, 'Password updated successfully');
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, verify email
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully!'
  });
});

/**
 * @desc    Resend email verification
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ 
    email: req.body.email.toLowerCase(),
    isActive: true 
  });
  
  if (!user) {
    return next(new AppError('No user found with that email address.', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified.', 400));
  }

  // Generate new verification token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;
    
    // await new Email(user, verifyURL).sendEmailVerification(); // Temporarily disabled
    logger.info(`Verification email would be sent to: ${user.email}`);
    logger.info(`Verification URL: ${verifyURL}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent!'
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Email sending failed during verification resend:', err);
    return next(
      new AppError('There was an error sending the email. Try again later.', 500)
    );
  }
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  // 1) Getting refresh token
  let refreshToken;
  if (req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
  } else if (req.cookies.refreshToken) {
    refreshToken = req.cookies.refreshToken;
  }

  if (!refreshToken) {
    return next(new AppError('Refresh token not provided', 401));
  }

  // 2) Verification refresh token
  const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

  if (decoded.type !== 'refresh') {
    return next(new AppError('Invalid refresh token', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  // 5) Generate new tokens
  createSendToken(currentUser, 200, req, res, 'Token refreshed successfully');
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * @desc    Check if user is logged in (for rendered pages)
 * @route   Middleware
 * @access  Public
 */
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};