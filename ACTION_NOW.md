# ⚡ ACTION NOW - Start Coding in 5 Minutes

**Current Status:** 70% Phase 1 Complete
**Your Next Task:** Complete Course Service (4-6 hours)
**Expected Result:** Course Service 100% functional ✅

---

## 🚀 OPTION 1: Start Course Service Implementation (RECOMMENDED)

### Step 1: Open the Project (30 seconds)

```bash
cd c:\Users\PAES\Desktop\Devs\har-academy
code .
```

### Step 2: Start MongoDB (1 minute)

```bash
# Start only the database needed
docker compose up -d mongodb-courses redis
```

### Step 3: Open the Controller File (10 seconds)

**File to edit:**
```
packages/backend/course-service/src/controllers/course.controller.js
```

### Step 4: Add Missing Methods (3-5 hours)

**You need to add these 9 methods:**

#### Method 1: getCourseById (10 min)
```javascript
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
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

#### Method 2: getCourseLessons (15 min)
```javascript
exports.getCourseLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const { Module, Lesson } = require('../models');

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    const modules = await Module.find({ course_id: id })
      .sort({ order: 1 });

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({ module_id: module._id })
          .sort({ order: 1 })
          .select('-content'); // Don't send full content in list

        return {
          ...module.toObject(),
          lessons
        };
      })
    );

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title
        },
        modules: modulesWithLessons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

#### Method 3: getLessonDetails (20 min)
```javascript
exports.getLessonDetails = async (req, res) => {
  try {
    const { id: courseId, lesson_id: lessonId } = req.params;
    const { Lesson, Enrollment } = require('../models');

    // Check if user is enrolled or is instructor/admin
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    // Check access
    const isInstructor = course.instructor_id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
        status: 'active'
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: { message: 'Not enrolled in this course' }
        });
      }
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found' }
      });
    }

    res.json({
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

#### Method 4: enrollInCourse (15 min)
```javascript
exports.enrollInCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { Enrollment, Module, Lesson } = require('../models');

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: { message: 'Course is not published' }
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: { message: 'Already enrolled in this course' }
      });
    }

    // Get course structure
    const modules = await Module.find({ course_id: courseId }).sort({ order: 1 });
    const modulesProgress = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({ module_id: module._id });
        const lessonsProgress = lessons.map(lesson => ({
          lessonId: lesson._id,
          completed: false,
          timeSpent: 0
        }));

        return {
          moduleId: module._id,
          lessonsProgress,
          completedLessons: 0,
          totalLessons: lessons.length
        };
      })
    );

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      status: 'active',
      progress: 0,
      modulesProgress,
      paymentId: req.body.paymentId || 'FREE' // TODO: integrate with payment service
    });

    // Update course enrollment count
    course.enrollments_count += 1;
    await course.save();

    res.status(201).json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

