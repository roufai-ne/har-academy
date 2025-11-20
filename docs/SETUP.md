# HAR Academy - Setup Guide

Guide complet pour configurer et lancer HAR Academy en local.

## Prérequis

### Logiciels Requis

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Python**: v3.11+ ([Download](https://www.python.org/))
- **Docker**: v24+ ([Download](https://www.docker.com/))
- **Docker Compose**: v2.20+
- **Git**: Pour cloner le repository
- **VS Code**: Recommandé avec extensions ESLint, Prettier

### Comptes Externes

- **Stripe Account** (pour tests): [stripe.com](https://stripe.com)
- **OpenAI API Key** (optionnel): [platform.openai.com](https://platform.openai.com)

---

## Installation Rapide (Docker)

### 1. Cloner le Repository

```bash
git clone <repository-url>
cd har-academy
```

### 2. Configuration des Variables d'Environnement

```bash
cp .env.example .env
```

**Éditer `.env` avec vos valeurs:**

```env
# Database Passwords
POSTGRES_PASSWORD=your_secure_password
MONGO_PASSWORD=your_mongo_password

# JWT Secrets (générer avec: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Stripe (récupérer depuis dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OpenAI (optionnel)
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Démarrer tous les services

```bash
docker-compose up -d
```

**Attendre que tous les services soient "healthy" (~30-60 secondes):**

```bash
docker-compose ps
```

### 4. Vérifier les services

```bash
# API Gateway
curl http://localhost:8000/health

# Auth Service
curl http://localhost:3000/health

# Course Service
curl http://localhost:3001/health

# Payment Service
curl http://localhost:3002/health

# AI Service
curl http://localhost:8001/health
```

**Tous doivent retourner:** `{"status":"ok"}`

---

## Installation Manuelle (Sans Docker)

### 1. Installer les Bases de Données

**PostgreSQL:**
```bash
# Installer PostgreSQL 15
# Créer database:
createdb har_auth
```

**MongoDB:**
```bash
# Installer MongoDB 7
# Démarrer MongoDB:
mongod --dbpath=/data/db
```

**Redis:**
```bash
# Installer Redis
redis-server
```

### 2. Installer les Dépendances

**Auth Service:**
```bash
cd packages/backend/auth-service
npm install
cp .env.example .env
# Éditer .env avec DATABASE_URL
npm run dev
```

**Course Service:**
```bash
cd packages/backend/course-service
npm install
cp .env.example .env
# Éditer .env avec MONGO_URI
npm run dev
```

**Payment Service:**
```bash
cd packages/backend/payment-service
npm install
cp .env.example .env
# Éditer .env avec MONGO_URI et STRIPE keys
npm run dev
```

**AI Service:**
```bash
cd packages/backend/ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec OPENAI_API_KEY
python -m uvicorn app.main:app --reload --port 8001
```

**API Gateway:**
```bash
cd packages/backend/api-gateway
npm install
cp .env.example .env
# Éditer .env avec service URLs
npm run dev
```

---

## Configuration Stripe

### 1. Créer un compte Stripe Test

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Mode "Test" en haut à droite
3. Récupérer les clés dans **Developers → API Keys**

### 2. Créer les Products et Prices

**Dashboard Stripe → Products → Create Product:**

**Subscription Plans:**
- **Basic Monthly**: €9.99/mois → Copier Price ID
- **Basic Yearly**: €99.99/an → Copier Price ID
- **Pro Monthly**: €19.99/mois → Copier Price ID
- **Pro Yearly**: €199.99/an → Copier Price ID
- **Premium Monthly**: €29.99/mois → Copier Price ID
- **Premium Yearly**: €299.99/an → Copier Price ID

**Ajouter les Price IDs dans `.env`:**
```env
STRIPE_PRICE_ID_BASIC_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_BASIC_YEARLY=price_xxxxx
# ... etc
```

### 3. Configurer le Webhook

1. **Dashboard Stripe → Developers → Webhooks → Add endpoint**
2. **Endpoint URL:** `http://localhost:8000/api/payments/webhook`
3. **Events to listen:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copier le Webhook Secret** → Ajouter dans `.env`

**Pour tester en local (nécessite Stripe CLI):**
```bash
stripe listen --forward-to localhost:3002/api/v1/payments/webhook
```

---

## Tester l'Installation

### 1. Créer un Compte Utilisateur

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Copier le `token` pour les requêtes suivantes.**

### 2. Créer un Cours (en tant qu'instructeur)

D'abord, promouvoir votre user en instructeur:
```bash
# Récupérer votre user ID depuis la réponse précédente
curl -X PUT http://localhost:8000/api/auth/users/<USER_ID>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"role": "instructor"}'
```

Créer un cours:
```bash
curl -X POST http://localhost:8000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python basics",
    "price": 49.99,
    "level": "beginner",
    "duration": 120,
    "category": "programming"
  }'
```

### 3. Tester un Paiement

```bash
curl -X POST http://localhost:8000/api/payments/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "courseId": "<COURSE_ID>",
    "amount": 49.99,
    "currency": "EUR"
  }'
```

**Utiliser une carte de test Stripe:**
- **Numéro:** 4242 4242 4242 4242
- **Expiration:** N'importe quelle date future
- **CVC:** N'importe quel 3 chiffres

### 4. Tester l'IA

```bash
curl -X POST http://localhost:8000/api/ai/recommendations/personalized \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "userId": "<USER_ID>",
    "limit": 5
  }'
```

---

## Documentation API

### Swagger UI

Chaque service expose une documentation Swagger:

- **Auth Service:** http://localhost:3000/docs (si configuré)
- **Course Service:** http://localhost:3001/docs (OpenAPI JSON disponible)
- **Payment Service:** http://localhost:3002/docs
- **AI Service:** http://localhost:8001/docs (FastAPI auto-docs)

### Postman Collection

Une collection Postman est disponible dans `docs/postman/`:
1. Importer dans Postman
2. Configurer la variable `{{baseUrl}}` = `http://localhost:8000`
3. Après login, copier le token dans la variable `{{authToken}}`

---

## Développement

### Structure du Projet

```
har-academy/
├── packages/
│   └── backend/
│       ├── auth-service/       # Node.js + PostgreSQL
│       ├── course-service/     # Node.js + MongoDB
│       ├── payment-service/    # Node.js + MongoDB + Stripe
│       ├── ai-service/         # Python + FastAPI
│       └── api-gateway/        # Node.js routing
├── docs/                       # Documentation
├── docker-compose.yml          # Orchestration
└── .env.example                # Template variables
```

### Hot Reload

**Services Node.js:** Utiliser `npm run dev` (nodemon)
**AI Service Python:** Utiliser `--reload` flag avec uvicorn

### Logs

**Docker:**
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f auth-service
```

**Manuel:** Les logs sont dans `logs/` de chaque service

### Tests

**Course Service:**
```bash
cd packages/backend/course-service
npm test                # Run all tests
npm run test:watch      # Watch mode
```

**Coverage:**
```bash
npm test -- --coverage
```

---

## Troubleshooting

### Problème: Services ne démarrent pas

**Vérifier les ports:**
```bash
# Windows
netstat -ano | findstr "3000 3001 3002 8000 8001"

# Mac/Linux
lsof -i :3000,:3001,:3002,:8000,:8001
```

**Solution:** Tuer les processus ou changer les ports dans `.env`

### Problème: Erreur de connexion PostgreSQL

**Vérifier:**
```bash
docker-compose logs postgres-auth
```

**Solution:** Attendre que le service soit "healthy" (10-20s)

### Problème: MongoDB authentication failed

**Vérifier MONGO_URI:**
```
mongodb://admin:<PASSWORD>@localhost:27017/har_courses?authSource=admin
```

### Problème: Stripe webhook signature invalid

**Solution:** Utiliser Stripe CLI en local:
```bash
stripe listen --forward-to localhost:3002/api/v1/payments/webhook
```

### Problème: AI Service OpenAI errors

**Si pas de clé OpenAI:** Les endpoints retournent des données mock (OK pour dev)

**Pour activer l'IA réelle:** Ajouter `OPENAI_API_KEY` dans `.env`

---

## Production Deployment

### Checklist Sécurité

- [ ] Changer tous les secrets (JWT, SERVICE_SECRET, DB passwords)
- [ ] Utiliser bases de données managées (RDS, Atlas)
- [ ] Configurer CORS strictement (pas `*`)
- [ ] Activer HTTPS (Let's Encrypt/Cloudflare)
- [ ] Rate limiting plus strict
- [ ] Logging centralisé (ELK/CloudWatch)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Backups automatisés des DBs
- [ ] Variables d'environnement via secrets manager

### Deployment Platforms

**Recommandations:**
- **AWS:** ECS/EKS + RDS + DocumentDB
- **Azure:** AKS + Azure Database
- **GCP:** GKE + Cloud SQL
- **Vercel/Railway:** Pour prototypes rapides

---

## Support

**Documentation:**
- Architecture: `docs/ARCHITECTURE.md`
- API Contracts: `docs/API_CONTRACTS.md`

**Problèmes:**
- Créer une issue sur GitHub
- Vérifier les logs: `docker-compose logs -f`

---

**Version:** 1.0.0  
**Dernière mise à jour:** Janvier 2024
