# PROMPT_01_ARCHITECTURE_GENERALE.md

## 🎯 Rôle de l'Agent IA

**Agent Architecte Système Principal**

- **Mission:** Définir la structure globale du projet, les choix technologiques, les normes de communication inter-services et générer les fichiers de configuration pour un déploiement cohérent.
- **Critère de Succès:** Livraison d'un diagramme d'architecture (C4 Level 1 & 2), documentation complète de l'environnement de développement, et validation de la cohérence du monorepo.

---

## 📋 Objectif du Fichier/Module

Mettre en place la **fondation technique** du LMS **Har Academy** :
- Structure monorepo avec séparation claire des services
- Microservices indépendants et communicants
- Configuration Docker pour développement local
- API Gateway centralisée
- Standards de développement et conventions de nommage

---

## 🏗️ Requirements Fonctionnels (Architecture)

### 1. Structure Monorepo
**Cible:** Utiliser une structure Monorepo (type Nx, Turborepo, ou Yarn Workspaces) pour héberger tous les services dans un seul dépôt Git.

**Livrables:**
```
har-academy/
├── packages/
│   ├── frontend/                    # React/Vue App
│   ├── backend/
│   │   ├── auth-service/           # Auth Service (Node.js/Python)
│   │   ├── course-service/         # Course Service (Node.js/Python)
│   │   ├── payment-service/        # Payment Service (Node.js/Python)
│   │   ├── ai-core-service/        # AI Core Service (Python)
│   │   └── api-gateway/            # API Gateway (Node.js)
│   └── shared/
│       ├── types/                  # Types/Interfaces partagées
│       ├── constants/              # Constants (URLs, erreurs)
│       └── utils/                  # Utilitaires communs
├── docker-compose.yml              # Orchestration locale
├── .env.example                    # Variables d'environnement
├── .github/workflows/              # CI/CD pipelines
├── docs/                           # Documentation
└── README.md
```

### 2. Microservices (4 Services + API Gateway)

#### Service 1: Auth Service
- **Langage:** Node.js (Express) ou Python (FastAPI)
- **Responsabilités:**
  - Gestion des utilisateurs (Apprenant, Instructeur, Admin)
  - JWT token generation/verification
  - OAuth2 (optionnel: Google, GitHub)
  - Role-based access control (RBAC)
- **Base de données:** MongoDB (collection `users`)
- **Ports:** `3001` (dev)

#### Service 2: Course Service
- **Langage:** Node.js (Express) ou Python (FastAPI)
- **Responsabilités:**
  - CRUD opérations sur les cours
  - Gestion des modules/lessons
  - Gestion de la progression utilisateur
  - Catalogue et filtrage (par stack, domaine, prix)
- **Base de données:** MongoDB (collections `courses`, `modules`, `lessons`, `enrollments`)
- **Ports:** `3002` (dev)

#### Service 3: Payment Service
- **Langage:** Node.js (Express) ou Python (FastAPI)
- **Responsabilités:**
  - Gestion des achats uniques
  - Gestion des abonnements mensuels/annuels
  - Intégration avec fournisseur paiement (Stripe simulé/réel)
  - Webhooks pour confirmations paiement
- **Base de données:** MongoDB (collections `transactions`, `subscriptions`)
- **Ports:** `3003` (dev)

#### Service 4: AI Core Service
- **Langage:** Python (Flask/FastAPI)
- **Responsabilités:**
  - Système de recommandation personnalisé
  - Génération de contenu (quiz, résumés)
  - Chatbot/Coach IA (RAG - Retrieval-Augmented Generation)
  - Analyse des performances utilisateur
- **Base de données:** MongoDB + Vector DB (ChromaDB/Pinecone)
- **Ports:** `5000` (dev)

#### API Gateway
- **Langage:** Node.js (Express)
- **Responsabilités:**
  - Point d'entrée unique pour le frontend
  - Routage vers les microservices
  - Gestion centralisée des authentifications
  - Rate limiting et logging
  - CORS configuration
- **Ports:** `8000` (dev) → Route vers services internes

### 3. Base de Données: MongoDB

**Justification:** Schémas flexibles pour stocker cours, leçons, quiz avec structures variées.

