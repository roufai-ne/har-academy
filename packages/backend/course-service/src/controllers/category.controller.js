const { Category, Course } = require('../models');
const { generateUniqueSlug, formatError } = require('../utils/helpers');

class CategoryController {
  // Create category
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      const slug = await generateUniqueSlug(Category, name);

      const category = new Category({
        ...req.body,
        slug
      });

      await category.save();

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const { includeInactive = false } = req.query;
      const query = includeInactive ? {} : { isActive: true };

      const categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort('order');

      // Organize into hierarchy
      const rootCategories = categories.filter(c => !c.parent);
      const categoryMap = {};

      categories.forEach(category => {
        categoryMap[category._id] = {
          ...category.toObject(),
          children: []
        };
      });

      categories.forEach(category => {
        if (category.parent) {
          categoryMap[category.parent._id].children.push(categoryMap[category._id]);
        }
      });

      res.json({
        success: true,
        data: rootCategories.map(c => categoryMap[c._id])
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Get category by slug
  async getCategoryBySlug(req, res) {
    try {
      const category = await Category.findOne({ slug: req.params.slug });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found' }
        });
      }

      // Get descendant categories
      const descendants = await category.getDescendants();
      
      // Get courses in this category and descendant categories
      const categoryIds = [category._id, ...descendants.map(d => d._id)];
      const courses = await Course.find({
        category: { $in: categoryIds },
        isPublished: true
      })
        .populate('instructor', 'name avatar')
        .sort('-createdAt')
        .limit(10);

      const path = await category.getPath();

      res.json({
        success: true,
        data: {
          category,
          path,
          subCategories: descendants,
          featuredCourses: courses
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found' }
        });
      }

      if (req.body.name && req.body.name !== category.name) {
        req.body.slug = await generateUniqueSlug(Category, req.body.name, category._id);
      }

      Object.assign(category, req.body);
      await category.save();

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found' }
        });
      }

      // Check if category has courses
      const courseCount = await Course.countDocuments({ category: category._id });
      if (courseCount > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete category with active courses' }
        });
      }

      // Check if category has subcategories
      const hasSubcategories = await Category.exists({ parent: category._id });
      if (hasSubcategories) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete category with subcategories' }
        });
      }

      await category.remove();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update category order
  async updateCategoryOrder(req, res) {
    try {
      const { categories } = req.body;

      // Validate input
      if (!Array.isArray(categories) || categories.some(c => !c.id || typeof c.order !== 'number')) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid input format' }
        });
      }

      // Update orders
      await Promise.all(categories.map(({ id, order }) =>
        Category.findByIdAndUpdate(id, { order })
      ));

      const updatedCategories = await Category.find({
        _id: { $in: categories.map(c => c.id) }
      }).sort('order');

      res.json({
        success: true,
        data: updatedCategories
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }

  // Update course counts
  async updateCourseCounts(req, res) {
    try {
      const categories = await Category.find();

      await Promise.all(categories.map(category =>
        Category.updateCourseCount(category._id)
      ));

      res.json({
        success: true,
        message: 'Course counts updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: formatError(error)
      });
    }
  }
}

module.exports = new CategoryController();