# PROMPT_02_BACKEND_ET_DATA 
## 🎯 Rôle de l'Agent IA

**Agent Développeur Backend (Python/Node.js) & Data Modeler (MongoDB)**

- **Mission:** Construire les 4 microservices backend (Auth, Course, Payment, AI Core) avec leurs APIs REST et modéliser complètement la base de données MongoDB.
- **Critère de Succès:** 
  - Tous les endpoints CRUD et métier implémentés et testables
  - Schémas MongoDB validés et indexés
  - Tests unitaires pour endpoints critiques (80% couverture)
  - Services communicants via API Gateway
  - Code bien structuré et documenté

---

## 📋 Objectif du Fichier/Module

Créer la **logique métier** complète du LMS Har Academy en implémentant:
- Service d'authentification robuste
- Gestion complète des cours et progression
- Système de paiement intégré
- Service IA (basique pour cette phase)

---

## 🏗️ Requirements Fonctionnels Détaillés

### SERVICE 1: Auth Service

#### A. Modèle de Données (MongoDB Collection `users`)

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase, validated),
  password_hash: String (bcrypt, min 60 chars),
  first_name: String,
  last_name: String,
  avatar_url: String (optionnel),
  role: Enum ['learner', 'instructor', 'admin'],
  status: Enum ['active', 'suspended', 'deleted'],
  language: String (default: 'fr'), // i18n
  created_at: ISODate,
  updated_at: ISODate,
  last_login_at: ISODate,
  
  // Pour instructeurs
  instructor_info: {
    bio: String,
    expertise_tags: [String], // ex: ['Excel', 'Python', 'Data']
    total_courses: Number,
    rating: Number (0-5),
    verification_status: Enum ['unverified', 'verified', 'rejected']
  },
  
  // Settings
  notification_settings: {
    email_notifications: Boolean,
    marketing_emails: Boolean,
    newsletter: Boolean
  }
}
```

#### B. Endpoints Auth Service

**Base URL:** `http://localhost:3001/api/v1`

```
POST /auth/register
├─ Body: { email, password, first_name, last_name, language? }
├─ Validation: Email format, Password strength (min 8 chars, uppercase, number)
├─ Response: { success: true, data: { user: {...}, token: JWT } }
└─ Erreurs: 400 (email exists), 400 (weak password), 500 (DB error)

POST /auth/login
├─ Body: { email, password }
├─ Response: { success: true, data: { user: {...}, token: JWT, refresh_token? } }
└─ Erreurs: 401 (invalid credentials), 400 (user suspended)

POST /auth/logout
├─ Auth: Required (JWT)
├─ Response: { success: true, message: "Logged out" }
└─ Stockage: Blacklist token (Redis cache ou DB)

POST /auth/refresh-token
├─ Body: { refresh_token }
├─ Response: { success: true, data: { token: JWT } }
└─ Erreurs: 401 (invalid refresh token)

GET /auth/profile
├─ Auth: Required (JWT)
├─ Response: { success: true, data: { user: {...} } }
└─ Erreurs: 401 (unauthorized), 404 (user not found)

PATCH /auth/profile
├─ Auth: Required (JWT)
├─ Body: { first_name?, last_name?, avatar_url?, language? }
├─ Response: { success: true, data: { user: {...} } }
└─ Erreurs: 400 (validation), 401 (unauthorized)

POST /auth/change-password
├─ Auth: Required (JWT)
├─ Body: { old_password, new_password }
├─ Response: { success: true, message: "Password changed" }
└─ Erreurs: 401 (wrong old password), 400 (weak new password)

POST /auth/request-password-reset
├─ Body: { email }
├─ Response: { success: true, message: "Email sent" }
├─ Action: Envoi email avec token réinitialisation (lien expire après 1h)
└─ Erreurs: 400 (email not found)

POST /auth/reset-password
├─ Body: { token, new_password }
├─ Response: { success: true, message: "Password reset" }
└─ Erreurs: 401 (invalid token), 400 (weak password)

GET /auth/users/:id
├─ Accès: Public profile (données limitées)
├─ Response: { success: true, data: { user: { _id, first_name, last_name, avatar_url, instructor_info } } }
└─ Erreurs: 404 (user not found)

GET /auth/verify-jwt
├─ Auth: Required (JWT en header)
├─ Response: { success: true, data: { valid: true, user_id: ObjectId } }
└─ Erreurs: 401 (invalid/expired token)
```

#### C. Logique Métier Auth Service

- **JWT Generation:** Signer avec HS256 ou RS256, TTL: 24h pour access token, 7 jours pour refresh
- **Password Hashing:** bcryptjs avec salt rounds = 10
- **Rate Limiting:** Max 5 tentatives login/10 min par IP
- **Session Management:** Stocker sessions en Redis ou MongoDB

