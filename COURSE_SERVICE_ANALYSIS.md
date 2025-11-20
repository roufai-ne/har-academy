# Course Service - Endpoints Analysis

## 📊 Comparison: Required vs Implemented

### ✅ Implemented Endpoints (Course Routes)

| # | Method | Endpoint | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | GET | `/courses` | ✅ | List courses |
| 2 | GET | `/courses/slug/:slug` | ✅ | Get by slug |
| 3 | POST | `/courses` | ✅ | Create (instructor) |
| 4 | PUT | `/courses/:id` | ✅ | Update course |
| 5 | DELETE | `/courses/:id` | ✅ | Delete course |
| 6 | GET | `/courses/instructor` | ✅ | Instructor's courses |
| 7 | PUT | `/courses/:id/modules/order` | ✅ | Reorder modules |
| 8 | GET | `/courses/:id/analytics` | ✅ | Course analytics |

**Total Course Routes: 8 implemented**

### ✅ Implemented Endpoints (Enrollment Routes)

| # | Method | Endpoint | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | POST | `/enrollments` | ✅ | Enroll in course |
| 2 | GET | `/enrollments/my` | ✅ | My enrollments |
| 3 | GET | `/enrollments/:id` | ✅ | Enrollment details |
| 4 | PUT | `/enrollments/:id/progress` | ✅ | Update progress |
| 5 | GET | `/enrollments/:id/certificate` | ✅ | Get certificate |
| 6 | POST | `/enrollments/:id/cancel` | ✅ | Cancel enrollment |

**Total Enrollment Routes: 6 implemented**

---

## ⚠️ Missing Endpoints (Per PROMPT_02 Spec)

### Required but Missing

| # | Method | Endpoint | Priority | Notes |
|---|--------|----------|----------|-------|
| 1 | GET | `/courses/:id` | 🔴 HIGH | Get course details (instead of by slug) |
| 2 | GET | `/courses/:id/lessons` | 🔴 HIGH | Get all lessons of a course |
| 3 | GET | `/courses/:id/lessons/:lesson_id` | 🔴 HIGH | Get specific lesson |
| 4 | POST | `/courses/:id/publish` | 🟡 MEDIUM | Publish course |
| 5 | POST | `/courses/:id/modules` | 🔴 HIGH | Add module to course |
| 6 | POST | `/courses/:id/modules/:module_id/lessons` | 🔴 HIGH | Add lesson to module |
| 7 | PATCH | `/courses/:id/modules/:module_id/lessons/:lesson_id` | 🟡 MEDIUM | Update lesson |
| 8 | GET | `/courses/:id/progress` | 🟡 MEDIUM | Get course progress for user |

**Total Missing: 8 endpoints**

---

## 🔄 Endpoint Mapping Analysis

### What We Have vs What's Needed

**✅ Good Coverage:**
- Course CRUD (create, update, delete)
- Enrollment flow
- Progress tracking
- Certificate generation

**❌ Gaps:**
- No direct course detail by ID (only by slug)
- No lesson management endpoints
- No module management endpoints
- No publish workflow
- No lesson detail viewing

---

## 📝 Action Plan

### Priority 1: Add Missing Core Endpoints (3-4 hours)

**File to modify:** `src/routes/course.routes.js`

```javascript
// Add these routes to course.routes.js

// Get course by ID (needed by other services)
router.get('/:id', courseController.getCourseById);

// Lessons management
router.get('/:id/lessons', courseController.getCourseLessons);
router.get('/:id/lessons/:lesson_id', verifyToken, courseController.getLessonDetails);

// Publishing
router.post('/:id/publish', requireRoles(['instructor', 'admin']), courseController.publishCourse);

// Module management
router.post('/:id/modules', requireRoles(['instructor', 'admin']), courseController.addModule);

// Lesson management
router.post('/:id/modules/:module_id/lessons', requireRoles(['instructor', 'admin']), courseController.addLesson);
router.patch('/:id/modules/:module_id/lessons/:lesson_id', requireRoles(['instructor', 'admin']), courseController.updateLesson);
```

### Priority 2: Implement Missing Controllers (4-5 hours)

**File to modify:** `src/controllers/course.controller.js`

**Methods to add:**
1. `getCourseById` - Get course details by ObjectId
2. `getCourseLessons` - Get all lessons (grouped by modules)
3. `getLessonDetails` - Get single lesson with access check
4. `publishCourse` - Validate and publish
5. `addModule` - Add module to course
6. `addLesson` - Add lesson to module
7. `updateLesson` - Update lesson details

