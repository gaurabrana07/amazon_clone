const mongoose = require('mongoose');

/**
 * Address Schema
 * User address management for shipping and billing
 */
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // US postal code validation (5 digits or 5+4 format)
        return /^\d{5}(-\d{4})?$/.test(v);
      },
      message: 'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
    }
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'United States',
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // US phone number validation
        return /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  addressType: {
    type: String,
    enum: {
      values: ['home', 'work', 'other'],
      message: 'Address type must be home, work, or other'
    },
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  },
  accessCodes: {
    building: String,
    gate: String,
    other: String
  },
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'google_maps', 'address_autocomplete'],
      default: 'manual'
    },
    verificationService: String,
    verificationDate: Date,
    deliveryZone: String,
    shippingRestrictions: [String]
  },
  usageStats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, addressType: 1 });
addressSchema.index({ postalCode: 1 });
addressSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
  let address = this.addressLine1;
  if (this.addressLine2) {
    address += `, ${this.addressLine2}`;
  }
  address += `, ${this.city}, ${this.state} ${this.postalCode}`;
  if (this.country !== 'United States') {
    address += `, ${this.country}`;
  }
  return address;
});

// Virtual for short address
addressSchema.virtual('shortAddress').get(function() {
  return `${this.city}, ${this.state} ${this.postalCode}`;
});

// Virtual for delivery success rate
addressSchema.virtual('deliverySuccessRate').get(function() {
  const totalDeliveries = this.usageStats.successfulDeliveries + this.usageStats.failedDeliveries;
  if (totalDeliveries === 0) return 100;
  return (this.usageStats.successfulDeliveries / totalDeliveries) * 100;
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other addresses
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  
  // Increment usage stats if this is an update
  if (!this.isNew) {
    this.usageStats.timesUsed += 1;
    this.usageStats.lastUsed = new Date();
  }
  
  next();
});

// Method to set as default
addressSchema.methods.setAsDefault = async function() {
  // Remove default flag from other addresses
  await this.constructor.updateMany(
    { user: this.user, _id: { $ne: this._id } },
    { isDefault: false }
  );
  
  this.isDefault = true;
  return this.save();
};

// Method to verify address
addressSchema.methods.verifyAddress = function(service = 'internal') {
  this.isVerified = true;
  this.metadata.verificationService = service;
  this.metadata.verificationDate = new Date();
  return this.save();
};

// Method to record successful delivery
addressSchema.methods.recordSuccessfulDelivery = function() {
  this.usageStats.successfulDeliveries += 1;
  this.usageStats.lastUsed = new Date();
  return this.save();
};

// Method to record failed delivery
addressSchema.methods.recordFailedDelivery = function() {
  this.usageStats.failedDeliveries += 1;
  return this.save();
};

// Method to calculate distance from coordinates
addressSchema.methods.calculateDistance = function(lat, lng) {
  if (!this.coordinates.latitude || !this.coordinates.longitude) {
    return null;
  }
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.coordinates.latitude * Math.PI / 180) * 
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Static method to find addresses near coordinates
addressSchema.statics.findNearby = function(lat, lng, maxDistance = 10) {
  return this.find({
    'coordinates.latitude': {
      $gte: lat - (maxDistance / 111), // Rough conversion
      $lte: lat + (maxDistance / 111)
    },
    'coordinates.longitude': {
      $gte: lng - (maxDistance / (111 * Math.cos(lat * Math.PI / 180))),
      $lte: lng + (maxDistance / (111 * Math.cos(lat * Math.PI / 180)))
    }
  });
};

// Static method to get default address for user
addressSchema.statics.getDefaultForUser = function(userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get addresses by type for user
addressSchema.statics.getByTypeForUser = function(userId, type) {
  return this.find({ user: userId, addressType: type }).sort({ updatedAt: -1 });
};

// Static method to validate postal code for delivery
addressSchema.statics.validateDeliveryArea = function(postalCode) {
  // This would integrate with shipping services to validate delivery areas
  // For now, return basic validation
  const restrictedAreas = ['00000', '99999']; // Example restricted postal codes
  return !restrictedAreas.includes(postalCode);
};

// Static method to estimate shipping cost
addressSchema.statics.estimateShippingCost = function(fromPostalCode, toPostalCode, weight = 1) {
  // Basic shipping cost estimation
  // In production, this would integrate with shipping APIs
  const baseRate = 5.99;
  const weightSurcharge = weight > 1 ? (weight - 1) * 1.50 : 0;
  
  // Distance-based surcharge (simplified)
  const fromZone = parseInt(fromPostalCode.substring(0, 1));
  const toZone = parseInt(toPostalCode.substring(0, 1));
  const zoneDifference = Math.abs(fromZone - toZone);
  const distanceSurcharge = zoneDifference * 0.50;
  
  return baseRate + weightSurcharge + distanceSurcharge;
};

// Static method to get delivery time estimate
addressSchema.statics.getDeliveryEstimate = function(postalCode, shippingMethod = 'standard') {
  const estimates = {
    standard: { min: 5, max: 7 },
    express: { min: 2, max: 3 },
    overnight: { min: 1, max: 1 }
  };
  
  const estimate = estimates[shippingMethod] || estimates.standard;
  const today = new Date();
  
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + estimate.min);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + estimate.max);
  
  return {
    method: shippingMethod,
    estimatedDelivery: {
      min: minDate,
      max: maxDate
    },
    businessDays: `${estimate.min}-${estimate.max} business days`
  };
};

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;