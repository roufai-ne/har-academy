# GUIDE_DE_COORDINATION.md

## 📊 Orchestration des Agents IA & Workflows

**Ce guide explique comment les agents IA travaillent ensemble pour construire Har Academy.**

---

## 🎯 Vue d'Ensemble du Projet

**Objectif:** Construire un LMS complet (B2B2C) avec:
- Authentification multi-rôle
- Catalogue dynamique de cours
- Apprentissage interactif
- Paiements intégrés
- Support IA personnalisé

**Timeline Total:** 8-12 semaines
**Agents Impliqués:** 4 (Architecture, Backend, Frontend, AI)

---

## 📋 Phases & Agents Assignés

| Phase | Agent | Durée | Dépendances | Output |
|-------|-------|-------|-------------|--------|
| **0: Architecture** | Agent Architecte | 2-3j | Aucune | Docker setup, Architecture docs |
| **1: Backend** | Agent Backend | 5-7j | Phase 0 ✓ | API complète, Services |
| **2: Frontend** | Agent Frontend | 5-7j | Phase 1 ✓ | UI/UX, Pages, Components |
| **3: Integration** | Chef Projet | 1-2j | Phase 1&2 ✓ | End-to-end tests |
| **4: AI** | Agent ML/IA | 5-7j | Phase 1 ✓ | Recommendations, Chatbot |

---

## 🔄 Phase 0: Architecture (Agent Architecte)

### Inputs
- Requirements: Monorepo, 4 microservices, MongoDB
- Tech stack: Node.js, Python, React, Docker
- Structure: B2B2C LMS

### Activités
1. **Initialiser Monorepo**
   - Créer structure folders
   - Setup Git
   - Create .env.example

2. **Configurer Docker**
   - Créer docker-compose.yml (6 services)
   - Créer 7 Dockerfiles
   - Tester local startup

3. **Documenter Architecture**
   - Diagrammes C4 (Level 1 & 2)
   - API contracts entre services
   - Data flow diagrams

4. **Livrables**
   - Complete folder structure
   - docker-compose.yml working
   - docs/ARCHITECTURE.md
   - docs/API_CONTRACTS.md

### Validation Checklist
- [ ] `docker-compose up -d` works
- [ ] All 6 services running
- [ ] Architecture docs complete
- [ ] All team members can clone & run locally

### Outputs pour Next Phase
```
LIVRABLE: Phase 0 Repo
├── docker-compose.yml ✓
├── packages/backend/ (empty, prêt pour agent)
├── packages/frontend/ (empty, prêt pour agent)
├── packages/shared/ ✓
├── docs/ ✓
└── .env.example ✓

STATUS: ✅ Architecte DONE → Agent Backend PEUT COMMENCER
```

---

## 🔄 Phase 1: Backend & Data (Agent Backend)

### Inputs
- Architecture setup from Phase 0 ✓
- Detailed requirements: Endpoints, Models, Flows
- MongoDB schema definitions
- Security requirements: JWT, Auth, Rate limiting

### Prérequis
- [ ] Lire PROMPT_02_BACKEND_ET_DATA.md entièrement
- [ ] Lire STANDARDS_ET_CONVENTIONS.md
- [ ] Comprendre structure monorepo
- [ ] Vérifier docker-compose running

### Activités Principales

#### 1. Setup des 4 Services
```
Pour chaque service (Auth, Course, Payment, AI):
1. Créer structure src/
2. Setup Express/FastAPI
3. Configure package.json
4. Setup error handling, logging
```

#### 2. MongoDB Models
```
Implémenter les 10 collections:
- users
- courses, modules, lessons
- enrollments, lesson_progress
- transactions, subscriptions
- quizzes, quiz_questions, quiz_attempts
```

#### 3. API Endpoints (40+ total)
```
Implémenter endpoints pour:
- Auth: 11 endpoints
- Courses: 15+ endpoints
- Payments: 7 endpoints
- AI: 5 endpoints (basic)
```

#### 4. Business Logic
```
- JWT token generation/validation
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- Error handling
- Logging
```

#### 5. Testing
```
Min 80% code coverage:
- Unit tests for services
- Integration tests for endpoints
- Error case testing
```

### Intégrations Requises
**AI Service setup (dépend de Backend):**
- Backend expose `/api/v1/courses` endpoint
- Backend expose `/api/v1/enrollments` endpoint
- AI Core peut appeler ces endpoints pour fetch contenu

### Validation & Handoff

