# CHECKLIST_VALIDATION.md

## ✅ Validation Finale par Phase & Agent

**Utiliser cette checklist pour valider que chaque livrable est complet et de qualité.**

---

## PHASE 1: Architecture Générale (Agent Architecte)

### Code & Structure
- [ ] `docker-compose.yml` avec 6 services (postgres, redis, api-gateway, auth, course, payment, ai)
- [ ] Tous les Dockerfiles créés (7 fichiers)
- [ ] Structure monorepo complète:
  ```
  packages/backend/
  ├── api-gateway/
  ├── auth-service/
  ├── course-service/
  ├── payment-service/
  ├── ai-core-service/
  └── shared/
  packages/frontend/
  shared/
  docs/
  ```
- [ ] `.env.example` avec toutes les variables (minimum 20 variables)
- [ ] `.gitignore` approprié
- [ ] `README.md` root avec setup instructions

### Documentation
- [ ] `docs/ARCHITECTURE.md` (min 2000 mots) avec:
  - [ ] Vue d'ensemble des services
  - [ ] Diagramme C4 Level 1 (text ou image)
  - [ ] Diagramme C4 Level 2 (container diagram)
  - [ ] Data flow entre services
- [ ] `docs/API_CONTRACTS.md` avec contracts inter-services
- [ ] `docs/SETUP.md` avec setup local instructions détaillées
- [ ] Chaque service a un `README.md` propre

### Docker & Infrastructure
- [ ] `docker-compose up -d` démarre sans erreurs
- [ ] `docker-compose ps` affiche 6 services "healthy" ou "running":
  ```
  postgres       Up ... (healthy)
  redis         Up ... (healthy)
  api-gateway   Up ... (healthy)
  auth-service  Up ... (healthy)
  course-service Up ... (healthy)
  payment-service Up ... (healthy)
  ai-core-service Up ... (healthy)
  ```
- [ ] `docker-compose logs api-gateway` affiche "Server running on port 8000"
- [ ] MongoDB accessible: `docker-compose exec postgres mongo` (ou mongodb CLI)
- [ ] Redis accessible: `docker-compose exec redis redis-cli ping` → "PONG"
- [ ] Tous les services accessible via localhost:
  - [ ] http://localhost:8000/api/v1/health → 200 OK
  - [ ] http://localhost:3001/api/v1/health → 200 OK
  - [ ] http://localhost:3002/api/v1/health → 200 OK
  - [ ] http://localhost:3003/api/v1/health → 200 OK
  - [ ] http://localhost:5000/api/v1/health → 200 OK

### Configuration
- [ ] Tous les services peuvent se parler:
  - [ ] Test: `curl http://api-gateway:8000/api/v1/courses` → Route vers course-service
  - [ ] Test: `curl http://api-gateway:8000/api/v1/auth/profile` → Auth required
- [ ] Variables d'environnement fonctionnent:
  - [ ] `DB_URL` utilisé correctement dans chaque service
  - [ ] `JWT_SECRET` configuré et utilisé
  - [ ] `REDIS_URL` configuré
- [ ] MongoDB collections créées (ou seront créées par migrations):
  - [ ] users
  - [ ] courses
  - [ ] modules
  - [ ] lessons
  - [ ] enrollments

### Tests & Validation
- [ ] `git init` et `.git` existe
- [ ] Aucun secret hardcodé (tous en .env.example)
- [ ] `docker-compose down` arrête tous les services
- [ ] Fresh start: `docker-compose up -d && sleep 5 && docker-compose ps` → Tous running

### Livrables à Soumettre
```
1. Entire folder structure (git repo)
2. docker-compose.yml
3. docs/ARCHITECTURE.md
4. docs/API_CONTRACTS.md
5. docs/SETUP.md
6. .env.example
7. README.md
8. All 7 Dockerfiles
```

---

## PHASE 2: Backend & Data (Agent Backend)

### Code Structure
- [ ] Chaque service a sa structure:
  ```
  auth-service/
  ├── src/
  │   ├── config/
  │   ├── models/
  │   ├── routes/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── services/
  │   ├── utils/
  │   └── index.js
  ├── tests/
  ├── .env.example
  ├── package.json
  ├── Dockerfile
  └── README.md
  ```
