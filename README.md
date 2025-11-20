# 📚 Har Academy LMS - Projet Complet

**Un LMS B2B2C professionnel avec authentification, cours vidéo, paiements et IA intégrée.**

---

## 🎯 Vue d'Ensemble du Projet

**Objectif:** Construire une plateforme d'apprentissage en ligne comparable à Great Learning

**Stack Principal:**
- **Frontend:** React 18+ / Vue 3+
- **Backend:** Node.js (Express) / Python (FastAPI)
- **Database:** MongoDB 5.0+
- **Infrastructure:** Docker + Docker Compose
- **AI/ML:** Python, Vector DB (ChromaDB), LLM (Claude/GPT)

**Domaines Focus:** Excel, R, Python (Data Analysis)

**Modèle Économique:** Hybrid (Free + Premium + Subscription)

---

## 📋 Structure des Fichiers de Direction

### 4 Prompts Améliorés pour Agents IA

| Fichier | Agent | Phase | Durée | Niveau |
|---------|-------|-------|-------|--------|
| **PROMPT_01_ARCHITECTURE_GENERALE.md** | Architecte | 0 | 2-3j | 🔴 Critique |
| **PROMPT_02_BACKEND_ET_DATA.md** | Backend Dev | 1 | 5-7j | 🔴 Critique |
| **PROMPT_03_FRONTEND_ET_UX_UI.md** | Frontend Dev | 2 | 5-7j | 🟡 Élevé |
| **PROMPT_04_AGENTS_IA_PEDAGOGIQUE.md** | ML/IA Specialist | 4 | 5-7j | 🟡 Élevé |

### 3 Fichiers d'Aide & Support

| Fichier | Purpose | Audience |
|---------|---------|----------|
| **STANDARDS_ET_CONVENTIONS.md** | Normes de code, conventions nommage | Tous les agents |
| **CHECKLIST_VALIDATION.md** | Validation finale par phase | Chef de projet |
| **GUIDE_DE_COORDINATION.md** | Workflows inter-agents | Tous |

---

## 🚀 Comment Utiliser Ce Project

### Step 1: Préparation (5 min)
```
1. Lire ce README en entier
2. Compréhension générale: 4 phases + 4 agents
3. Each agent reads their corresponding PROMPT file
```

### Step 2: Phase 0 - Architecture (Jour 1-3)
```bash
1. Brief Agent Architecte:
   "Lis PROMPT_01_ARCHITECTURE_GENERALE.md"
   "Crée la structure monorepo + Docker setup"
   
2. Agent génère:
   ✓ docker-compose.yml (6 services)
   ✓ Tous les Dockerfiles
   ✓ Architecture diagrams
   ✓ docs/ARCHITECTURE.md
   
3. Validate:
   docker-compose up -d
   All 6 services running ✓
   
4. Git commit: "Phase 0: Architecture setup"
```

### Step 3: Phase 1 - Backend (Semaine 1-2)
```bash
1. Brief Agent Backend:
   "Lis PROMPT_02_BACKEND_ET_DATA.md"
   "Lire STANDARDS_ET_CONVENTIONS.md"
   "Implémenter 40+ API endpoints"
   
2. Agent génère:
   ✓ 4 services complets (Auth, Course, Payment, AI)
   ✓ MongoDB collections + indexes
   ✓ 40+ endpoints testés
   ✓ Tests (80%+ coverage)
   ✓ API documentation
   
3. Validate via CHECKLIST_VALIDATION.md
   
4. Git commit: "Phase 1: Backend API complete"
```

### Step 4: Phase 2 - Frontend (Semaine 2-3)
```bash
1. Brief Agent Frontend:
   "Lis PROMPT_03_FRONTEND_ET_UX_UI.md"
   "Backend ready on localhost:8000"
   "Implémenter 9+ pages + components"
   
2. Agent génère:
   ✓ React/Vue app
   ✓ 9+ pages (landing, auth, courses, etc)
   ✓ 20+ components
   ✓ API integration
   ✓ i18n (FR/EN)
   ✓ Responsive design
   ✓ Tests (70%+ coverage)
   
3. Validate via CHECKLIST_VALIDATION.md
   
4. Git commit: "Phase 2: Frontend UI complete"
```