**Before handing off to Frontend:**
- [ ] All 40+ endpoints working
- [ ] Database properly structured with indexes
- [ ] Tests passing (80%+ coverage)
- [ ] Documentation complete (API contracts)
- [ ] docker-compose can start all services
- [ ] Backend accessible from localhost:8000

**Commandes pour Frontend agent:**
```bash
# Vérifier backend marche
docker-compose up -d
curl http://localhost:8000/api/v1/health

# Signup
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# List courses
curl http://localhost:8000/api/v1/courses
```

### Outputs for Frontend Agent
```
LIVRABLE: Phase 1 Complete Backend
├── packages/backend/api-gateway/ ✓
├── packages/backend/auth-service/ ✓
├── packages/backend/course-service/ ✓
├── packages/backend/payment-service/ ✓
├── Docker containers running ✓
├── docs/API_CONTRACTS.md ✓
└── All endpoints tested ✓

STATUS: ✅ Backend DONE → Agent Frontend PEUT COMMENCER
```

---

## 🔄 Phase 2: Frontend (Agent Frontend)

### Inputs
- Working Backend from Phase 1 ✓
- Design requirements (responsive, accessible)
- i18n requirements (FR + EN)
- UI component specifications
- Detailed page requirements

### Prérequis
- [ ] Lire PROMPT_03_FRONTEND_ET_UX_UI.md
- [ ] Backend running on localhost:8000
- [ ] Test auth endpoints work
- [ ] Lire STANDARDS_ET_CONVENTIONS.md

### Activités Principales

#### 1. Project Setup
```
- Initialize React app
- Configure Tailwind CSS
- Setup i18n (fr.json, en.json)
- Configure axios for backend calls
```

#### 2. Implement 9+ Pages
```
Landing → Home
Auth → Login, Signup
Catalog → /courses (list + filters)
Details → /courses/:id
Learning → /learn/:courseId
Dashboard → /dashboard
Profile → /profile
Instructor → /instructor/dashboard, /instructor/create
```

#### 3. Components (20+ total)
```
Layout: Header, Footer, Sidebar
Auth: LoginForm, SignupForm
Courses: CourseCard, CourseGrid, CourseFilter, CourseSearch
Player: VideoPlayer, PlayerControls, LessonSidebar
Common: Button, Input, Loading, Badge, etc
```

#### 4. API Integration
```
Connect all components to Backend:
- Auth endpoints (register, login, profile)
- Course endpoints (list, details, enroll)
- Enrollment endpoints (get enrollments, progress)
- Payment endpoints (if implemented)
```

#### 5. Testing
```
- Component tests (70%+ coverage)
- E2E tests for auth flow
- Responsive design tests
- Accessibility tests
```

### Critical Requirements
- ✅ Responsive (mobile, tablet, desktop)
- ✅ i18n complete (FR/EN)
- ✅ WCAG 2.1 AA accessibility
- ✅ Lighthouse score ≥ 90
- ✅ No TypeScript
- ✅ Follow STANDARDS_ET_CONVENTIONS.md

### Validation & Handoff

**Before declaring Phase 2 DONE:**
- [ ] `npm run dev` works, no errors
- [ ] Landing page displays beautifully
- [ ] Auth flow complete (signup → login → dashboard)
- [ ] Can browse courses + filters
- [ ] Can view course details
- [ ] Video player works (if sample video)
- [ ] All pages responsive on mobile
- [ ] Language switcher works (FR ↔ EN)
- [ ] Lighthouse audit ≥ 90
- [ ] No console errors
- [ ] Tests passing (70%+ coverage)

### Frontend Can Now Talk To Backend
```
Flow Example:
1. User signup @ /signup
2. Frontend POST /api/v1/auth/register
3. Backend creates user in MongoDB
4. Returns JWT token
5. Frontend stores token
6. Frontend redirects to /dashboard
7. Dashboard calls GET /api/v1/enrollments
8. Backend fetches user's enrolled courses
9. Frontend displays courses
```

---

## 🔄 Phase 3: Integration & Testing (Chef Projet)

### Purpose
Valider que Frontend + Backend travaillent ensemble end-to-end

### Test Scenarios

**Scenario 1: User Signup → Dashboard**
```
1. Go to http://localhost:3000 (Frontend)
2. Click signup
3. Fill form: Email, Password, Name
4. Submit
5. Should redirect to login
6. Login with credentials
7. Should see dashboard with empty enrollments
```

**Scenario 2: Browse & Enroll in Course**
```
1. Click "Courses" in navbar
2. See course list (from Backend)
3. Click course card
4. See course details
5. Click "Enroll" button
6. Should be added to enrollments
7. Can access course lessons
8. Can play videos
```

