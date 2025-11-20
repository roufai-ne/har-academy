# 🗺️ Roadmap to Phase 1 Completion

**Current Status:** ~60% Complete
**Estimated Time to Complete:** 5-8 days
**Target:** Fully functional backend with 80%+ test coverage

---

## 📅 Day-by-Day Plan

### ✅ Day 0: Foundation (COMPLETED)
- ✅ Phase 0: Architecture setup
- ✅ Auth Service implementation
- ✅ Course Service models
- ✅ Docker configuration
- ✅ Documentation structure

**Achievement:** 60% of backend infrastructure ready

---

### 🎯 Day 1: Verify & Test Existing Services

#### Morning (3-4 hours)
**Task 1.1: Verify Course Service Endpoints**
```bash
cd packages/backend/course-service

# Check what endpoints are implemented
grep -r "router\." src/routes/

# Test the service
npm install
npm run dev
```

**Checklist:**
- [ ] Read `src/controllers/course.controller.js`
- [ ] Read `src/controllers/enrollment.controller.js`
- [ ] Verify 15+ endpoints exist
- [ ] Test health endpoint
- [ ] Create test courses in MongoDB

**Expected Output:** List of all implemented endpoints

#### Afternoon (3-4 hours)
**Task 1.2: Write Auth Service Tests**
```bash
cd packages/backend/auth-service

# Create test file
# packages/backend/auth-service/tests/auth.test.js
```

**Tests to Write:**
1. User registration (valid data)
2. User registration (duplicate email)
3. User login (valid credentials)
4. User login (invalid credentials)
5. Get profile (with JWT)
6. Get profile (without JWT)
7. Update profile
8. Change password
9. Request password reset
10. Verify JWT

**Target:** 50%+ test coverage

**Files to Create:**
- `tests/auth.test.js`
- `tests/setup.js` (MongoDB Memory Server)

---

### 🎯 Day 2: Payment Service Implementation

#### Morning (3-4 hours)
**Task 2.1: Create Payment Models**

**File:** `packages/backend/payment-service/src/models/transaction.model.js`
```javascript
// Transaction model with all fields per PROMPT_02
```

**File:** `packages/backend/payment-service/src/models/subscription.model.js`
```javascript
// Subscription model with all fields per PROMPT_02
```

**Checklist:**
- [ ] Transaction model (9 fields)
- [ ] Subscription model (8 fields)
- [ ] Proper indexes
- [ ] Validation
- [ ] Export in `models/index.js`

#### Afternoon (3-4 hours)
**Task 2.2: Create Payment Controllers**

**File:** `packages/backend/payment-service/src/controllers/payment.controller.js`

**Methods to implement:**
1. `purchase` - Buy a course
2. `subscribe` - Subscribe to a plan
3. `handleStripeWebhook` - Process Stripe events
4. `getTransactions` - List user transactions
5. `getActiveSubscription` - Get active subscription
6. `requestRefund` - Request refund
7. `getUserEntitlements` - Get user's access rights

**Checklist:**
- [ ] All 7 methods implemented
- [ ] Stripe integration (test mode)
- [ ] Error handling
- [ ] Validation

---

### 🎯 Day 3: Payment Service Completion

#### Morning (3-4 hours)
**Task 3.1: Payment Routes & Middleware**

**File:** `packages/backend/payment-service/src/routes/payment.routes.js`
```javascript
// 7 routes with proper validation
```

**File:** `packages/backend/payment-service/src/middleware/stripe.js`
```javascript
// Stripe webhook signature validation
```

**Checklist:**
- [ ] 7 routes defined
- [ ] Joi validation schemas
- [ ] Stripe middleware
- [ ] Auth middleware integration

#### Afternoon (3-4 hours)
**Task 3.2: Test Payment Service**

```bash
cd packages/backend/payment-service
npm install stripe
npm run dev

# Test endpoints
curl http://localhost:3003/api/v1/health
```

**Tests:**
1. Create purchase transaction
2. Create subscription
3. Get transactions
4. Test webhook (use Stripe CLI)
5. Test refund

**Checklist:**
- [ ] All endpoints respond
- [ ] Stripe test mode works
- [ ] Webhook processes correctly
- [ ] Database updates correctly

---

### 🎯 Day 4: AI Service Implementation (Python)

#### Morning (3-4 hours)
**Task 4.1: Setup FastAPI Project**

```bash
cd packages/backend/ai-service

# Create structure
mkdir -p app/{routes,services,models}
```