- [ ] `package.json` avec tous les scripts:
  - [ ] `npm run dev` (développement)
  - [ ] `npm start` (production)
  - [ ] `npm test` (tests)
  - [ ] `npm run lint` (linting)
- [ ] ESLint + Prettier configurés
- [ ] No TypeScript (JavaScript pur)

### Endpoints Implémentés

#### Auth Service (15 endpoints)
- [ ] `POST /api/v1/auth/register` - Signup complet
- [ ] `POST /api/v1/auth/login` - Login avec JWT
- [ ] `POST /api/v1/auth/logout` - Logout
- [ ] `POST /api/v1/auth/refresh-token` - Token refresh
- [ ] `GET /api/v1/auth/profile` - Get profile (auth required)
- [ ] `PATCH /api/v1/auth/profile` - Update profile
- [ ] `POST /api/v1/auth/change-password` - Password change
- [ ] `POST /api/v1/auth/request-password-reset` - Email reset
- [ ] `POST /api/v1/auth/reset-password` - Confirm reset
- [ ] `GET /api/v1/auth/users/:id` - Public profile
- [ ] `GET /api/v1/auth/verify-jwt` - JWT verification
- [ ] `POST /api/v1/auth/rate-limit-test` (optionnel)
- [ ] Rate limiting actif (5 attempts / 10 min login)

#### Course Service (15+ endpoints)
- [ ] `GET /api/v1/courses` - List with filters/pagination
- [ ] `GET /api/v1/courses/:id` - Course details
- [ ] `GET /api/v1/courses/:id/lessons` - List lessons
- [ ] `GET /api/v1/courses/:id/lessons/:lessonId` - Lesson content
- [ ] `POST /api/v1/courses` - Create (instructor only)
- [ ] `PATCH /api/v1/courses/:id` - Update (owner only)
- [ ] `POST /api/v1/courses/:id/publish` - Publish (owner only)
- [ ] `DELETE /api/v1/courses/:id` - Delete (owner only)
- [ ] `POST /api/v1/courses/:id/modules` - Create module
- [ ] `POST /api/v1/courses/:id/modules/:moduleId/lessons` - Create lesson
- [ ] `PATCH /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId` - Update lesson
- [ ] `POST /api/v1/courses/:id/enroll` - Enroll user
- [ ] `GET /api/v1/enrollments` - User enrollments
- [ ] `PATCH /api/v1/courses/:id/lessons/:lessonId/progress` - Update progress
- [ ] `GET /api/v1/courses/:id/progress` - Get course progress

#### Payment Service (8 endpoints)
- [ ] `POST /api/v1/payment/purchase` - One-time purchase
- [ ] `POST /api/v1/payment/subscribe` - Subscribe to plan
- [ ] `POST /api/v1/payment/webhook/stripe` - Webhook handler
- [ ] `GET /api/v1/payment/transactions` - Transaction history
- [ ] `GET /api/v1/payment/subscriptions/active` - Active subscription
- [ ] `POST /api/v1/payment/refund/:id` - Request refund
- [ ] `GET /api/v1/payment/user/:userId/entitlements` - User access

#### AI Core Service (5 endpoints)
- [ ] `POST /api/v1/ai/recommendations` - Get recommendations
- [ ] `POST /api/v1/ai/generate-quiz` - Generate quiz from content
- [ ] `POST /api/v1/ai/chat` - Chat with course AI
- [ ] `GET /api/v1/ai/chat/history/:id` - Chat history
- [ ] `DELETE /api/v1/ai/chat/history/:id` - Delete history

### Validation d'Endpoints
- [ ] Chaque endpoint testé avec `curl` ou Postman:
  ```bash
  # Exemple
  curl -X POST http://localhost:8000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
  ```
- [ ] Réponses cohérentes (même format):
  ```json
  { "success": true, "data": {...}, "error": null }
  ```
- [ ] Status codes corrects (200, 201, 400, 401, 404, etc)

