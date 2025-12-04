const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { logger } = require('../utils/logger');

/**
 * User Controller
 * Handles user profile management, CRUD operations, and admin functions
 */

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/update-me
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'preferences'
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  logger.info(`User profile updated: ${updatedUser.email}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * @desc    Delete current user account (deactivate)
 * @route   DELETE /api/users/delete-me
 * @access  Private
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  logger.info(`User account deactivated: ${req.user.email}`);

  res.status(204).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * @desc    Add address to user profile
 * @route   POST /api/users/addresses
 * @access  Private
 */
exports.addAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  // If this is the first address or marked as default, make it default
  const isDefault = user.addresses.length === 0 || req.body.isDefault;
  
  // If making this default, remove default from other addresses
  if (isDefault) {
    user.addresses.forEach(address => {
      address.isDefault = false;
    });
  }

  const newAddress = {
    ...req.body,
    isDefault
  };

  user.addresses.push(newAddress);
  await user.save();

  logger.info(`Address added for user: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: {
      address: user.addresses[user.addresses.length - 1]
    }
  });
});

/**
 * @desc    Update user address
 * @route   PATCH /api/users/addresses/:addressId
 * @access  Private
 */
exports.updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // If making this default, remove default from other addresses
  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== req.params.addressId) {
        addr.isDefault = false;
      }
    });
  }

  // Update address fields
  Object.keys(req.body).forEach(key => {
    address[key] = req.body[key];
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: {
      address
    }
  });
});

/**
 * @desc    Delete user address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
exports.deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  const wasDefault = address.isDefault;
  address.remove();

  // If deleted address was default, make first remaining address default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(204).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

/**
 * @desc    Get user addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
exports.getAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      addresses: user.addresses
    }
  });
});

/**
 * @desc    Update user preferences
 * @route   PATCH /api/users/preferences
 * @access  Private
 */
exports.updatePreferences = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { preferences: req.body },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: updatedUser.preferences
    }
  });
});

// ADMIN ONLY ROUTES

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = factory.getAll(User);

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUser = factory.getOne(User);

/**
 * @desc    Update user (Admin only)
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = factory.updateOne(User);

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = factory.deleteOne(User);

/**
 * @desc    Get user statistics (Admin only)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.getStats();
  
  // Get monthly registration stats for last 12 months
  const monthlyStats = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        registrations: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Get role distribution
  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      monthly: monthlyStats,
      roles: roleStats
    }
  });
});

/**
 * @desc    Search users (Admin only)
 * @route   GET /api/users/search
 * @access  Private/Admin
 */
exports.searchUsers = catchAsync(async (req, res, next) => {
  const { q, role, isActive, isEmailVerified, page = 1, limit = 20 } = req.query;

  const query = {};

  // Text search
  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }

  // Filters
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified === 'true';

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Private/Admin
 */
exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  logger.info(`User status toggled: ${user.email} - Active: ${user.isActive}`);

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user
    }
  });
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!['customer', 'admin', 'seller', 'moderator'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User role updated: ${user.email} - Role: ${role}`);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user
    }
  });
});