**Scenario 3: Watch & Progress**
```
1. Enroll in course
2. Click lesson
3. Video player loads
4. Play video, pause, change speed
5. After watching, mark as complete
6. Progress updates in dashboard
```

### Validation Outputs
- [ ] All user flows tested
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Database shows correct data
- [ ] Response times acceptable

---

## 🔄 Phase 4: AI Core Service (Agent ML/IA)

### Inputs
- Working Backend from Phase 1 ✓
- Course catalog with lessons
- Vector DB requirements (ChromaDB)
- LLM integration (Claude or GPT)

### Can Start After Phase 1 (Parallel with Phase 2)

### Activités
1. **Ingest Course Content**
   - Call Backend to fetch lessons
   - Split into chunks
   - Generate embeddings
   - Store in Vector DB

2. **Implement 5 Endpoints**
   - Recommendations engine
   - Quiz generator
   - Chat/RAG system
   - History management

3. **Integration with Frontend**
   - Frontend calls `/api/v1/ai/recommendations`
   - Frontend calls `/api/v1/ai/chat` for chatbot
   - Frontend shows recommendations
   - Chatbot widget in learning space

### Validation
- [ ] Endpoints accessible
- [ ] Recommendations quality
- [ ] Quiz generation working
- [ ] Chat responds correctly
- [ ] Vector DB populated

---

## 📞 Communication Between Agents

### Synchronous Communication
**When:** Agent needs info from another

```
Example 1: Backend Agent needs Frontend requirements
→ Read PROMPT_03_FRONTEND_ET_UX_UI.md

Example 2: Frontend Agent needs API endpoints
→ Read docs/API_CONTRACTS.md from Backend Agent

Example 3: AI Agent needs course content structure
→ Read Course Service endpoint docs
```

### Asynchronous Communication
**Via Git commits + Documentation**

```
Backend Agent commits: "Phase 1: Backend API complete"
├── docs/API_CONTRACTS.md updated
├── README.md with curl examples
└── Tests passing

Frontend Agent pulls latest
├── Reads updated docs
├── Runs: curl http://localhost:8000/api/v1/courses
├── Tests integration
└── Commits: "Phase 2: Frontend UI complete"
```

### Issue Resolution
**If endpoints change:**
1. Backend Agent updates docs/API_CONTRACTS.md
2. Commits with message: `[BREAKING] Changed /api/v1/courses response`
3. Frontend Agent reads commit message
4. Updates frontend code
5. Commits: `[fix] Updated course API integration`

---

## 🚨 Critical Synchronization Points

### Checkpoint 1: After Phase 0 (Day 3)
```
Deliverables:
✓ docker-compose.yml works
✓ All 6 containers running
✓ Architecture docs complete

Team Action:
→ All agents clone & verify setup locally
→ Any blockers? Fix architecture issues
→ Backend Agent: Ready to start Phase 1
```

### Checkpoint 2: After Phase 1 (Week 2)
```
Deliverables:
✓ 40+ endpoints working
✓ Database with test data
✓ API contracts documented

Team Action:
→ Frontend Agent: Verify backend reachable
→ Run: curl http://localhost:8000/api/v1/courses
→ Any integration issues? Fix now
→ Frontend Agent: Start Phase 2
```

### Checkpoint 3: After Phase 2 (Week 4)
```
Deliverables:
✓ All pages implemented
✓ Frontend responsive
✓ Connected to Backend

Team Action:
→ Full integration testing
→ Auth flow working?
→ Course browsing working?
→ Any bugs? Fix before Phase 4
```

### Checkpoint 4: Final Validation (Week 5)
```
Deliverables:
✓ Full LMS working
✓ All tests passing
✓ Documentation complete
✓ Ready for deployment

Team Action:
→ Final quality checks
→ Performance audit
→ Security review
→ Deployment planning
```

---

## 🔧 Workflow: How Agents Stay Coordinated

### Daily Standup (If Multi-Agent Team)

```
Agent Architecte:
"Phase 0 complete. Docker setup ready. 
 Backend agent can start Phase 1."

Agent Backend:
"Phase 1 in progress. 30/40 endpoints done. 
 Frontend agent, expect API docs by tomorrow."

Agent Frontend:
"Waiting for Backend Phase 1. Will start UI once endpoints stable."

Agent ML/IA:
"Will start after Backend Phase 1 completes."
```

### Commit History Pattern

