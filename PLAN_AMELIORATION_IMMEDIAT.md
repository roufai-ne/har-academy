# 🚀 PLAN D'AMÉLIORATION HAR ACADEMY - Phase Immédiate

**Date**: 26 Novembre 2025  
**Score Actuel**: 88/100 (A-)  
**Objectif**: 95/100 (A+) en 15-20 jours

---

## ✅ ACTIONS COMPLÉTÉES (Aujourd'hui)

### 1. Système de Gestion de Cours Complet
- ✅ CRUD modules (Create, Read, Update, Delete)
- ✅ CRUD lessons (Create, Read, Update, Delete)
- ✅ Interface EditCourse fonctionnelle
- ✅ Gestion curriculum avec états d'édition inline
- ✅ Relations Module → Lesson correctement implémentées

### 2. Infrastructure Redis
- ✅ Redis ajouté dans docker-compose
- ✅ Client Redis créé (auth-service + course-service)
- ✅ Middleware cache implémenté
- ✅ Graceful degradation si Redis down

---

## 🔄 EN COURS (À installer maintenant)

### Installation Redis Dependencies
```bash
cd packages/backend/auth-service
npm install redis@^4.6.0

cd ../course-service
npm install redis@^4.6.0
```

### Intégrer Redis dans les services
- [ ] Auth service: Connecter Redis au démarrage
- [ ] Course service: Connecter Redis au démarrage
- [ ] Ajouter cache sur endpoints critiques:
  - GET /courses (cache 1h)
  - GET /courses/:id (cache 30min)
  - GET /auth/profile (cache 10min)

---

## 🎯 PRIORITÉS SEMAINE 1 (Cette Semaine)

### A. Tests Backend (7-10 jours) - CRITIQUE
**Objectif**: 0% → 80% coverage

#### Auth Service Tests (2 jours)
- [ ] `tests/unit/auth-service.test.js` - Compléter
- [ ] `tests/integration/register.test.js` - Créer
- [ ] `tests/integration/login.test.js` - Créer
- [ ] `tests/integration/profile.test.js` - Créer
- [ ] Coverage target: 85%

#### Course Service Tests (3 jours)
- [ ] `tests/unit/course-controller.test.js` - Compléter
- [ ] `tests/integration/create-course.test.js` - Créer
- [ ] `tests/integration/modules-lessons.test.js` - Créer
- [ ] `tests/integration/publish-course.test.js` - Créer
- [ ] `tests/integration/enrollment.test.js` - Créer
- [ ] Coverage target: 80%

#### Payment Service Tests (2 jours)
- [ ] `tests/unit/stripe-service.test.js` - Créer
- [ ] `tests/integration/purchase.test.js` - Créer
- [ ] `tests/integration/subscription.test.js` - Créer
- [ ] Coverage target: 75%

### B. Tests Frontend (3-5 jours)
**Objectif**: 0% → 70% coverage

#### Setup Testing Infrastructure (1 jour)
```bash
cd packages/frontend
npm install --save-dev @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  jsdom
```

#### Component Tests (2 jours)
- [ ] `src/components/__tests__/CourseCard.test.tsx`
- [ ] `src/components/__tests__/ModuleCard.test.tsx`
- [ ] `src/components/ui/__tests__/Button.test.tsx`
- [ ] Coverage target: 75%

#### Page Tests (2 jours)
- [ ] `src/pages/__tests__/Landing.test.tsx`
- [ ] `src/pages/__tests__/Courses.test.tsx`
- [ ] `src/pages/__tests__/Dashboard.test.tsx`
- [ ] Coverage target: 65%

---

## 🎯 PRIORITÉS SEMAINE 2-3 (Semaine Prochaine)

### C. AI Core Service (15-20 jours) - TRÈS CRITIQUE

#### 1. Système de Recommandation (5-7 jours)
**Fichiers à créer:**
```
packages/backend/ai-core-service/
├── src/
│   ├── main.py (FastAPI app)
│   ├── services/
│   │   └── recommendation_service.py
│   ├── models/
│   │   └── user_behavior.py
│   ├── utils/
│   │   └── db_connection.py
│   └── routes/
│       └── recommendations.py
├── requirements.txt
└── tests/
```