### Step 5: Phase 3 - Integration Testing (Jour 28-29)
```bash
1. Run full system tests:
   Signup → Login → Dashboard → Courses → Enroll → Learn
   
2. Validate:
   ✓ No errors in logs
   ✓ Data persists
   ✓ Response times < 1s
   
3. Git commit: "Phase 3: Full integration testing"
```

### Step 6: Phase 4 - AI (Semaine 4-5)
```bash
1. Brief Agent ML/IA:
   "Lis PROMPT_04_AGENTS_IA_PEDAGOGIQUE.md"
   "Backend running with course data"
   "Implémenter 5 endpoints AI"
   
2. Agent génère:
   ✓ Recommendation engine
   ✓ Quiz generator
   ✓ RAG + Chatbot
   ✓ Vector DB populated
   ✓ Tests (70%+ coverage)
   
3. Validate via CHECKLIST_VALIDATION.md
   
4. Git commit: "Phase 4: AI services complete"
```

---

## 📊 Timeline & Milestones

```
Week 1:
  Mon-Wed: Phase 0 (Architecture) ✓
  Thu-Sun: Phase 1 (Backend) begins

Week 2-3:
  Phase 1 (Backend) continues ✓
  Phase 2 (Frontend) begins in parallel

Week 4:
  Phase 2 (Frontend) continues ✓
  Phase 3 (Integration) starts
  Phase 4 (AI) can start

Week 5:
  Phase 4 (AI) continues ✓
  Final validation
  Ready for deployment

TOTAL: 5 weeks for MVP
```

---

## 🛠️ Technology Stack Summary

### Frontend
- React 18 + Next.js 14 (or Vite)
- Tailwind CSS 3
- React Query, Zustand
- i18n (i18next)
- Video.js
- Tests: Jest + React Testing Library

### Backend
- Node.js 18 (LTS)
- Express.js 4.18
- MongoDB 5.0 (driver: mongoose or native)
- JWT + bcryptjs
- Rate limiting, logging (Winston)
- Tests: Jest + Supertest

### AI Service
- Python 3.10+
- FastAPI
- ChromaDB (Vector DB)
- HuggingFace embeddings
- Claude/OpenAI API
- scikit-learn (recommendations)

### Infrastructure
- Docker 20.10+
- Docker Compose 2.0+
- MongoDB in container
- Redis in container

---

## 📁 Final Project Structure

```
har-academy/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── i18n/
│   │   │   └── ...
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   ├── backend/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── course-service/
│   │   ├── payment-service/
│   │   └── ai-core-service/
│   │       └── [Each service has same structure]
│   │           ├── src/
│   │           ├── tests/
│   │           ├── package.json
│   │           ├── Dockerfile
│   │           └── README.md
│   │
│   └── shared/
│       ├── types/
│       ├── constants/
│       └── utils/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md (this file)
│
├── PROMPT_01_ARCHITECTURE_GENERALE.md
├── PROMPT_02_BACKEND_ET_DATA.md
├── PROMPT_03_FRONTEND_ET_UX_UI.md
├── PROMPT_04_AGENTS_IA_PEDAGOGIQUE.md
├── STANDARDS_ET_CONVENTIONS.md
├── CHECKLIST_VALIDATION.md
└── GUIDE_DE_COORDINATION.md
```

---

## ✅ Success Criteria (Project Complete)

**Project is DONE when all are TRUE:**

- ✅ All 4 phases complete
- ✅ 40+ backend endpoints working
- ✅ 9+ frontend pages implemented
- ✅ 5 AI endpoints working
- ✅ Full user flow: Signup → Learn → Certificate
- ✅ i18n complete (FR/EN)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Tests passing (Backend 80%, Frontend 70%, AI 70%)
- ✅ Lighthouse audit ≥ 90 (performance, accessibility)
- ✅ Database properly indexed
- ✅ Logging & error handling complete
- ✅ Documentation complete
- ✅ Ready for cloud deployment

