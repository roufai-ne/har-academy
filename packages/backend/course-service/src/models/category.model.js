const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color hex code']
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  ancestors: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  order: {
    type: Number,
    default: 0
  },
  courseCount: {
    type: Number,
    default: 0
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String]
  }
}, {
  timestamps: true
});

// Index for hierarchical queries
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ ancestors: 1 });

// Update ancestors array before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    this.ancestors = [];
    if (this.parent) {
      const parent = await this.constructor.findById(this.parent);
      if (parent) {
        this.ancestors = [...parent.ancestors, parent._id];
        this.level = parent.level + 1;
      }
    }
  }
  next();
});

// Static method to update course count
categorySchema.statics.updateCourseCount = async function(categoryId) {
  const courseCount = await mongoose.model('Course').countDocuments({
    category: categoryId,
    isPublished: true
  });

  await this.findByIdAndUpdate(categoryId, { courseCount });
};

// Method to get all descendant categories
categorySchema.methods.getDescendants = async function() {
  return this.constructor.find({
    ancestors: this._id
  });
};

// Method to get complete path (breadcrumb)
categorySchema.methods.getPath = async function() {
  const path = await this.constructor.find({
    _id: { $in: [...this.ancestors, this._id] }
  }).sort({ level: 1 });
  
  return path;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;