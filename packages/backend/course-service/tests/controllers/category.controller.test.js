const mongoose = require('mongoose');
const {
  connect,
  clearDatabase,
  closeDatabase,
  testUsers,
  generateCategoryData,
  generateCourseData
} = require('../utils/test-setup');
const TestClient = require('../utils/test-client');
const { Category, Course } = require('../../src/models');

describe('Category Controller', () => {
  let adminClient;
  let publicClient;

  beforeAll(async () => {
    await connect();
    adminClient = new TestClient(testUsers.admin);
    publicClient = new TestClient();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/categories', () => {
    it('should create a new category', async () => {
      const categoryData = generateCategoryData();
      const response = await adminClient.post('/api/v1/categories', categoryData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data).toHaveProperty('slug');
    });

    it('should require admin authentication', async () => {
      const response = await publicClient.post('/api/v1/categories', generateCategoryData());

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await adminClient.post('/api/v1/categories', {
        name: 'Test'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('GET /api/v1/categories', () => {
    beforeEach(async () => {
      const parent = await Category.create(generateCategoryData({
        name: 'Parent Category'
      }));

      await Category.create([
        generateCategoryData({
          name: 'Child Category 1',
          parent: parent._id
        }),
        generateCategoryData({
          name: 'Child Category 2',
          parent: parent._id
        }),
        generateCategoryData({
          name: 'Inactive Category',
          isActive: false
        })
      ]);
    });

    it('should return active categories in hierarchy', async () => {
      const response = await publicClient.get('/api/v1/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1); // Parent category
      expect(response.body.data[0].children).toHaveLength(2); // Two child categories
    });

    it('should include inactive categories when requested', async () => {
      const response = await publicClient.get('/api/v1/categories?includeInactive=true');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2); // Parent + Inactive
    });
  });

  describe('GET /api/v1/categories/slug/:slug', () => {
    let category;
    let course;

    beforeEach(async () => {
      category = await Category.create(generateCategoryData());
      course = await Course.create(generateCourseData({
        category: category._id,
        isPublished: true
      }));
    });

    it('should return category details with courses', async () => {
      const response = await publicClient.get(`/api/v1/categories/slug/${category.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category._id.toString()).toBe(category._id.toString());
      expect(response.body.data.featuredCourses).toHaveLength(1);
    });

    it('should include subcategories if present', async () => {
      await Category.create(generateCategoryData({
        parent: category._id
      }));

      const response = await publicClient.get(`/api/v1/categories/slug/${category.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.data.subCategories).toHaveLength(1);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await publicClient.get('/api/v1/categories/slug/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create(generateCategoryData());
    });

    it('should update category', async () => {
      const updates = {
        name: 'Updated Category',
        description: 'Updated description'
      };

      const response = await adminClient.put(
        `/api/v1/categories/${category._id}`,
        updates
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.slug).toBe('updated-category');
    });

    it('should validate color format', async () => {
      const response = await adminClient.put(
        `/api/v1/categories/${category._id}`,
        { color: 'invalid-color' }
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await Category.create(generateCategoryData());
    });

    it('should delete category', async () => {
      const response = await adminClient.delete(`/api/v1/categories/${category._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedCategory = await Category.findById(category._id);
      expect(deletedCategory).toBeNull();
    });

    it('should not delete category with courses', async () => {
      await Course.create(generateCourseData({
        category: category._id
      }));

      const response = await adminClient.delete(`/api/v1/categories/${category._id}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not delete category with subcategories', async () => {
      await Category.create(generateCategoryData({
        parent: category._id
      }));

      const response = await adminClient.delete(`/api/v1/categories/${category._id}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/categories/order', () => {
    let categories;

    beforeEach(async () => {
      categories = await Category.create([
        generateCategoryData({ order: 1 }),
        generateCategoryData({ order: 2 }),
        generateCategoryData({ order: 3 })
      ]);
    });

    it('should update category order', async () => {
      const categoryOrders = categories.map((category, index) => ({
        id: category._id,
        order: categories.length - index
      }));

      const response = await adminClient.put('/api/v1/categories/order', {
        categories: categoryOrders
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].order).toBe(3);
      expect(response.body.data[2].order).toBe(1);
    });

    it('should validate input format', async () => {
      const response = await adminClient.put('/api/v1/categories/order', {
        categories: [{ invalid: 'format' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/categories/update-counts', () => {
    beforeEach(async () => {
      const categories = await Category.create([
        generateCategoryData(),
        generateCategoryData()
      ]);

      await Course.create([
        generateCourseData({ category: categories[0]._id, isPublished: true }),
        generateCourseData({ category: categories[0]._id, isPublished: true }),
        generateCourseData({ category: categories[1]._id, isPublished: true })
      ]);
    });

    it('should update course counts for all categories', async () => {
      const response = await adminClient.post('/api/v1/categories/update-counts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const categories = await Category.find();
      expect(categories[0].courseCount).toBe(2);
      expect(categories[1].courseCount).toBe(1);
    });
  });
});