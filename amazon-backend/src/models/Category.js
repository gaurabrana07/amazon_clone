const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Category Schema for Amazon Clone
 * Handles product categories and subcategories with hierarchical structure
 */
const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    index: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: [0, 'Level cannot be negative'],
    max: [5, 'Maximum category depth is 5 levels']
  },
  path: {
    type: String,
    index: true
  },
  
  // Visual Elements
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  
  // SEO
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
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
    index: true
  },
  isVisible: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Display Settings
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  },
  showInMenu: {
    type: Boolean,
    default: true
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
  },
  
  // Metadata
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'date'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      type: String,
      trim: true
    }]
  }],
  
  // Timestamps
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

// Indexes
categorySchema.index({ name: 1, status: 1 });
categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ level: 1, status: 1 });
categorySchema.index({ slug: 1 });

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for full path name
categorySchema.virtual('fullPath').get(function() {
  return this.path ? this.path.replace(/,/g, ' > ') : this.name;
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate level and path
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      try {
        const parentCategory = await this.constructor.findById(this.parent);
        if (parentCategory) {
          this.level = parentCategory.level + 1;
          this.path = parentCategory.path ? `${parentCategory.path},${this.name}` : this.name;
        }
      } catch (error) {
        return next(error);
      }
    } else {
      this.level = 0;
      this.path = this.name;
    }
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getTree = async function(parentId = null, maxDepth = 3) {
  const pipeline = [
    {
      $match: {
        parent: parentId,
        status: 'active',
        isVisible: true
      }
    },
    {
      $sort: { sortOrder: 1, name: 1 }
    }
  ];

  if (maxDepth > 0) {
    pipeline.push({
      $lookup: {
        from: 'categories',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$parent', '$$categoryId'] },
              status: 'active',
              isVisible: true
            }
          },
          { $sort: { sortOrder: 1, name: 1 } }
        ],
        as: 'children'
      }
    });
  }

  return this.aggregate(pipeline);
};

// Static method to get breadcrumb trail
categorySchema.statics.getBreadcrumb = async function(categoryId) {
  const category = await this.findById(categoryId);
  if (!category || !category.path) {
    return [];
  }

  const pathNames = category.path.split(',');
  const breadcrumb = [];

  for (let i = 0; i < pathNames.length; i++) {
    const pathSegment = pathNames.slice(0, i + 1).join(',');
    const cat = await this.findOne({ path: pathSegment });
    if (cat) {
      breadcrumb.push({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        level: cat.level
      });
    }
  }

  return breadcrumb;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    status: 'active', 
    isVisible: true 
  })
  .sort({ sortOrder: 1, name: 1 })
  .limit(limit);
};

// Static method to search categories
categorySchema.statics.search = function(searchTerm) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { keywords: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    status: 'active',
    isVisible: true
  }).sort({ name: 1 });
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Instance method to get all ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    const parent = await this.constructor.findById(current.parent);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  return ancestors;
};

// Instance method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = require('./Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    status: 'active' 
  });
  
  this.productCount = count;
  return this.save({ validateBeforeSave: false });
};

// Post middleware to update product count when category changes
categorySchema.post('save', async function() {
  if (this.isModified('status')) {
    await this.updateProductCount();
  }
});

module.exports = mongoose.model('Category', categorySchema);