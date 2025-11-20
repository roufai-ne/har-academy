const express = require('express');
const categoryController = require('../controllers/category.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.use(verifyToken);
router.use(requireRoles(['admin']));

router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/order', categoryController.updateCategoryOrder);
router.post('/update-counts', categoryController.updateCourseCounts);

module.exports = router;