---

### SERVICE 2: Course Service

#### A. Modèles de Données (MongoDB Collections)

**Collection `courses`:**
```javascript
{
  _id: ObjectId,
  title: String (min 5, max 200),
  description: String,
  short_description: String (max 500),
  domain: Enum ['Excel', 'R', 'Python', 'Other'],
  stack: [String], // Exemples: ['Excel', 'VBA'], ['R', 'Tidyverse'], etc
  price: {
    amount: Number (>= 0),
    currency: String (default: 'EUR'),
    pricing_model: Enum ['one-time', 'subscription']
  },
  instructor_id: ObjectId (ref: users),
  instructor_name: String (denormalized for speed),
  status: Enum ['draft', 'published', 'archived'],
  
  // Contenu
  modules: [ObjectId], // ref: modules
  total_lessons: Number,
  total_duration_hours: Number,
  
  // Métriques
  enrollments_count: Number,
  average_rating: Number (0-5),
  reviews_count: Number,
  
  // SEO & Metadata
  keywords: [String],
  image_url: String (S3),
  category: String,
  language: String,
  
  created_at: ISODate,
  updated_at: ISODate,
  published_at: ISODate
}
```

**Collection `modules`:**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,
  title: String,
  description: String,
  order: Number, // 1, 2, 3...
  lessons: [ObjectId], // ref: lessons
  created_at: ISODate
}
```

**Collection `lessons`:**
```javascript
{
  _id: ObjectId,
  module_id: ObjectId,
  course_id: ObjectId, // denormalized
  title: String,
  description: String,
  type: Enum ['video', 'text', 'quiz', 'exercise'],
  order: Number,
  
  // Pour vidéos
  video: {
    url: String (S3 URL),
    duration_seconds: Number,
    transcript: String,
    thumbnail_url: String
  },
  
  // Pour contenu texte
  content: String (HTML rich text),
  
  // Pour quiz/exercises
  quiz_id: ObjectId (ref: quizzes, si applicable),
  
  created_at: ISODate,
  updated_at: ISODate
}
```

**Collection `enrollments`:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  course_id: ObjectId,
  status: Enum ['active', 'completed', 'dropped'],
  progress_percentage: Number (0-100),
  completed_lessons: [ObjectId],
  last_accessed_lesson_id: ObjectId,
  enrolled_at: ISODate,
  completed_at: ISODate,
  last_accessed_at: ISODate
}
```

**Collection `lesson_progress`:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  lesson_id: ObjectId,
  course_id: ObjectId,
  status: Enum ['not_started', 'in_progress', 'completed'],
  time_spent_seconds: Number,
  quiz_score: Number (si lesson type = quiz),
  created_at: ISODate,
  updated_at: ISODate
}
```

#### B. Endpoints Course Service

**Base URL:** `http://localhost:3002/api/v1`