### MongoDB & Database
- [ ] Toutes les collections créées:
  - [ ] users
  - [ ] courses
  - [ ] modules
  - [ ] lessons
  - [ ] enrollments
  - [ ] lesson_progress
  - [ ] transactions
  - [ ] subscriptions
  - [ ] quizzes
  - [ ] quiz_questions
- [ ] Schémas/validations en place:
  - [ ] Email unique dans users
  - [ ] Password min 8 chars, hashed
  - [ ] Course status enum
  - [ ] Enrollment unique (user_id, course_id)
- [ ] Indexes créés:
  - [ ] `db.courses.createIndex({instructor_id: 1})`
  - [ ] `db.users.createIndex({email: 1}, {unique: true})`
  - [ ] Minimum 10 indexes importants

### Authentication & Security
- [ ] JWT tokens générés et validés:
  - [ ] Payload contient user_id, email, role
  - [ ] TTL 24h access, 7j refresh
  - [ ] Signature HS256 ou RS256
- [ ] Passwords hashed (bcrypt, salt rounds 10)
- [ ] Rate limiting actif (5 login attempts / 10 min)
- [ ] CORS configured pour frontend
- [ ] Input validation sur TOUS les endpoints
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded secrets

### Testing
- [ ] Test files pour chaque service:
  - [ ] `__tests__/auth.test.js` (min 10 tests)
  - [ ] `__tests__/courses.test.js` (min 10 tests)
  - [ ] `__tests__/payments.test.js` (min 8 tests)
- [ ] `npm test` passe (0 failures)
- [ ] Coverage ≥ 80% (checked via jest coverage)
- [ ] Tests couvrent:
  - [ ] Happy path (success cases)
  - [ ] Error cases (validation, auth, not found)
  - [ ] Edge cases

### Logging & Errors
- [ ] Logging pour:
  - [ ] User signup/login (info level)
  - [ ] Course creation/update (info level)
  - [ ] Payment transactions (info level)
  - [ ] All errors (error level)
- [ ] Logger configuré (Winston ou similar)
- [ ] No console.log (use logger)
- [ ] Error messages informative but not exposing internals

### Documentation
- [ ] Chaque service a README.md avec:
  - [ ] Setup instructions
  - [ ] API endpoints list
  - [ ] Example requests/responses
  - [ ] Environment variables
- [ ] JSDoc comments sur fonctions critiques
- [ ] API documentation (Swagger optionnel, sinon markdown)

### Validation Final
- [ ] `docker-compose up -d && npm run migrate` exécute sans erreurs
- [ ] `npm run seed` ajoute données exemple (users, courses, etc)
- [ ] `npm run dev` démarre tous les services
- [ ] Health check: `curl http://localhost:8000/api/v1/health` → 200
- [ ] Can register: `curl -X POST http://localhost:8000/api/v1/auth/register ...` → 201
- [ ] Can login: `curl -X POST http://localhost:8000/api/v1/auth/login ...` → Token received
- [ ] Database populated avec données exemple (check avec MongoDB CLI)

### Livrables à Soumettre
```
1. Complete backend/ folder
2. All 4 services with code
3. All tests passing
4. docker-compose.yml updated
5. docs/API_CONTRACTS.md finalized
6. Each service has README.md
7. Seed data scripts
```

---

## PHASE 3: Frontend (Agent Frontend)

### Code Structure
- [ ] React/Vue app complète:
  ```
  frontend/
  ├── src/
  │   ├── pages/
  │   ├── components/
  │   ├── hooks/
  │   ├── context/
  │   ├── services/
  │   ├── utils/
  │   ├── i18n/
  │   └── App.jsx
  ├── public/
  ├── tests/
  ├── package.json
  ├── vite.config.js (ou next.config.js)
  └── README.md
  ```
- [ ] Tailwind CSS configuré et fonctionnel
- [ ] i18n setup (fr.json, en.json files)

### Pages Implémentées (9+ pages)
- [ ] Landing page (`/`)
  - [ ] Hero section
  - [ ] Featured courses
  - [ ] Testimonials
  - [ ] Pricing plans
  - [ ] Footer
