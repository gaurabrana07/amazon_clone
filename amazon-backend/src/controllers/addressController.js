const Address = require('../models/Address');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

/**
 * Address Controller
 * Handles user address management for shipping and billing
 */

// Get user's addresses
exports.getMyAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id })
    .sort({ isDefault: -1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      addresses,
      count: addresses.length
    }
  });
});

// Get single address
exports.getAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  res.status(200).json({
    success: true,
    data: { address }
  });
});

// Create new address
exports.createAddress = catchAsync(async (req, res, next) => {
  const {
    fullName,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country = 'United States',
    phoneNumber,
    addressType = 'home',
    isDefault = false,
    deliveryInstructions,
    accessCodes
  } = req.body;

  // Validate delivery area
  const isValidDeliveryArea = Address.validateDeliveryArea(postalCode);
  if (!isValidDeliveryArea) {
    return next(new AppError('Delivery is not available in this postal code area', 400));
  }

  const addressData = {
    user: req.user.id,
    fullName,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phoneNumber,
    addressType,
    isDefault,
    deliveryInstructions,
    accessCodes: {
      building: accessCodes?.building,
      gate: accessCodes?.gate,
      other: accessCodes?.other
    },
    metadata: {
      source: 'manual'
    }
  };

  const address = new Address(addressData);
  await address.save();

  logger.info('Address created', {
    userId: req.user.id,
    addressId: address._id,
    addressType,
    isDefault
  });

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: { address }
  });
});

// Update address
exports.updateAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  // Validate delivery area if postal code is being updated
  if (updates.postalCode && updates.postalCode !== address.postalCode) {
    const isValidDeliveryArea = Address.validateDeliveryArea(updates.postalCode);
    if (!isValidDeliveryArea) {
      return next(new AppError('Delivery is not available in this postal code area', 400));
    }
  }

  // Update address
  Object.assign(address, updates);
  await address.save();

  logger.info('Address updated', {
    userId: req.user.id,
    addressId: address._id,
    updates: Object.keys(updates)
  });

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { address }
  });
});

// Delete address
exports.deleteAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  // Prevent deletion of default address if user has other addresses
  if (address.isDefault) {
    const otherAddresses = await Address.countDocuments({ 
      user: req.user.id, 
      _id: { $ne: id } 
    });
    
    if (otherAddresses > 0) {
      return next(new AppError('Cannot delete default address. Please set another address as default first', 400));
    }
  }

  await address.deleteOne();

  logger.info('Address deleted', {
    userId: req.user.id,
    addressId: id
  });

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// Set address as default
exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  await address.setAsDefault();

  logger.info('Default address set', {
    userId: req.user.id,
    addressId: id
  });

  res.status(200).json({
    success: true,
    message: 'Address set as default',
    data: { address }
  });
});

// Get addresses by type
exports.getAddressesByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;

  if (!['home', 'work', 'other'].includes(type)) {
    return next(new AppError('Invalid address type', 400));
  }

  const addresses = await Address.getByTypeForUser(req.user.id, type);

  res.status(200).json({
    success: true,
    data: {
      addresses,
      count: addresses.length,
      type
    }
  });
});

// Verify address
exports.verifyAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  // In a real application, this would integrate with address verification services
  // For now, we'll simulate verification
  await address.verifyAddress('address_verification_service');

  logger.info('Address verified', {
    userId: req.user.id,
    addressId: id
  });

  res.status(200).json({
    success: true,
    message: 'Address verified successfully',
    data: { address }
  });
});

// Get shipping cost estimate
exports.getShippingEstimate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { weight = 1, items = 1 } = req.query;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  // Default shipping origin (warehouse location)
  const originPostalCode = '10001'; // Example: New York warehouse

  const estimates = {
    standard: {
      cost: Address.estimateShippingCost(originPostalCode, address.postalCode, parseFloat(weight)),
      delivery: Address.getDeliveryEstimate(address.postalCode, 'standard')
    },
    express: {
      cost: Address.estimateShippingCost(originPostalCode, address.postalCode, parseFloat(weight)) + 5.00,
      delivery: Address.getDeliveryEstimate(address.postalCode, 'express')
    },
    overnight: {
      cost: Address.estimateShippingCost(originPostalCode, address.postalCode, parseFloat(weight)) + 15.00,
      delivery: Address.getDeliveryEstimate(address.postalCode, 'overnight')
    }
  };

  // Apply free shipping if applicable
  const freeShippingThreshold = 50;
  const orderValue = parseFloat(req.query.orderValue) || 0;
  
  if (orderValue >= freeShippingThreshold) {
    estimates.standard.cost = 0;
    estimates.standard.isFree = true;
  }

  res.status(200).json({
    success: true,
    data: {
      address: {
        id: address._id,
        shortAddress: address.shortAddress,
        postalCode: address.postalCode
      },
      estimates,
      freeShippingThreshold,
      qualifiesForFreeShipping: orderValue >= freeShippingThreshold
    }
  });
});

// Validate address for delivery
exports.validateAddressForDelivery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const address = await Address.findById(id);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // Check authorization
  if (address.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized access to address', 403));
  }

  const isValid = Address.validateDeliveryArea(address.postalCode);
  const estimates = {
    standard: Address.getDeliveryEstimate(address.postalCode, 'standard'),
    express: Address.getDeliveryEstimate(address.postalCode, 'express'),
    overnight: Address.getDeliveryEstimate(address.postalCode, 'overnight')
  };

  res.status(200).json({
    success: true,
    data: {
      isValid,
      deliveryAvailable: isValid,
      estimates: isValid ? estimates : null,
      restrictions: isValid ? [] : ['Delivery not available in this area'],
      address: {
        id: address._id,
        formattedAddress: address.formattedAddress,
        postalCode: address.postalCode
      }
    }
  });
});

// Get default address
exports.getDefaultAddress = catchAsync(async (req, res, next) => {
  const defaultAddress = await Address.getDefaultForUser(req.user.id);

  if (!defaultAddress) {
    return res.status(200).json({
      success: true,
      data: {
        address: null,
        hasDefault: false
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      address: defaultAddress,
      hasDefault: true
    }
  });
});

// Search addresses (for admin)
exports.searchAddresses = catchAsync(async (req, res, next) => {
  const { query, postalCode, state, city, page = 1, limit = 20 } = req.query;

  const filter = {};
  
  if (query) {
    filter.$or = [
      { fullName: new RegExp(query, 'i') },
      { addressLine1: new RegExp(query, 'i') },
      { city: new RegExp(query, 'i') }
    ];
  }
  
  if (postalCode) filter.postalCode = postalCode;
  if (state) filter.state = new RegExp(state, 'i');
  if (city) filter.city = new RegExp(city, 'i');

  const addresses = await Address.find(filter)
    .populate('user', 'name email')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Address.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      addresses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = exports;