**File:** `app/main.py`
```python
from fastapi import FastAPI
from app.routes import recommendations, quiz, chat

app = FastAPI(title="Har Academy AI Service")

app.include_router(recommendations.router)
app.include_router(quiz.router)
app.include_router(chat.router)
```

**File:** `requirements.txt`
```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.4.2
httpx==0.25.0
python-dotenv==1.0.0
```

**Checklist:**
- [ ] FastAPI setup
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Health endpoint works

#### Afternoon (3-4 hours)
**Task 4.2: Implement Basic AI Endpoints**

**File:** `app/routes/recommendations.py`
```python
@router.post("/ai/recommendations")
async def get_recommendations(user_id: str):
    # Simple logic: recommend courses based on user's domain
    pass
```

**File:** `app/routes/quiz.py`
```python
@router.post("/ai/generate-quiz")
async def generate_quiz(content: str, num_questions: int):
    # Pattern-based quiz generation
    pass
```

**File:** `app/routes/chat.py`
```python
@router.post("/ai/chat")
async def chat(message: str, course_id: str):
    # Simple FAQ matching
    pass
```

**Checklist:**
- [ ] 5 endpoints implemented
- [ ] Simple recommendation logic
- [ ] Pattern-based quiz generator
- [ ] FAQ chatbot
- [ ] Tests pass

---

### 🎯 Day 5: API Gateway Implementation

#### Morning (3-4 hours)
**Task 5.1: Setup Routing**

**File:** `packages/backend/api-gateway/src/routes/index.js`
```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Auth Service
router.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true
}));

// Course Service
router.use('/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL,
  changeOrigin: true
}));

// Payment Service
router.use('/payment', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true
}));

// AI Service
router.use('/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL,
  changeOrigin: true
}));

module.exports = router;
```

**Checklist:**
- [ ] Install `http-proxy-middleware`
- [ ] Route to Auth Service
- [ ] Route to Course Service
- [ ] Route to Payment Service
- [ ] Route to AI Service

#### Afternoon (3-4 hours)
**Task 5.2: Middleware & Security**

**File:** `packages/backend/api-gateway/src/middleware/jwt.js`
```javascript
// JWT validation by calling Auth Service
```

**File:** `packages/backend/api-gateway/src/middleware/rateLimit.js`
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5 // 5 requests
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100 // 100 requests
});
```

**Checklist:**
- [ ] JWT middleware
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Request logging
- [ ] Error handling

---

### 🎯 Day 6-7: Testing

#### Day 6: Unit Tests
**Targets:**
- [ ] Auth Service: 80%+ coverage
- [ ] Course Service: 80%+ coverage
- [ ] Payment Service: 80%+ coverage
- [ ] AI Service: 70%+ coverage

**Tools:**
- Jest + Supertest (Node.js)
- Pytest (Python)
- MongoDB Memory Server

**Test Structure:**
```javascript
describe('Auth Service', () => {
  describe('POST /register', () => {
    it('should create user with valid data', async () => {});
    it('should reject duplicate email', async () => {});
    it('should validate password strength', async () => {});
  });

  describe('POST /login', () => {
    it('should login with valid credentials', async () => {});
    it('should reject invalid credentials', async () => {});
    it('should update last_login_at', async () => {});
  });
});
```

#### Day 7: Integration Tests
**Test Scenarios:**
1. **User Registration → Enrollment → Payment → Access**
```javascript
it('should allow full user journey', async () => {
  // 1. Register user
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);

  const token = registerRes.body.data.token;

  // 2. Browse courses
  const coursesRes = await request(app)
    .get('/api/v1/courses')
    .set('Authorization', `Bearer ${token}`);

  const courseId = coursesRes.body.data.courses[0]._id;

  // 3. Purchase course
  const purchaseRes = await request(app)
    .post('/api/v1/payment/purchase')
    .set('Authorization', `Bearer ${token}`)
    .send({ course_id: courseId });

  // 4. Enroll in course
  const enrollRes = await request(app)
    .post(`/api/v1/courses/${courseId}/enroll`)
    .set('Authorization', `Bearer ${token}`);

  expect(enrollRes.status).toBe(200);
});
```

2. **Instructor Creates Course → Publishes → Student Enrolls**
3. **User Gets Recommendations → Enrolls in Recommended Course**
4. **User Completes Lessons → Progress Tracked → Certificate Issued**

---

### 🎯 Day 8: Final Integration & Documentation

#### Morning (3-4 hours)
**Task 8.1: Docker Compose Full Test**

```bash
# Build all services
docker compose build