- [ ] Signup page (`/signup`)
  - [ ] Form validation (email format, password strength)
  - [ ] Submit to backend
  - [ ] Success message + redirect
- [ ] Login page (`/login`)
  - [ ] Email + password inputs
  - [ ] Remember me checkbox
  - [ ] Error handling
  - [ ] Forgot password link
- [ ] Courses catalog (`/courses`)
  - [ ] List of courses (grid)
  - [ ] Filters working (domain, stack, price, rating)
  - [ ] Search functional
  - [ ] Pagination working
- [ ] Course details (`/courses/:id`)
  - [ ] 4 tabs: Overview, Curriculum, Reviews, Instructor
  - [ ] All tabs populated with data
  - [ ] Enroll button functional
  - [ ] Responsive layout
- [ ] Learning space (`/learn/:courseId`)
  - [ ] Video player embedded
  - [ ] Player controls working (play, pause, speed, fullscreen)
  - [ ] Lesson sidebar (navigation)
  - [ ] Mark as complete button
  - [ ] Quiz display (if lesson is quiz)
- [ ] Dashboard (`/dashboard`)
  - [ ] Welcome message
  - [ ] Stats cards displayed
  - [ ] Continue learning section
  - [ ] All courses section
- [ ] Profile page (`/profile`)
  - [ ] User info displayed
  - [ ] Can edit profile
  - [ ] Security settings
  - [ ] Preferences
- [ ] Instructor dashboard (`/instructor/dashboard`)
  - [ ] Stats cards
  - [ ] Course performance table
- [ ] Create course wizard (`/instructor/create`)
  - [ ] Multi-step form
  - [ ] All steps functional
  - [ ] Publish button works

### Components Implémentés
- [ ] Layout components:
  - [ ] Header/Navbar (sticky, logo, nav links)
  - [ ] Footer (links, copyright)
  - [ ] Sidebar (optional, for mobile drawer)
- [ ] Auth components:
  - [ ] LoginForm
  - [ ] SignupForm
  - [ ] GoogleAuthButton (if implemented)
- [ ] Course components:
  - [ ] CourseCard (responsive)
  - [ ] CourseGrid (grid layout)
  - [ ] CourseFilter (sidebar filters)
  - [ ] CourseSearch (search box)
- [ ] Player components:
  - [ ] VideoPlayer (Video.js integrated)
  - [ ] PlayerControls
  - [ ] LessonSidebar
- [ ] Common components:
  - [ ] Button (variants: primary, secondary)
  - [ ] Input (email, text, password)
  - [ ] Loading spinner
  - [ ] Error message
  - [ ] Badge/Tag
  - [ ] Modal (optional)
- [ ] 80%+ component coverage with tests

### API Integration
- [ ] Axios/fetch configured with base URL
- [ ] All endpoints called correctly:
  - [ ] Auth endpoints working (register, login, profile)
  - [ ] Course endpoints working (list, details, enroll)
  - [ ] Payment endpoints (if implemented)
- [ ] Error handling:
  - [ ] Show error messages on 4xx/5xx
  - [ ] Handle 401 → redirect to login
  - [ ] Retry logic for failed requests
- [ ] Loading states:
  - [ ] Show spinner while loading
  - [ ] Disable buttons during submit
  - [ ] Show "Loading..." text

### Internationalization (i18n)
- [ ] French translations complete:
  - [ ] All text translated to French
  - [ ] Navigation labels in French
  - [ ] Error messages in French
- [ ] English translations complete (parallel to FR)
- [ ] Language switcher working:
  - [ ] Click English/French → UI updates immediately
  - [ ] Language preference saved (localStorage)
- [ ] Check files:
  - [ ] `src/i18n/locales/fr.json` (1000+ keys)
  - [ ] `src/i18n/locales/en.json` (same structure)

### Responsive Design
- [ ] Mobile (< 768px):
  - [ ] No horizontal scroll
  - [ ] All buttons touchable (min 44x44px)
  - [ ] Sidebar collapses (hamburger menu)
  - [ ] Text readable (min 16px)