**Collections Principales:**
```javascript
// Auth Service
db.users: {
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  first_name: String,
  last_name: String,
  role: Enum (learner, instructor, admin),
  created_at: Date,
  avatar_url: String,
  ...
}

// Course Service
db.courses: {
  _id: ObjectId,
  title: String,
  description: String,
  domain: String (Excel, R, Python),
  stack: Array (Excel, R, Python),
  price: Number,
  pricing_model: Enum (one-time, subscription),
  instructor_id: ObjectId (ref: users),
  status: Enum (draft, published, archived),
  modules: Array<ObjectId> (ref: modules),
  created_at: Date,
  ...
}

db.modules: {
  _id: ObjectId,
  course_id: ObjectId,
  title: String,
  order: Number,
  lessons: Array<ObjectId> (ref: lessons),
  ...
}

db.lessons: {
  _id: ObjectId,
  module_id: ObjectId,
  title: String,
  type: Enum (video, text, quiz),
  content_url: String (S3/Cloud URL),
  duration: Number (seconds),
  order: Number,
  ...
}

db.enrollments: {
  _id: ObjectId,
  user_id: ObjectId,
  course_id: ObjectId,
  progress: Number (0-100),
  completed_at: Date,
  ...
}

db.transactions: {
  _id: ObjectId,
  user_id: ObjectId,
  course_id: ObjectId,
  amount: Number,
  currency: String,
  status: Enum (pending, completed, failed),
  created_at: Date,
  ...
}

db.subscriptions: {
  _id: ObjectId,
  user_id: ObjectId,
  plan: Enum (basic, pro),
  status: Enum (active, cancelled, expired),
  renewal_date: Date,
  ...
}
```

### 4. Communication Inter-Services

**Protocole:** REST API (JSON)

**Conventions:**
- Base URL: `http://localhost:{PORT}/api/v1/`
- Tous les endpoints retournent `{ success: Boolean, data: Object, error: String }`
- Authentification: JWT token en header `Authorization: Bearer {token}`
- Status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

**Contrats d'API (détails dans fichier séparé):**
- Auth Service → Course Service: Validation JWT
- Course Service → Payment Service: Vérification d'accès utilisateur
- AI Service → Course Service: Récupération contenu cours

### 5. Internationalisation (I18N)

**Langues Supportées:** Français, Anglais

**Structure:**
```
frontend/src/i18n/
├── locales/
│   ├── fr.json
│   └── en.json
└── index.js (configuration i18n)
```

**Backend:** Retourner les messages d'erreur dans la langue de l'utilisateur (détectée via header `Accept-Language`).

---

## 🔧 Specifications Techniques Détaillées

| Composant | Technologie | Langage | Version | Détails Clés |
|-----------|-------------|---------|---------|--------------|
| **Frontend** | React ou Vue | JavaScript/TypeScript | React 18+ / Vue 3+ | Composants réutilisables, design responsive, i18n |
| **API Gateway** | Express | Node.js | 18+ | Routing, auth centralisée, logging |
| **Auth Service** | Express / FastAPI | Node.js / Python | 18+ / 3.9+ | JWT, RBAC, OAuth2 optional |
| **Course Service** | Express / FastAPI | Node.js / Python | 18+ / 3.9+ | CRUD, business logic |
| **Payment Service** | Express / FastAPI | Node.js / Python | 18+ / 3.9+ | Transaction management, webhooks |
| **AI Core Service** | Flask / FastAPI | Python | 3.9+ | LLM integration, RAG, vectorDB |
| **Base de Données** | MongoDB | N/A | 5.0+ | Schémas flexibles, indexation |
| **Vector DB** | ChromaDB / Pinecone | Python | Latest | Embeddings pour RAG |
| **Container** | Docker | YAML | 20.10+ | Isolation services, reproducibilité |
| **Orchestration** | Docker Compose | YAML | 2.0+ | Développement local |
| **Authentification** | JWT | N/A | RS256 algorithm | Sécurité APIs |

---

## 📊 Diagramme d'Architecture Requis (C4 Model)