**Endpoints à implémenter:**
- [ ] `POST /api/v1/ai/recommendations` - Recommandations personnalisées
- [ ] `GET /api/v1/ai/recommendations/:userId` - Historique recommandations

**Algorithme:**
- Collaborative filtering (user-based)
- Content-based filtering (course metadata)
- Hybrid scoring system

#### 2. Génération Automatique de Quiz (3-5 jours)
**Dépendances:**
```
spacy
transformers
sentence-transformers
```

**Endpoints à implémenter:**
- [ ] `POST /api/v1/ai/generate-quiz` - Générer quiz depuis contenu
- [ ] `POST /api/v1/ai/generate-quiz-batch` - Batch pour cours complet

**Stratégies de questions:**
- Key term extraction (TF-IDF)
- Cloze test (fill-in-the-blank)
- Multiple choice factual

#### 3. Chatbot RAG (7-10 jours)
**Infrastructure:**
- [ ] Setup ChromaDB vector database
- [ ] Integration Claude/GPT API
- [ ] Embeddings generation (course content)

**Endpoints:**
- [ ] `POST /api/v1/ai/chat` - Conversation avec contexte
- [ ] `GET /api/v1/ai/chat/history/:conversationId` - Historique
- [ ] `DELETE /api/v1/ai/chat/history/:conversationId` - Clear

**RAG Pipeline:**
1. Embed user question
2. Search top-K relevant passages (ChromaDB)
3. Generate contextual answer (LLM)
4. Apply guardrails (on-topic only)

---

## 🔧 AMÉLIORATIONS TECHNIQUES (À faire)

### Documentation (2-3 jours)
- [ ] Créer `docs/ARCHITECTURE.md` avec diagrammes C4
- [ ] Créer `docs/API_DOCUMENTATION.md` avec tous les endpoints
- [ ] Compléter tous les `.env.example` avec descriptions
- [ ] Ajouter JSDoc/docstrings dans le code

### Features Manquantes (3-5 jours)
- [ ] Password reset avec email
- [ ] Refresh token logic avec Redis
- [ ] OAuth Google/GitHub (backend + frontend)
- [ ] Video.js player dans LearningSpace
- [ ] Système quiz complet (models + endpoints)
- [ ] Reviews CRUD complet

### Optimisations (1-2 jours)
- [ ] Ajouter indexes MongoDB sur clés critiques
- [ ] Setup HTTPS pour production
- [ ] Compression responses (gzip)
- [ ] Rate limiting granulaire par endpoint

---

## 📊 MÉTRIQUES DE SUCCÈS

| Métrique | Actuel | Objectif | Status |
|----------|--------|----------|--------|
| Score Global | 88/100 | 95/100 | 🟡 |
| Backend Tests | <10% | 80% | 🔴 |
| Frontend Tests | 0% | 70% | 🔴 |
| AI Service | 40/100 | 90/100 | 🔴 |
| Documentation | 50% | 90% | 🟡 |
| Features Complètes | 85% | 98% | 🟡 |

---

## 🚀 COMMANDES RAPIDES

### Démarrer tous les services
```bash
docker-compose up -d
cd packages/backend/auth-service && npm run dev
cd packages/backend/course-service && npm run dev
cd packages/backend/payment-service && npm run dev
cd packages/backend/api-gateway && npm start
cd packages/frontend && npm run dev
```

### Lancer les tests
```bash
# Backend
npm test --workspace=packages/backend/auth-service
npm test --workspace=packages/backend/course-service

# Frontend
cd packages/frontend && npm test
```

### Vérifier Redis
```bash
docker exec -it har-redis redis-cli
> PING
> KEYS cache:*
> GET cache:/courses
```

---

## 📝 NOTES

- **Redis**: Graceful degradation implémentée - services fonctionnent sans Redis
- **Tests**: Utiliser MongoDB Memory Server pour tests isolés
- **AI Service**: Commencer par recommandations (plus simple que chatbot)
- **Documentation**: Utiliser Swagger/OpenAPI pour API docs auto-générées

**Prochaine étape immédiate**: Installer les dépendances Redis et redémarrer les services.
