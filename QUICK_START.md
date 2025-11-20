# 🚀 Quick Start Guide - Har Academy

## Phase 0: Architecture ✅ COMPLÉTÉ

La Phase 0 (Architecture) est maintenant terminée ! Vous pouvez passer à la Phase 1.

---

## ⚡ Démarrage Rapide (5 minutes)

### 1. Vérifier les Prérequis

```bash
# Docker doit être installé et lancé
docker --version
# Docker version 20.10+ requis

# Docker Compose doit être disponible
docker compose version
# Docker Compose version v2.0+ requis
```

### 2. Cloner et Configurer

```bash
# Cloner le repo (si pas déjà fait)
git clone <your-repo-url>
cd har-academy

# Créer le fichier .env
cp .env.example .env

# Optionnel: Modifier les secrets dans .env
nano .env
```

### 3. Démarrer les Services de Base

```bash
# Démarrer uniquement les bases de données (pour développement)
docker compose up -d mongodb-auth mongodb-courses mongodb-payments redis

# Vérifier que tout est "healthy"
docker compose ps

# Devrait afficher:
# NAME                  STATUS
# har-mongodb-auth      Up (healthy)
# har-mongodb-courses   Up (healthy)
# har-mongodb-payments  Up (healthy)
# har-redis             Up (healthy)
```

### 4. Tester les Connexions

```bash
# Test MongoDB
docker exec -it har-mongodb-auth mongosh -u admin -p mongopassword --authenticationDatabase admin

# Dans le shell MongoDB:
> show dbs
> use har_auth
> db.test.insertOne({message: "Hello from Har Academy!"})
> exit

# Test Redis
docker exec -it har-redis redis-cli PING
# Devrait répondre: PONG
```

✅ **Si tout fonctionne → Vous êtes prêt pour Phase 1 !**

---

## 📂 Structure du Projet

```
har-academy/
├── 📁 packages/
│   ├── 📁 backend/
│   │   ├── auth-service/      ← Phase 1: À implémenter
│   │   ├── course-service/    ← Phase 1: À implémenter
│   │   ├── payment-service/   ← Phase 1: À implémenter
│   │   ├── ai-service/        ← Phase 4: À implémenter
│   │   └── api-gateway/       ← Phase 1: À implémenter
│   ├── 📁 frontend/           ← Phase 2: À implémenter
│   └── 📁 shared/             ← Partagé
├── 📁 docs/
│   ├── ARCHITECTURE.md        ✅ Complété
│   ├── API_CONTRACTS.md       ✅ Complété
│   ├── SETUP.md               ✅ Complété
│   └── PHASE_0_VALIDATION.md  ✅ Guide de validation
├── 🐳 docker-compose.yml      ✅ Configuré
├── 📄 .env.example            ✅ Variables définies
└── 📄 README.md               ✅ Documentation
```

---

## 🎯 Prochaines Étapes: Phase 1 (Backend)

### Objectif
Implémenter les 4 microservices backend avec MongoDB.

### Commencer Maintenant

```bash
# 1. Lire le prompt backend
cat PROMPT_02_BACKEND_ET_DATA.md

# 2. Lire les standards de code
cat STANDARDS_ET_CONVENTIONS.md

# 3. Commencer par Auth Service
cd packages/backend/auth-service
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv joi winston

# 4. Créer la structure
mkdir -p src/{config,models,routes,controllers,middleware,services,utils}

# 5. Implémenter selon PROMPT_02_BACKEND_ET_DATA.md
```

### Endpoints à Implémenter (Phase 1)

**Auth Service (11 endpoints):**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/profile
- PATCH /api/v1/auth/profile
- POST /api/v1/auth/change-password
- POST /api/v1/auth/request-password-reset
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/users/:id
- GET /api/v1/auth/verify-jwt
- POST /api/v1/auth/refresh-token

**Course Service (15+ endpoints):**
- GET /api/v1/courses
- GET /api/v1/courses/:id
- POST /api/v1/courses
- PATCH /api/v1/courses/:id
- DELETE /api/v1/courses/:id
- POST /api/v1/courses/:id/publish
- POST /api/v1/courses/:id/enroll
- GET /api/v1/enrollments
- POST /api/v1/courses/:id/modules
- POST /api/v1/courses/:id/modules/:module_id/lessons
- GET /api/v1/courses/:id/lessons
- GET /api/v1/courses/:id/lessons/:lesson_id
- PATCH /api/v1/courses/:id/lessons/:lesson_id/progress
- GET /api/v1/courses/:id/progress
- ...et plus

**Payment Service (7 endpoints):**
- POST /api/v1/payment/purchase
- POST /api/v1/payment/subscribe
- POST /api/v1/payment/webhook/stripe
- GET /api/v1/payment/transactions
- GET /api/v1/payment/subscriptions/active
- POST /api/v1/payment/refund/:transaction_id
- GET /api/v1/payment/user/:user_id/entitlements

**AI Service (5 endpoints - basic):**
- POST /api/v1/ai/recommendations
- POST /api/v1/ai/generate-quiz
- POST /api/v1/ai/chat
- GET /api/v1/ai/chat/history
- DELETE /api/v1/ai/chat/history

**Total: 40+ endpoints à implémenter**

---

## 📚 Documentation Importante

| Document | Description | Quand le lire |
|----------|-------------|---------------|
| [PROMPT_02_BACKEND_ET_DATA.md](PROMPT_02_BACKEND_ET_DATA.md) | Spécifications Backend complètes | **Maintenant** (Phase 1) |
| [STANDARDS_ET_CONVENTIONS.md](STANDARDS_ET_CONVENTIONS.md) | Normes de code et conventions | **Maintenant** |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture système | Référence |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | Contrats API | Référence |
| [GUIDE_DE_COORDINATION.md](GUIDE_DE_COORDINATION.md) | Coordination entre agents | Si multi-agents |
| [PHASE_0_COMPLETE.md](PHASE_0_COMPLETE.md) | Résumé Phase 0 | Référence |