### Level 1 - System Context
```
┌─────────────────────────────────────────────────────────────┐
│                    Har Academy LMS                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Frontend (React/Vue)                   │ │
│  │  Landing → Login → Dashboard → Learning Space           │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                     │
│                         ↓ (REST API)                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            API Gateway (Node.js Express)                │ │
│  │  Port: 8000                                              │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                     │
│        ┌────────────────┼────────────────┬──────────────┐   │
│        ↓                ↓                ↓              ↓    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ┌──────────┐ │
│  │ Auth Service │ │Course Service│ │ Payment  │  │ AI Core  │ │
│  │ Port: 3001   │ │ Port: 3002   │ │ Service  │  │ Service  │ │
│  │ Node.js      │ │ Node.js      │ │ Port:3003│  │ Port:5000│ │
│  └──────────────┘ └──────────────┘ └──────────┘  └──────────┘ │
│        │                ↓                ↓              ↓      │
│        └────────────────┴────────────────┴──────────────┘      │
│                         ↓                                      │
│                  ┌────────────────┐                           │
│                  │   MongoDB      │                           │
│                  │   Port: 27017  │                           │
│                  └────────────────┘                           │
│                                                                │
│                  ┌────────────────┐                           │
│                  │   ChromaDB     │                           │
│                  │  (Vector DB)   │                           │
│                  └────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Level 2 - Container Diagram
(Détails dans le document généré par l'agent)

---

## 🎯 Flow/Séquence d'Opération (Agent Architecte)

### Étape 1: Initialisation Monorepo
- [ ] Créer structure dossiers `packages/backend/`, `packages/frontend/`, `packages/shared/`
- [ ] Initialiser `package.json` root avec workspaces (si Yarn/Npm)
- [ ] Configurer ESLint, Prettier, Husky pour standards de code
- [ ] Créer `.gitignore`, `.env.example`

### Étape 2: Configuration Docker
- [ ] Créer `Dockerfile` pour chaque service (Auth, Course, Payment, AI Core)
- [ ] Créer `Dockerfile` pour frontend
- [ ] Créer `docker-compose.yml` avec 6 services (5 apps + MongoDB)
- [ ] Tester `docker-compose up` et vérifier santé des services

### Étape 3: Définition des Routes API Gateway
- [ ] Créer `packages/backend/api-gateway/routes.js`
- [ ] Documenter les routes:
  - `/api/v1/auth/register` → Auth Service
  - `/api/v1/auth/login` → Auth Service
  - `/api/v1/courses` → Course Service
  - `/api/v1/courses/:id/lessons` → Course Service
  - `/api/v1/payment/purchase` → Payment Service
  - `/api/v1/ai/chat` → AI Core Service

### Étape 4: Documentation Globale
- [ ] Générer **Architecture Diagram** (C4 Model Levels 1 & 2)
- [ ] Créer `docs/ARCHITECTURE.md` avec explications détaillées
- [ ] Créer `docs/API_CONTRACTS.md` avec contrats inter-services
- [ ] Créer `docs/SETUP.md` avec instructions de démarrage local

### Étape 5: Validation de Cohérence
- [ ] Vérifier que tous les services peuvent se voir en réseau Docker
- [ ] Tester un flux d'authentification simple (signup → JWT token)
- [ ] Vérifier que l'API Gateway reçoit correctement les requêtes

---

## 📁 Livrables Attendus

1. **Structure Monorepo complète** avec tous les dossiers et fichiers de base
2. **Dockerfile** pour chaque service + frontend
3. **docker-compose.yml** fonctionnel avec 6 services
4. **.env.example** avec toutes les variables nécessaires
5. **Architecture Diagram** (format PNG/SVG généré avec PlantUML ou Mermaid)
6. **docs/ARCHITECTURE.md** - Explication complète de l'architecture
7. **docs/API_CONTRACTS.md** - Contrats inter-services
8. **docs/SETUP.md** - Guide de démarrage pour les autres agents

---

## ✅ Checklist de Validation

Avant de passer à l'Agent Backend, valider:

- [ ] `docker-compose up` démarre 6 services sans erreurs
- [ ] MongoDB accessible sur `localhost:27017`
- [ ] Chaque service accessible sur son port (3001, 3002, 3003, 5000, 8000)
- [ ] API Gateway répond sur `http://localhost:8000/api/v1/health`
- [ ] Structure monorepo cohérente et documentée
- [ ] Variables d'environnement bien définies
- [ ] Diagramme d'architecture généré et compréhensible
- [ ] Tous les README et docs complétés

---

## 🔗 Liens vers Autres Prompts

**Après cette phase, les agents suivants utiliseront cette architecture:**
- **PROMPT_02_BACKEND_ET_DATA.md** - Backend developer implémentera les 4 services
- **PROMPT_03_FRONTEND_ET_UX_UI.md** - Frontend developer créera l'UI
- **PROMPT_04_AGENTS_IA_PEDAGOGIQUE.md** - AI specialist implémentera AI Core

---

## ⚠️ Considérations Importantes

1. **Scalabilité:** Cette architecture est scalable en production (passer de Docker Compose à Kubernetes/Docker Swarm)
2. **Sécurité:** JWT tokens doivent être signés avec une clé privée (RS256)
3. **Performance:** Chaque service peut être optimisé indépendamment
4. **Monitoring:** À ajouter plus tard avec Prometheus/Grafana
5. **CI/CD:** GitHub Actions templates devraient être préparés pour déploiement automatisé

---

**Statut:** Prêt pour l'Agent Architecte
**Priorité:** 🔴 Critique - À faire en premier
**Durée Estimée:** 2-3 jours