---

## 📞 Communication & Support

### For Agents (During Development)

**Questions about requirements?**
- Read PROMPT_XX file
- Read STANDARDS_ET_CONVENTIONS.md
- Check GUIDE_DE_COORDINATION.md

**How to validate work?**
- Use CHECKLIST_VALIDATION.md
- Run tests before committing
- Ensure no console errors

**How to integrate with other agents?**
- Read GUIDE_DE_COORDINATION.md
- Read docs/API_CONTRACTS.md
- Commit messages explain changes

### For Project Manager

**Tracking Progress?**
- Week 1: Phase 0 DONE
- Week 2: Phase 1 ✓ Phase 2 starts
- Week 3: Phase 2 ✓ Phase 3 starts
- Week 4: Phase 3 ✓ Phase 4 starts
- Week 5: Phase 4 ✓ READY

**Quality Assurance?**
- Each phase has CHECKLIST_VALIDATION.md
- Tests must pass before next phase
- Code review via git commits

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone repository
git clone <repo-url>
cd har-academy

# 2. Setup environment
cp .env.example .env.local

# 3. Start services
docker-compose up -d

# 4. Verify all services running
docker-compose ps

# 5. Run seeds (add sample data)
docker-compose exec backend npm run seed

# 6. Start frontend development
cd packages/frontend
npm install
npm run dev
# Frontend: http://localhost:3000

# 7. Backend running on
# http://localhost:8000

# 8. Test signup
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `docs/ARCHITECTURE.md` | System design, C4 diagrams |
| `docs/API_CONTRACTS.md` | All API endpoint contracts |
| `docs/SETUP.md` | Local development setup |
| `docs/DEPLOYMENT.md` | Cloud deployment instructions |
| Each service `README.md` | Service-specific docs |

---

## 🎯 Key Features by Phase

### Phase 0: Foundation
- Monorepo structure
- Docker orchestration
- Architecture diagrams

### Phase 1: Backend
- User authentication (JWT)
- Course catalog management
- Payment processing
- Enrollment system
- Progress tracking

### Phase 2: Frontend
- Landing page
- User authentication UI
- Course browsing & filtering
- Learning space with video player
- User dashboard
- Responsive design

### Phase 3: Integration
- End-to-end workflows
- Data persistence
- Error handling
- Performance validation

### Phase 4: AI
- Course recommendations
- Quiz auto-generation
- AI chatbot support
- RAG system

---

## 🔐 Security Considerations

- JWT tokens with RS256 signature (production)
- Passwords hashed with bcryptjs (salt rounds 10)
- Rate limiting on auth endpoints (5 attempts/10 min)
- Input validation on all endpoints
- CORS configured for frontend
- No secrets in code (all in .env)
- HTTPS in production (add later)

---

## 📈 Performance Targets

- **Page load:** < 2.5 seconds (LCP)
- **API response:** < 1 second
- **Database queries:** Indexed for performance
- **Lighthouse:** ≥ 90 (Performance, Accessibility, Best Practices, SEO)

---

## 🤝 Contributing

All code must:
1. Follow STANDARDS_ET_CONVENTIONS.md
2. Pass tests before commit
3. Have proper error handling
4. Be documented (README, JSDoc, comments)
5. Include git commit message explaining changes

---

## 📄 License

[Add your license here]

---

## ✨ Final Notes

**This is a complete, production-ready project template.**

- Each agent has clear, detailed prompts
- Standards documented
- Validation checklists provided
- Workflows coordinated

**Expected Outcome:**
A fully functional LMS platform built collaboratively by AI agents, ready for real-world deployment and user adoption.

**Questions?** Reference:
1. Your PROMPT_XX file
2. STANDARDS_ET_CONVENTIONS.md
3. GUIDE_DE_COORDINATION.md
4. CHECKLIST_VALIDATION.md

---

**Ready? Start with Phase 0! 🚀**