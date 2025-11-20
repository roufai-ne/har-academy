# API Contracts - Har Academy

Ce document définit les contrats d'API entre les différents services de Har Academy.

## Format de Réponse Standard

Toutes les API doivent retourner des réponses dans ce format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object (optional)
  },
  "meta": {
    "timestamp": string (ISO8601),
    "version": string
  }
}
```

## API Gateway → Auth Service

### Vérification JWT
```http
GET /api/v1/auth/verify-jwt
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "user_id": "ObjectId",
    "email": "string",
    "role": "learner|instructor|admin"
  }
}

Response (401):
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token invalide ou expiré"
  }
}
```

### Profil Utilisateur
```http
GET /api/v1/auth/users/{id}
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "ObjectId",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "createdAt": "ISODate"
  }
}
```

## API Gateway → Course Service

### Liste des Cours
```http
GET /api/v1/courses
Query:
  - page: number
  - limit: number
  - search: string
  - domain: string
  - stack: string[]
  - price_min: number
  - price_max: number

Response (200):
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "ObjectId",
        "title": "string",
        "description": "string",
        "instructor": {
          "id": "ObjectId",
          "name": "string"
        },
        "price": number,
        "domain": "string",
        "stack": string[],
        "status": "string"
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### Détails d'un Cours
```http
GET /api/v1/courses/{id}
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "instructor": {
      "id": "uuid",
      "name": "string"
    },
    "price": number,
    "domain": "string",
    "stack": string[],
    "status": "string",
    "modules": [
      {
        "id": "uuid",
        "title": "string",
        "lessons": [
          {
            "id": "uuid",
            "title": "string",
            "type": "string",
            "duration": number
          }
        ]
      }
    ]
  }
}
```

## API Gateway → Payment Service

### Vérification d'Accès
```http
GET /api/v1/payment/user/{userId}/entitlements
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "has_subscription": boolean,
    "subscription_type": "basic|premium|null",
    "purchased_courses": [
      {
        "course_id": "uuid",
        "purchased_at": "string"
      }
    ]
  }
}
```

### Création de Transaction
```http
POST /api/v1/payment/purchase
Headers:
  - Authorization: Bearer {token}
Body:
{
  "course_id": "uuid",
  "amount": number,
  "currency": "EUR",
  "payment_method": "card|stripe"
}

Response (201):
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "client_secret": "string", // Pour Stripe
    "status": "pending|completed",
    "amount": number,
    "currency": "EUR"
  }
}
```

## Course Service → Auth Service

### Vérification d'Instructeur
```http
GET /api/v1/auth/users/{id}/is-instructor
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "is_instructor": boolean,
    "status": "active|pending|suspended"
  }
}
```

## Course Service → Payment Service

### Vérification d'Inscription
```http
GET /api/v1/payment/verify-enrollment
Headers:
  - Authorization: Bearer {token}
Query:
  - user_id: string
  - course_id: string

Response (200):
{
  "success": true,
  "data": {
    "has_access": boolean,
    "access_type": "purchase|subscription",
    "expires_at": "string|null"
  }
}
```

## Payment Service → Course Service

### Détails du Cours pour Achat
```http
GET /api/v1/courses/{id}/purchase-details
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "price": number,
    "instructor_id": "uuid"
  }
}
```

## API Gateway → AI Service

### Recommandations
```http
POST /api/v1/ai/recommendations
Headers:
  - Authorization: Bearer {token}
Body:
{
  "user_id": "uuid",
  "limit": number
}

Response (200):
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "course_id": "uuid",
        "score": number,
        "reason": "string"
      }
    ]
  }
}
```

### Génération de Quiz
```http
POST /api/v1/ai/generate-quiz
Headers:
  - Authorization: Bearer {token}
Body:
{
  "lesson_id": "uuid",
  "content": "string",
  "num_questions": number
}

Response (200):
{
  "success": true,
  "data": {
    "questions": [
      {
        "text": "string",
        "options": [
          {
            "text": "string",
            "is_correct": boolean
          }
        ],
        "explanation": "string"
      }
    ]
  }
}
```

## Codes d'Erreur Communs

```javascript
// Auth Errors
INVALID_TOKEN: "Token invalide ou expiré"
UNAUTHORIZED: "Non autorisé"
FORBIDDEN: "Accès refusé"

// Resource Errors
NOT_FOUND: "Ressource non trouvée"
ALREADY_EXISTS: "La ressource existe déjà"
VALIDATION_ERROR: "Données invalides"

// Business Logic Errors
INSUFFICIENT_FUNDS: "Solde insuffisant"
ALREADY_ENROLLED: "Déjà inscrit à ce cours"
COURSE_NOT_AVAILABLE: "Cours non disponible"

// System Errors
INTERNAL_ERROR: "Erreur interne du serveur"
SERVICE_UNAVAILABLE: "Service temporairement indisponible"
RATE_LIMIT_EXCEEDED: "Limite de requêtes dépassée"
```

## Standards de Sécurité

1. **Authentication**
   - Tous les endpoints sauf `/auth/login` et `/auth/register` requièrent un JWT valide
   - Format JWT: `Authorization: Bearer {token}`
   - TTL: 24h pour access token, 7 jours pour refresh token

2. **Rate Limiting**
   - Auth endpoints: 5 requêtes/10min/IP
   - API endpoints: 100 requêtes/heure/user
   - AI endpoints: 20 requêtes/heure/user

3. **Validation**
   - Tous les IDs doivent être des ObjectIds MongoDB valides
   - Validation stricte des emails
   - XSS protection sur tous les champs texte
   - Taille maximum des payloads: 1MB

## Standards de Performance

1. **Timeouts**
   - Timeout par défaut: 30s
   - AI endpoints timeout: 60s
   - Long-polling timeout: 60s

2. **Pagination**
   - Limite par défaut: 20 items
   - Limite maximum: 100 items
   - Format: `?page=1&limit=20`

3. **Caching**
   - Cache Redis: 5-30 minutes selon l'endpoint
   - Cache-Control headers pour réponses statiques
   - ETags pour optimization