---

## 🛠️ Commandes Utiles

### Docker
```bash
# Démarrer tous les services
docker compose up -d

# Démarrer uniquement les DBs
docker compose up -d mongodb-auth mongodb-courses mongodb-payments redis

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f mongodb-auth

# Arrêter tout
docker compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker compose down -v

# Voir le statut
docker compose ps

# Redémarrer un service
docker compose restart mongodb-auth
```

### MongoDB
```bash
# Se connecter à MongoDB Auth
docker exec -it har-mongodb-auth mongosh -u admin -p mongopassword --authenticationDatabase admin

# Se connecter à MongoDB Courses
docker exec -it har-mongodb-courses mongosh -u admin -p mongopassword --authenticationDatabase admin

# Se connecter à MongoDB Payments
docker exec -it har-mongodb-payments mongosh -u admin -p mongopassword --authenticationDatabase admin
```

### Redis
```bash
# Se connecter à Redis
docker exec -it har-redis redis-cli

# Commandes Redis utiles:
> PING                    # Tester la connexion
> KEYS *                  # Voir toutes les clés
> GET key_name            # Lire une valeur
> SET key_name value      # Écrire une valeur
> FLUSHALL                # ⚠️ Supprimer toutes les données
```

### Tests
```bash
# Test santé MongoDB (dans mongosh)
> db.runCommand({ping: 1})

# Test insertion (dans mongosh)
> db.test.insertOne({test: "hello"})
> db.test.find()

# Test Redis PING
docker exec -it har-redis redis-cli PING
```

---

## 🚦 Statut des Phases

| Phase | Statut | Durée | Livrables |
|-------|--------|-------|-----------|
| **Phase 0: Architecture** | ✅ **COMPLÉTÉ** | 2-3j | Docker, Docs, Structure |
| **Phase 1: Backend** | 🔵 **EN COURS** | 5-7j | 4 services + 40+ endpoints |
| Phase 2: Frontend | ⏸️ En attente | 5-7j | React UI + i18n |
| Phase 3: Integration | ⏸️ En attente | 1-2j | Tests E2E |
| Phase 4: AI/ML | ⏸️ En attente | 5-7j | Chatbot, Reco |

---

## ❓ FAQ Rapide

**Q: Docker ne démarre pas ?**
```bash
# Windows: Vérifier Docker Desktop est lancé
# Linux: sudo systemctl start docker
```

**Q: Port déjà utilisé ?**
```bash
# Trouver le processus qui utilise le port
sudo lsof -i :27017  # Linux/Mac
netstat -ano | findstr :27017  # Windows

# Tuer le processus ou changer le port dans docker-compose.yml
```

**Q: Container "unhealthy" ?**
```bash
# Vérifier les logs
docker compose logs mongodb-auth
# Attendre 30 secondes pour le healthcheck
```

**Q: Mot de passe MongoDB oublié ?**
```bash
# C'est dans .env: mongopassword
# Username: admin
```

---

## ✅ Checklist Phase 1 (Backend)

### Avant de commencer
- [ ] Docker et Docker Compose installés
- [ ] Bases de données MongoDB démarrées et "healthy"
- [ ] Redis démarré et répond au PING
- [ ] Lu PROMPT_02_BACKEND_ET_DATA.md
- [ ] Lu STANDARDS_ET_CONVENTIONS.md

### Auth Service
- [ ] Structure créée (src/config, models, routes, etc)
- [ ] MongoDB User model défini
- [ ] 11 endpoints implémentés
- [ ] JWT generation/validation
- [ ] Password hashing (bcrypt)
- [ ] Tests unitaires (80%+ coverage)

### Course Service
- [ ] MongoDB models (courses, modules, lessons, enrollments, lesson_progress)
- [ ] 15+ endpoints implémentés
- [ ] Logique de progression
- [ ] Tests unitaires

### Payment Service
- [ ] MongoDB models (transactions, subscriptions)
- [ ] 7 endpoints implémentés
- [ ] Intégration Stripe (simulée)
- [ ] Webhook handling
- [ ] Tests unitaires

### AI Service (Basic)
- [ ] 5 endpoints basiques
- [ ] Recommandations simples
- [ ] Quiz generation (pattern-based)
- [ ] Chatbot FAQ
- [ ] Tests unitaires

### API Gateway
- [ ] Routage vers tous les services
- [ ] JWT validation centralisée
- [ ] Rate limiting
- [ ] CORS configuré
- [ ] Tests intégration

### Documentation
- [ ] README pour chaque service
- [ ] API documentation (JSDoc ou OpenAPI)
- [ ] Exemples curl pour chaque endpoint

---

## 🎉 C'est Parti !

Vous êtes prêt à commencer la Phase 1 (Backend Development).

**Commencez par lire:**
1. [PROMPT_02_BACKEND_ET_DATA.md](PROMPT_02_BACKEND_ET_DATA.md) (15 min)
2. [STANDARDS_ET_CONVENTIONS.md](STANDARDS_ET_CONVENTIONS.md) (5 min)

**Puis implémentez:**
1. Auth Service (2 jours)
2. Course Service (2 jours)
3. Payment Service (1 jour)
4. AI Service basic (1 jour)
5. API Gateway (1 jour)

**Durée totale estimée: 5-7 jours**

Bon courage ! 🚀