```
GET /courses
├─ Query: { page?: 1, limit?: 10, domain?: 'Excel|R|Python', search?: String, sort_by?: 'popular|newest|rating' }
├─ Response: { success: true, data: { courses: [...], pagination: { page, limit, total, pages } } }
├─ Filtrage: Par domaine, stack, prix, rating
└─ Erreurs: 400 (invalid query params)

GET /courses/:id
├─ Response: { success: true, data: { course: {..., modules: [{...lessons}] } } }
└─ Erreurs: 404 (course not found)

GET /courses/:id/lessons
├─ Query: { module_id?: ObjectId }
├─ Response: { success: true, data: { lessons: [...] } }
└─ Erreurs: 404 (course/module not found)

GET /courses/:id/lessons/:lesson_id
├─ Auth: Required (JWT)
├─ Logic: Vérifier user a accès (inscrit + payé si cours payant)
├─ Response: { success: true, data: { lesson: {...}, is_completed: Boolean, progress: {...} } }
└─ Erreurs: 403 (no access), 404 (lesson not found)

POST /courses
├─ Auth: Required, Role: 'instructor' ou 'admin'
├─ Body: { title, description, domain, stack, price, pricing_model }
├─ Response: { success: true, data: { course: {..., status: 'draft'} } }
└─ Erreurs: 400 (validation), 401 (unauthorized), 403 (not instructor)

PATCH /courses/:id
├─ Auth: Required, Owner ou Admin
├─ Body: { title?, description?, domain?, stack?, price? }
├─ Response: { success: true, data: { course: {...} } }
└─ Erreurs: 403 (not owner), 404 (not found)

POST /courses/:id/publish
├─ Auth: Required, Owner ou Admin
├─ Validation: Course a min 1 module avec min 1 lesson
├─ Response: { success: true, data: { course: {..., status: 'published'} } }
└─ Erreurs: 400 (validation), 403 (not owner), 404 (not found)

DELETE /courses/:id
├─ Auth: Required, Owner ou Admin
├─ Response: { success: true, message: "Course deleted" }
└─ Erreurs: 403 (not owner), 404 (not found)

POST /courses/:id/modules
├─ Auth: Required, Owner ou Admin
├─ Body: { title, description, order }
├─ Response: { success: true, data: { module: {...} } }
└─ Erreurs: 403 (not owner), 404 (course not found)

POST /courses/:id/modules/:module_id/lessons
├─ Auth: Required, Owner ou Admin
├─ Body: { title, description, type, order, video? (file or URL), content? (rich text) }
├─ Response: { success: true, data: { lesson: {...} } }
└─ Erreurs: 400 (validation), 403 (not owner), 404 (not found)

PATCH /courses/:id/modules/:module_id/lessons/:lesson_id
├─ Auth: Required, Owner ou Admin
├─ Body: { title?, description?, type?, video?, content? }
├─ Response: { success: true, data: { lesson: {...} } }
└─ Erreurs: 403 (not owner), 404 (not found)

POST /courses/:id/enroll
├─ Auth: Required
├─ Logic: Vérifier user pas déjà inscrit, accès payment si payant
├─ Response: { success: true, data: { enrollment: {...} } }
└─ Erreurs: 400 (already enrolled), 402 (payment required), 403 (user suspended)

GET /enrollments
├─ Auth: Required
├─ Query: { status?: 'active|completed|dropped' }
├─ Response: { success: true, data: { enrollments: [...] } }
└─ Erreurs: 401 (unauthorized)

PATCH /courses/:id/lessons/:lesson_id/progress
├─ Auth: Required
├─ Body: { status: 'not_started|in_progress|completed', time_spent_seconds?: Number, quiz_score?: Number }
├─ Response: { success: true, data: { progress: {...}, course_progress: Number } }
└─ Erreurs: 404 (lesson/course not found), 403 (no enrollment)

GET /courses/:id/progress
├─ Auth: Required
├─ Response: { success: true, data: { enrollment: {...}, lessons_progress: [...] } }
└─ Erreurs: 404 (enrollment not found), 403 (not enrolled)
```

#### C. Logique Métier Course Service

- **Accès au Contenu:** Vérifier user inscrit + paiement effectué (appel Payment Service)
- **Calcul Progression:** (lessons_completed / total_lessons) * 100
- **Indexation:** Index sur `course_id`, `user_id`, `status` pour requêtes rapides
- **Soft Delete:** Archiver plutôt que supprimer (status = archived)

---

### SERVICE 3: Payment Service

#### A. Modèles de Données

**Collection `transactions`:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  course_id: ObjectId,
  amount: Number,
  currency: String,
  status: Enum ['pending', 'completed', 'failed', 'refunded'],
  payment_method: Enum ['card', 'bank_transfer', 'free'],
  
  stripe_payment_intent_id: String, // pour Stripe
  
  created_at: ISODate,
  completed_at: ISODate,
  refunded_at: ISODate
}
```

**Collection `subscriptions`:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  plan: Enum ['basic', 'pro', 'enterprise'],
  status: Enum ['active', 'paused', 'cancelled', 'expired'],
  amount_per_month: Number,
  currency: String,
  renewal_date: ISODate,
  cancelled_date: ISODate,
  created_at: ISODate
}
```

#### B. Endpoints Payment Service

**Base URL:** `http://localhost:3003/api/v1`

```
POST /purchase
├─ Auth: Required
├─ Body: { course_id, payment_method }
├─ Logic: Créer transaction, traiter paiement, notifier Course Service
├─ Response: { success: true, data: { transaction: {...} } }
└─ Erreurs: 400 (course not found), 402 (payment failed)

POST /subscribe
├─ Auth: Required
├─ Body: { plan: 'basic|pro|enterprise' }
├─ Response: { success: true, data: { subscription: {...} } }
└─ Erreurs: 400 (invalid plan)

POST /webhook/stripe
├─ Auth: Webhook signature validation
├─ Logic: Traiter webhook Stripe, mettre à jour transaction status
├─ Response: { success: true }
└─ Erreurs: 401 (invalid signature)

GET /transactions
├─ Auth: Required
├─ Response: { success: true, data: { transactions: [...] } }
└─ Erreurs: 401 (unauthorized)

GET /subscriptions/active
├─ Auth: Required
├─ Response: { success: true, data: { subscription: {...} } }
└─ Erreurs: 404 (no active subscription)

POST /refund/:transaction_id
├─ Auth: Required, Admin ou User owner
├─ Response: { success: true, data: { transaction: {..., status: 'refunded'} } }
└─ Erreurs: 400 (refund not possible), 403 (not owner)

GET /user/:user_id/entitlements
├─ Logic: Retourner tous les courses auxquels user a accès (achetés ou subscription active)
├─ Response: { success: true, data: { courses: [ObjectId, ...], subscription: {...} } }
└─ Erreurs: 404 (user not found)
```