- [ ] Tablet (768px - 1024px):
  - [ ] 2-column layout where appropriate
  - [ ] Proper spacing
- [ ] Desktop (> 1024px):
  - [ ] Multi-column layouts
  - [ ] Optimal content width (max 1200px)
- [ ] Test on multiple devices:
  - [ ] Chrome DevTools (responsive mode)
  - [ ] Real mobile device (if available)
  - [ ] Lighthouse mobile audit ≥ 80

### Performance
- [ ] Images optimized:
  - [ ] Lazy loading implemented
  - [ ] Correct image formats (WebP where supported)
  - [ ] Correct sizes for different devices
- [ ] Code splitting:
  - [ ] Routes lazy-loaded (React.lazy)
  - [ ] Large components split
- [ ] Lighthouse audit:
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 90
  - [ ] Best Practices ≥ 90
  - [ ] SEO ≥ 90

### Accessibility
- [ ] WCAG 2.1 AA compliant:
  - [ ] Color contrast ≥ 4.5:1
  - [ ] All interactive elements keyboard accessible (Tab)
  - [ ] Focus indicators visible
  - [ ] Form labels properly associated
  - [ ] Alt text on all images
  - [ ] ARIA attributes where needed
- [ ] Tested with screen reader:
  - [ ] NVDA or VoiceOver
  - [ ] Can navigate and use site

### Testing
- [ ] Test files for components:
  - [ ] `__tests__/components/CourseCard.test.jsx`
  - [ ] `__tests__/pages/Dashboard.test.jsx`
  - [ ] Min 20 tests total
- [ ] `npm test` passes (0 failures)
- [ ] Coverage ≥ 70% (via Jest)

### Documentation
- [ ] README.md with:
  - [ ] Setup instructions (`npm install`, `npm run dev`)
  - [ ] Project structure explained
  - [ ] Available scripts
  - [ ] Environment variables needed
  - [ ] Deployment instructions
- [ ] Component documentation (Storybook optional)

### Final Validation
- [ ] `npm run dev` launches without errors
- [ ] http://localhost:3000 loads in browser
- [ ] Landing page displays beautifully
- [ ] Can signup/login flow
- [ ] Can browse courses
- [ ] Can view course details
- [ ] Video player works (if sample video exists)
- [ ] Language switcher changes UI to FR/EN
- [ ] No console errors (F12 → Console)
- [ ] No console warnings (except third-party)
- [ ] Mobile view looks good (F12 → Responsive mode)

### Livrables à Soumettre
```
1. Complete frontend/ folder
2. All pages implemented
3. All components created
4. Tests passing
5. Responsive design verified
6. i18n complete (FR + EN)
7. No console errors
```

---

## PHASE 4: AI Core Service (Agent ML/IA)

### Code Structure
- [ ] Python service complete:
  ```
  ai-core-service/
  ├── src/
  │   ├── config/
  │   ├── models/
  │   ├── services/
  │   ├── routes/
  │   ├── utils/
  │   └── main.py
  ├── tests/
  ├── requirements.txt
  ├── Dockerfile
  └── README.md
  ```
- [ ] FastAPI or Flask app

### Endpoints Implémentés (5+ endpoints)
- [ ] `POST /api/v1/ai/recommendations`
  - [ ] Takes user_id
  - [ ] Returns 3-5 course recommendations
  - [ ] Each with reason (why recommended)
  - [ ] Tested: curl returns proper JSON
- [ ] `POST /api/v1/ai/generate-quiz`
  - [ ] Takes content + num_questions
  - [ ] Returns quiz with 5-8 questions
  - [ ] Each question has options + correct answer
  - [ ] Tested: generates valid quiz
- [ ] `POST /api/v1/ai/chat`
  - [ ] Takes message + course_id
  - [ ] Returns reply based on course content
  - [ ] Cites sources (lesson references)
  - [ ] Refuses off-topic questions
- [ ] `GET /api/v1/ai/chat/history/:id`
  - [ ] Returns chat messages history
- [ ] `DELETE /api/v1/ai/chat/history/:id`
  - [ ] Deletes conversation history