#### Method 5: getCourseProgress (10 min)
```javascript
exports.getCourseProgress = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { Enrollment } = require('../models');

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    })
    .populate('course', 'title image_url')
    .populate('modulesProgress.moduleId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Not enrolled in this course' }
      });
    }

    res.json({
      success: true,
      data: {
        enrollment,
        progress: enrollment.progress,
        status: enrollment.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

#### Method 6: publishCourse (10 min)
```javascript
exports.publishCourse = async (req, res) => {
  try {
    const { Module, Lesson } = require('../models');
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
    const moduleCount = await Module.countDocuments({ course_id: course._id });
    if (moduleCount === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot publish course with no modules' }
      });
    }

    const lessonCount = await Lesson.countDocuments({
      module_id: { $in: await Module.find({ course_id: course._id }).distinct('_id') }
    });

    if (lessonCount === 0) {
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

#### Method 7: addModule (15 min)
```javascript
exports.addModule = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const { Module } = require('../models');
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

    // Get next order if not provided
    const moduleCount = await Module.countDocuments({ course_id: courseId });
    const moduleOrder = order || moduleCount + 1;

    const module = await Module.create({
      course_id: courseId,
      title,
      description,
      order: moduleOrder
    });

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

#### Method 8: addLesson (20 min)
```javascript
exports.addLesson = async (req, res) => {
  try {
    const { title, description, type, content, video, order } = req.body;
    const { id: courseId, module_id: moduleId } = req.params;
    const { Module, Lesson } = require('../models');

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
        error: { message: 'Module not found in this course' }
      });
    }

    // Get next order if not provided
    const lessonCount = await Lesson.countDocuments({ module_id: moduleId });
    const lessonOrder = order || lessonCount + 1;

    const lesson = await Lesson.create({
      module_id: moduleId,
      title,
      description,
      type: type || 'video',
      content,
      video,
      order: lessonOrder
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

#### Method 9: updateLesson (10 min)
```javascript
exports.updateLesson = async (req, res) => {
  try {
    const { id: courseId, module_id: moduleId, lesson_id: lessonId } = req.params;
    const updates = req.body;
    const { Lesson } = require('../models');

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

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.module_id.toString() !== moduleId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found in this module' }
      });
    }

    // Update lesson
    Object.assign(lesson, updates);
    await lesson.save();

    res.json({
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

### Step 5: Test the Service (30 minutes)

```bash
cd packages/backend/course-service
npm install
npm run dev
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:3002/api/v1/health

# Get all courses
curl http://localhost:3002/api/v1/courses

# Get course by ID (replace with real ID)
curl http://localhost:3002/api/v1/courses/YOUR_COURSE_ID
```

---

## 🚀 OPTION 2: Test Auth Service First

### Quick Test (5 minutes)

```bash
# Start databases
docker compose up -d mongodb-auth redis

# Start Auth Service
cd packages/backend/auth-service
npm install
npm run dev
```

**Test registration:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Full testing guide:** [TEST_AUTH_SERVICE.md](TEST_AUTH_SERVICE.md)

---

## 🚀 OPTION 3: Run Everything with Docker

### Start All Services (2 minutes)

```bash
docker compose up -d
```

**Check status:**
```bash
docker compose ps
```

**View logs:**
```bash
docker compose logs -f
```

**Full guide:** [RUN_ALL_SERVICES.md](RUN_ALL_SERVICES.md)

---

## 📊 What You'll Have After Option 1

✅ **Course Service 100% Complete:**
- 22 endpoints fully functional
- All CRUD operations working
- Module and lesson management
- Enrollment system
- Progress tracking
- Publish workflow

✅ **Progress:**
- Phase 1: 70% → 85%
- 2/5 services complete
- Ready for Payment Service

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Setup environment | 5 min |
| Add 9 controller methods | 2-4 hours |
| Test endpoints | 30 min |
| Fix bugs | 30 min |
| **TOTAL** | **3-5 hours** |

---

## 🆘 Need Help?

**Can't start MongoDB?**
```bash
docker compose down
docker compose up -d mongodb-courses
docker compose logs mongodb-courses
```

**Port already in use?**
```bash
# Change port in .env
echo "PORT=3012" >> packages/backend/course-service/.env
```

**Missing dependencies?**
```bash
cd packages/backend/course-service
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success Criteria

You'll know it's working when:

- [ ] Service starts without errors
- [ ] Health check responds: `curl http://localhost:3002/api/v1/health`
- [ ] Can get courses list: `curl http://localhost:3002/api/v1/courses`
- [ ] Can get course by ID (with valid ID)
- [ ] No console errors

---

## 🎯 After Completion

**You'll have:**
- ✅ Course Service 100% complete
- ✅ 2/5 backend services done (40%)
- ✅ Phase 1 at 85%

**Next steps:**
1. Implement Payment Service (1-2 days)
2. Implement AI Service (1-2 days)
3. Setup API Gateway (1 day)
4. Write tests (2-3 days)

---

## 🚀 Ready? Start Now!

**Recommended:** OPTION 1 (Complete Course Service)

```bash
# 1. Start database
docker compose up -d mongodb-courses redis

# 2. Open the file
code packages/backend/course-service/src/controllers/course.controller.js

# 3. Copy-paste the 9 methods above

# 4. Test
cd packages/backend/course-service
npm install
npm run dev
```

**Good luck! 🎉**

---

**Other helpful docs:**
- [COURSE_SERVICE_ANALYSIS.md](COURSE_SERVICE_ANALYSIS.md) - Detailed analysis
- [NEXT_STEPS_IMMEDIATE.md](NEXT_STEPS_IMMEDIATE.md) - All options explained
- [SESSION_FINAL_SUMMARY.md](SESSION_FINAL_SUMMARY.md) - What was done today
