const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Product Schema for Amazon Clone
 * Handles product information, categories, pricing, inventory, and reviews
 */
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Category and Classification
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required'],
    index: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  
  // Inventory Management
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  
  // Product Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued'],
    default: 'draft',
    index: true
  },
  availability: {
    type: String,
    enum: ['in-stock', 'out-of-stock', 'pre-order', 'discontinued'],
    default: 'in-stock',
    index: true
  },
  
  // Images and Media
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Product Specifications
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    group: {
      type: String,
      trim: true,
      default: 'General'
    }
  }],
  
  // Dimensions and Weight
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    unit: {
      type: String,
      enum: ['kg', 'lb', 'g', 'oz'],
      default: 'kg'
    }
  },
  
  // SEO and Marketing
  seoTitle: {
    type: String,
    maxlength: [70, 'SEO title cannot exceed 70 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Reviews and Ratings
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be below 0'],
    max: [5, 'Rating cannot be above 5'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Ratings quantity cannot be negative']
  },
  
  // Variants (for products with multiple options)
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      value: {
        type: String,
        required: true,
        trim: true
      },
      priceModifier: {
        type: Number,
        default: 0
      },
      stockModifier: {
        type: Number,
        default: 0
      }
    }]
  }],
  
  // Shipping Information
  shipping: {
    weight: {
      type: Number,
      min: [0, 'Shipping weight cannot be negative']
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'heavy', 'fragile'],
      default: 'standard'
    }
  },
  
  // Sales Analytics
  salesCount: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  wishlistCount: {
    type: Number,
    default: 0,
    min: [0, 'Wishlist count cannot be negative']
  },
  
  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Featured and Promotional
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isNewArrival: {
    type: Boolean,
    default: true,
    index: true
  },
  isBestseller: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Dates
  publishedAt: {
    type: Date
  },
  discontinuedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.discountPercentage > 0) {
    return this.originalPrice * (this.discountPercentage / 100);
  }
  return 0;
});

// Virtual for final price after discount
productSchema.virtual('finalPrice').get(function() {
  if (this.originalPrice && this.discountPercentage > 0) {
    return this.originalPrice - this.discountAmount;
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock <= this.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set original price if not provided
productSchema.pre('save', function(next) {
  if (this.isNew && !this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

// Pre-save middleware to calculate discount
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.discountPercentage > 0) {
    this.price = this.originalPrice * (1 - this.discountPercentage / 100);
  }
  next();
});

// Pre-save middleware to update availability based on stock
productSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    if (this.stock === 0) {
      this.availability = 'out-of-stock';
    } else if (this.availability === 'out-of-stock' && this.stock > 0) {
      this.availability = 'in-stock';
    }
  }
  next();
});

// Static method to get products by category
productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { category: categoryId, status: 'active' };
  return this.find(query)
    .populate('category', 'name slug')
    .populate('vendor', 'firstName lastName')
    .sort(options.sort || '-createdAt')
    .limit(options.limit || 20);
};

// Static method to search products
productSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active'
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, status: 'active' })
    .populate('category', 'name slug')
    .sort('-ratingsAverage -salesCount')
    .limit(limit);
};

// Static method to get bestsellers
productSchema.statics.getBestsellers = function(limit = 10) {
  return this.find({ status: 'active' })
    .populate('category', 'name slug')
    .sort('-salesCount -ratingsAverage')
    .limit(limit);
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = function(limit = 10) {
  return this.find({ isNewArrival: true, status: 'active' })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(limit);
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'add') {
    this.stock += quantity;
  }
  return this.save();
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating) {
  const totalRating = this.ratingsAverage * this.ratingsQuantity + newRating;
  this.ratingsQuantity += 1;
  this.ratingsAverage = totalRating / this.ratingsQuantity;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Product', productSchema);