#### C. Logique Métier

- **Intégration Stripe:** Simulée ou réelle (test mode)
- **Webhook Handling:** Écouter `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Refund Logic:** Uniquement si transaction < 14 jours et status = 'completed'

---

### SERVICE 4: AI Core Service

#### A. Responsabilités (Phase 1 - Basic)

```
1. Recommandation personnalisée
   - Analyser progression utilisateur
   - Suggérer cours basé sur historique + domaine
   
2. Génération Quiz (Basic)
   - Créer questions à partir de lesson content
   
3. Chatbot simple (Pattern matching)
   - Répondre questions FAQ du cours
   - Pas d'intégration LLM pour Phase 1
```

#### B. Endpoints AI Core Service

**Base URL:** `http://localhost:5000/api/v1`

```
POST /ai/recommendations
├─ Auth: Required
├─ Body: { user_id }
├─ Logic: Analyser user progress, retourner 3-5 courses recommandés
├─ Response: { success: true, data: { recommendations: [...] } }
└─ Erreurs: 404 (user not found)

POST /ai/generate-quiz
├─ Auth: Required, Role: 'instructor'
├─ Body: { lesson_content: String, num_questions: 5 }
├─ Logic: Parser contenu, générer questions (simple regex/pattern matching)
├─ Response: { success: true, data: { quiz: { questions: [...] } } }
└─ Erreurs: 400 (invalid content)

POST /ai/chat
├─ Auth: Required
├─ Body: { message: String, course_id: ObjectId, lesson_id?: ObjectId }
├─ Logic: Match question contre FAQ/content, retourner réponse
├─ Response: { success: true, data: { reply: String } }
└─ Erreurs: 404 (course not found)
```

---

## 🔧 Specifications Techniques Détaillées

### Stack Backend

| Aspect | Technologie | Version |
|--------|-------------|---------|
| **Runtime** | Node.js | 18+ LTS |
| **Framework Web** | Express.js | 4.18+ |
| **Base de Données** | MongoDB | 5.0+ |
| **Driver MongoDB** | mongoose | 7.0+ OU native mongodb driver |
| **Auth** | jsonwebtoken + bcryptjs | - |
| **Validation** | joi | 17.0+ |
| **HTTP Client** | axios | 1.3+ |
| **Env Variables** | dotenv | 16.0+ |
| **Logging** | winston | 3.8+ |
| **Testing** | jest + supertest | - |
| **Code Quality** | ESLint + Prettier | - |

### Conventions de Code

**Nommage:**
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Classes/Models: PascalCase
- Fichiers: kebab-case

**Structure:**
```
src/
├── config/             # Configuration globale
│   └── database.js
├── models/            # Schémas MongoDB
│   ├── User.js
│   ├── Course.js
│   └── ...
├── routes/            # Routes API
│   ├── auth.js
│   ├── courses.js
│   └── ...
├── controllers/       # Logique métier
│   ├── authController.js
│   └── ...
├── middleware/        # Middleware Express
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── ...
├── services/          # Services métier
│   ├── authService.js
│   └── ...
├── utils/             # Utilitaires
│   ├── helpers.js
│   └── validators.js
└── index.js           # Entry point
```

---

## 📁 Livrables Attendus

1. **4 Services complets** avec structure bien organisée
2. **20+ endpoints** implémentés et documentés
3. **Schémas MongoDB** avec indexes et validations
4. **Tests unitaires** (min 80% couverture)
5. **Documentation API** (README + JSDoc)
6. **Gestion d'erreurs** cohérente et informative
7. **Logging** structuré (Winston)
8. **Sécurité** (JWT validation, input validation, rate limiting)

---

## ✅ Checklist de Validation

- [ ] `docker-compose up` démarre tous les services
- [ ] Tous les endpoints testables avec `curl` ou Postman
- [ ] MongoDB collections créées avec indexes
- [ ] Authentification JWT fonctionne
- [ ] Rate limiting actif
- [ ] Tests unitaires passent (80%+ couverture)
- [ ] Code linted (ESLint) et formaté (Prettier)
- [ ] Documentation complète (README + JSDoc)
- [ ] Pas d'erreurs non-gérées en logs

---

**Statut:** Prêt pour l'Agent Backend
**Priorité:** 🔴 Critique
**Durée Estimée:** 5-7 jours