### Priority 3: Enrollment Endpoint Alignment (1 hour)

**File to modify:** `src/routes/enrollment.routes.js`

Change enrollment routes to match spec:
- `/enrollments` → Already correct ✅
- Add `/courses/:id/enroll` alias for consistency with spec
- Add `/courses/:id/progress` for getting course progress

---

## 🧪 Testing Checklist

After implementation, test:

### Course Endpoints
- [ ] GET `/courses` - List with filters
- [ ] GET `/courses/:id` - Get by ID
- [ ] GET `/courses/slug/:slug` - Get by slug
- [ ] POST `/courses` - Create (instructor only)
- [ ] PUT `/courses/:id` - Update (owner only)
- [ ] DELETE `/courses/:id` - Delete (owner only)
- [ ] POST `/courses/:id/publish` - Publish
- [ ] POST `/courses/:id/modules` - Add module
- [ ] POST `/courses/:id/modules/:module_id/lessons` - Add lesson
- [ ] GET `/courses/:id/lessons` - List lessons
- [ ] GET `/courses/:id/lessons/:lesson_id` - Lesson details
- [ ] PATCH `/courses/:id/modules/:module_id/lessons/:lesson_id` - Update lesson

### Enrollment Endpoints
- [ ] POST `/courses/:id/enroll` - Enroll
- [ ] GET `/enrollments` - List enrollments
- [ ] GET `/enrollments/:id` - Enrollment details
- [ ] PUT `/enrollments/:id/progress` - Update progress
- [ ] GET `/courses/:id/progress` - Course progress

---

## 🛠️ Implementation Steps

### Step 1: Add getCourseById Controller

```javascript
// src/controllers/course.controller.js

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('modules')
      .populate('instructor_id', 'first_name last_name avatar_url');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Step 2: Add getCourseLessons Controller

```javascript
exports.getCourseLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const { module_id } = req.query;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    let query = { course_id: id };
    if (module_id) {
      query.module_id = module_id;
    }

    const modules = await Module.find({ course_id: id })
      .populate('lessons')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Step 3: Add publishCourse Controller

```javascript
exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    // Check ownership
    if (course.instructor_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized' }
      });
    }

    // Validate course has content
    if (course.total_lessons === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot publish course with no lessons' }
      });
    }

    course.status = 'published';
    course.published_at = new Date();
    await course.save();

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Step 4: Add Module Management

```javascript
exports.addModule = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    // Check ownership
    if (course.instructor_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized' }
      });
    }

    const module = await Module.create({
      course_id: courseId,
      title,
      description,
      order: order || (course.modules.length + 1)
    });

    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: { module }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Step 5: Add Lesson Management

```javascript
exports.addLesson = async (req, res) => {
  try {
    const { title, description, type, content, video, order } = req.body;
    const { id: courseId, module_id: moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    // Check ownership
    if (course.instructor_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized' }
      });
    }

    const module = await Module.findById(moduleId);
    if (!module || module.course_id.toString() !== courseId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }

    const lesson = await Lesson.create({
      module_id: moduleId,
      title,
      description,
      type,
      content,
      video,
      order: order || (await Lesson.countDocuments({ module_id: moduleId }) + 1)
    });

    // Update course totals
    course.total_lessons += 1;
    if (video?.duration_seconds) {
      course.total_duration_hours += video.duration_seconds / 3600;
    }
    await course.save();

    res.status(201).json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

---

## 📊 Summary

**Current State:**
- ✅ 14 endpoints implemented
- ❌ 8 endpoints missing
- 🟡 64% endpoint coverage

**After Implementation:**
- ✅ 22 endpoints total
- ✅ 100% spec coverage
- ✅ Ready for testing

**Estimated Time:**
- Add routes: 1 hour
- Implement controllers: 4 hours
- Testing: 2 hours
- **Total: 7 hours**

---

## 🚀 Next Steps

1. ✅ Read this analysis
2. Implement missing endpoints (follow steps above)
3. Test all endpoints
4. Write unit tests
5. Move to Payment Service implementation

**Files to modify:**
- `src/routes/course.routes.js`
- `src/controllers/course.controller.js`
- Optional: `src/routes/enrollment.routes.js` (add aliases)