### AI Logic
- [ ] Recommendation Engine:
  - [ ] Analyzes user progress
  - [ ] Scores courses (algorithm documented)
  - [ ] Returns top 3-5
  - [ ] Tested with different user profiles
- [ ] Quiz Generator:
  - [ ] Extracts key concepts from text
  - [ ] Generates questions (3 strategies used)
  - [ ] Creates distractors
  - [ ] Returns proper JSON structure
  - [ ] Generates 5-8 questions (configurable)
- [ ] RAG + Chatbot:
  - [ ] Vector DB populated with course content
  - [ ] Semantic search working (top-K retrieval)
  - [ ] LLM integration (Claude or GPT)
  - [ ] Guardrails preventing off-topic answers
  - [ ] Sources cited in responses

### Database & Vectors
- [ ] Vector DB (ChromaDB) running:
  - [ ] Data persists between restarts
  - [ ] Can add/search vectors
- [ ] Embeddings model loaded:
  - [ ] all-MiniLM-L6-v2 or similar
  - [ ] Generates embeddings correctly
- [ ] Course content ingested:
  - [ ] Lessons embedded
  - [ ] Metadata stored (lesson_id, course_id)
  - [ ] Can retrieve and search

### Error Handling
- [ ] All endpoints have try-catch
- [ ] Proper error responses:
  - [ ] 400 for bad input
  - [ ] 401 for auth required
  - [ ] 404 for not found
  - [ ] 500 for server errors
- [ ] Logging all errors + stack traces
- [ ] No exposing internal error details to client

### Performance
- [ ] Endpoints respond < 3s:
  - [ ] Recommendations: < 1s
  - [ ] Quiz generation: < 5s
  - [ ] Chat response: < 2s
- [ ] Memory usage stable (no leaks)
- [ ] Rate limiting:
  - [ ] AI endpoints limited (20 req/hour per user)

### Testing
- [ ] Test files:
  - [ ] `tests/test_recommendations.py`
  - [ ] `tests/test_quiz.py`
  - [ ] `tests/test_chatbot.py`
  - [ ] Min 15 tests total
- [ ] `pytest` passes (0 failures)
- [ ] Coverage ≥ 70%

### Documentation
- [ ] README.md with:
  - [ ] Service overview
  - [ ] Setup instructions
  - [ ] Environment variables
  - [ ] API endpoints
  - [ ] Example requests/responses
- [ ] Code documented (docstrings on functions)
- [ ] Architecture explained (RAG flow diagram)

### Docker & Deployment
- [ ] Dockerfile works:
  - [ ] `docker build -t ai-core .` succeeds
  - [ ] `docker run -p 5000:5000 ai-core` starts
- [ ] docker-compose includes ai-core service

### Final Validation
- [ ] `docker-compose up -d` starts AI service
- [ ] `docker-compose logs ai-core-service` shows startup messages
- [ ] Health check: `curl http://localhost:5000/api/v1/health` → 200
- [ ] Recommendation endpoint works: `curl -X POST http://localhost:5000/api/v1/ai/recommendations ...`
- [ ] Quiz generator works: `curl -X POST http://localhost:5000/api/v1/ai/generate-quiz ...`
- [ ] Chat works: `curl -X POST http://localhost:5000/api/v1/ai/chat ...`
- [ ] No errors in logs

### Livrables à Soumettre
```
1. Complete ai-core-service/ folder
2. All 5 endpoints working
3. Vector DB populated
4. Tests passing
5. Documentation complete
```

---

## 🎯 Final System Validation

**Après toutes les phases, validation d'intégration:**

- [ ] `docker-compose ps` affiche 7 services healthy
- [ ] Full signup → login → enroll → learn flow works
- [ ] Frontend connects à backend correctly
- [ ] All endpoints return proper responses
- [ ] Database persists data
- [ ] No errors in any service logs
- [ ] Performance acceptable
- [ ] Code properly documented
- [ ] Tests passing (all 3 services)

---

**Usage:** Copiez/collez cette checklist après chaque phase et markez les items ✅**