# Start everything
docker compose up -d

# Check all services healthy
docker compose ps

# Run integration tests against Docker
npm run test:integration
```

**Checklist:**
- [ ] All 9 containers start
- [ ] All services healthy
- [ ] Database connections work
- [ ] Service-to-service communication works
- [ ] API Gateway routes correctly

#### Afternoon (3-4 hours)
**Task 8.2: Documentation**

**Files to Create/Update:**
1. **API Documentation (OpenAPI/Swagger)**
   - `docs/api-spec.yaml`

2. **Postman Collection**
   - `docs/Har-Academy-API.postman_collection.json`

3. **README Updates**
   - Update each service README
   - Add deployment instructions

4. **Testing Guide**
   - `docs/TESTING_GUIDE.md`

5. **Deployment Guide**
   - `docs/DEPLOYMENT.md`

**Checklist:**
- [ ] OpenAPI spec complete
- [ ] Postman collection exported
- [ ] All READMEs updated
- [ ] Testing guide created
- [ ] Deployment guide created

---

## 📊 Completion Checklist

### Services
- [x] Auth Service (90%)
- [ ] Course Service (verify endpoints)
- [ ] Payment Service (implement)
- [ ] AI Service (implement)
- [ ] API Gateway (implement)

### Testing
- [ ] Auth Service tests (80%+)
- [ ] Course Service tests (80%+)
- [ ] Payment Service tests (80%+)
- [ ] AI Service tests (70%+)
- [ ] Integration tests (5+ scenarios)

### Documentation
- [x] Architecture docs
- [x] API contracts
- [ ] OpenAPI spec
- [ ] Postman collection
- [ ] Testing guide
- [ ] Deployment guide

### Infrastructure
- [x] Docker Compose config
- [x] Dockerfiles for all services
- [x] MongoDB setup (3 instances)
- [x] Redis setup
- [ ] Environment variables documented

---

## 🎯 Success Criteria

**Phase 1 is COMPLETE when:**

✅ **Functionality**
- [ ] All 40+ endpoints implemented and working
- [ ] All services communicate correctly
- [ ] Full user journey works (register → enroll → learn → complete)
- [ ] Payment flow works (with Stripe test mode)
- [ ] AI recommendations work (basic)

✅ **Quality**
- [ ] 80%+ test coverage (backend services)
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Proper error handling everywhere
- [ ] Logging implemented

✅ **Documentation**
- [ ] API docs complete (OpenAPI)
- [ ] README for each service
- [ ] Testing guide
- [ ] Deployment guide

✅ **DevOps**
- [ ] Docker Compose starts all services
- [ ] All services healthy
- [ ] Can deploy locally with one command
- [ ] Environment variables documented

---

## 📝 Daily Standup Format

Use this template for daily progress tracking:

```markdown
### Day X Progress

**Completed:**
- [ ] Task 1
- [ ] Task 2

**In Progress:**
- [ ] Task 3 (50%)

**Blocked:**
- [ ] Issue with X (need Y to proceed)

**Next:**
- [ ] Task 4
- [ ] Task 5

**Notes:**
- Learning: ...
- Challenges: ...
```

---

## 🚀 Quick Start for Each Day

```bash
# Day 1: Verify Course Service
cd packages/backend/course-service && npm run dev

# Day 2-3: Payment Service
cd packages/backend/payment-service && npm run dev

# Day 4: AI Service
cd packages/backend/ai-service && uvicorn app.main:app --reload

# Day 5: API Gateway
cd packages/backend/api-gateway && npm run dev

# Day 6-7: Tests
npm test

# Day 8: Integration
docker compose up -d && npm run test:integration
```

---

## 🎉 Upon Completion

**You will have:**
- ✅ Fully functional LMS backend
- ✅ 40+ RESTful API endpoints
- ✅ MongoDB with 10+ collections
- ✅ Microservices architecture
- ✅ 80%+ test coverage
- ✅ Complete documentation
- ✅ Ready for Phase 2 (Frontend)

**Celebration Tasks:**
1. ✅ Take a screenshot of `docker compose ps` (all green)
2. ✅ Run full test suite and save coverage report
3. ✅ Create a demo video of the API
4. ✅ Update project status to "Backend Complete"

---

**Ready to start? Begin with Day 1!**

See: [RUN_ALL_SERVICES.md](RUN_ALL_SERVICES.md) to get started