```
Week 1:
[Architecte] Phase 0: Project setup & Docker configuration
└─ Docker runs 6 services successfully

Week 2:
[Backend] Phase 1: Implement Auth Service - 8 endpoints
[Backend] Phase 1: Implement Course Service - 15 endpoints
[Backend] Phase 1: Implement Payment Service - 7 endpoints
[Backend] Phase 1: Add 80+ tests, all passing
[Backend] Phase 1: Complete API documentation
└─ Backend API ready for Frontend

Week 3:
[Frontend] Phase 2: Initialize React app + Tailwind setup
[Frontend] Phase 2: Implement landing & auth pages
[Frontend] Phase 2: Integrate with Backend auth endpoints
[Frontend] Phase 2: Implement course catalog & details
[Frontend] Phase 2: Implement learning space + video player
[Frontend] Phase 2: Add i18n (FR/EN)
└─ Frontend connected to Backend

Week 4:
[Integration] Full system test: signup → enroll → learn
[Integration] All tests passing, ready for AI phase

Week 5:
[AI] Phase 4: Setup Vector DB + embeddings
[AI] Phase 4: Implement recommendations engine
[AI] Phase 4: Implement quiz generator
[AI] Phase 4: Implement chatbot with RAG
└─ AI services integrated
```

---

## ✅ Quality Gates Between Phases

### Gate 0→1: Architecture ✓
**Must be true before Backend starts:**
- [ ] docker-compose.yml exists and works
- [ ] All 6 services container-aware
- [ ] Monorepo structure clear
- [ ] Architecture docs complete

### Gate 1→2: Backend ✓
**Must be true before Frontend starts:**
- [ ] All 40+ endpoints working
- [ ] Tests passing (80%+ coverage)
- [ ] API contracts documented
- [ ] Database indexed & optimized
- [ ] Error handling complete
- [ ] Backend accessible from localhost:8000

### Gate 2→3: Frontend ✓
**Must be true before Integration testing:**
- [ ] All 9+ pages implemented
- [ ] Responsive design verified
- [ ] Connected to Backend
- [ ] i18n complete (FR/EN)
- [ ] Tests passing (70%+ coverage)
- [ ] Lighthouse audit ≥ 90
- [ ] No console errors

### Gate 3→4: Integration ✓
**Must be true before AI services:**
- [ ] Full signup → login → dashboard flow works
- [ ] Course browsing works
- [ ] Enrollment works
- [ ] Payment flow integrated (if included)
- [ ] No data loss on restart
- [ ] All services can talk to each other

---

## 🎯 Success Criteria

**Project is DONE when:**
- ✅ Phase 0: Architecture setup complete
- ✅ Phase 1: Backend API fully implemented
- ✅ Phase 2: Frontend fully implemented  
- ✅ Phase 3: Full integration tested
- ✅ Phase 4: AI services working
- ✅ All tests passing (80% backend, 70% frontend)
- ✅ Documentation complete
- ✅ Lighthouse audit ≥ 90 (performance, accessibility)
- ✅ Ready for deployment to cloud

---

## 📁 Files Each Agent Should Have

### Phase 0 (Architecte)
```
har-academy/
├── PROMPT_01_ARCHITECTURE_GENERALE.md
├── STANDARDS_ET_CONVENTIONS.md
├── CHECKLIST_VALIDATION.md
├── GUIDE_DE_COORDINATION.md
└── docker-compose.yml
```

### Phase 1 (Backend)
```
har-academy/
├── PROMPT_02_BACKEND_ET_DATA.md
├── STANDARDS_ET_CONVENTIONS.md
├── CHECKLIST_VALIDATION.md
├── docs/API_CONTRACTS.md
└── packages/backend/
```

### Phase 2 (Frontend)
```
har-academy/
├── PROMPT_03_FRONTEND_ET_UX_UI.md
├── STANDARDS_ET_CONVENTIONS.md
├── CHECKLIST_VALIDATION.md
├── docs/API_CONTRACTS.md
└── packages/frontend/
```

### Phase 4 (AI)
```
har-academy/
├── PROMPT_04_AGENTS_IA_PEDAGOGIQUE.md
├── STANDARDS_ET_CONVENTIONS.md
├── CHECKLIST_VALIDATION.md
├── docs/API_CONTRACTS.md
└── packages/backend/ai-core-service/
```

---

## 🚀 Final Deployment Checklist

Once all phases complete:
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Database seeded with sample data
- [ ] All services tested together
- [ ] Performance acceptable
- [ ] Ready for cloud deployment

---

**This guide ensures all agents work in harmony toward a unified goal: A complete, production-ready LMS platform.**