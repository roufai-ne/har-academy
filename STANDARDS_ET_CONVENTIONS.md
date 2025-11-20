# STANDARDS_ET_CONVENTIONS.md

## 📋 Standards de Code & Conventions

**Ce fichier définit les règles d'or pour que tous les agents suivent les mêmes conventions et que le code soit cohérent.**

---

## 1. Structure des Répertoires

### Monorepo Root
```
har-academy/
├── packages/
│   ├── frontend/               # React/Vue app
│   ├── backend/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── course-service/
│   │   ├── payment-service/
│   │   └── ai-core-service/
│   └── shared/                 # Types, constants, utils partagés
├── docs/                       # Documentation
├── .github/workflows/          # CI/CD
├── docker-compose.yml
└── README.md
```

---

## 2. Nommage des Fichiers

| Contexte | Convention | Exemple |
|----------|-----------|---------|
| **Fichiers** | kebab-case | `user-controller.js`, `auth-middleware.py` |
| **Dossiers** | kebab-case | `auth-service/`, `user-models/` |
| **Classes/Types** | PascalCase | `UserModel`, `CourseService`, `PaymentManager` |
| **Functions** | camelCase | `getUserById()`, `calculateProgress()` |
| **Constants** | UPPER_SNAKE_CASE | `DB_HOST`, `MAX_RETRIES`, `DEFAULT_TTL` |
| **Variables** | camelCase | `userId`, `courseTitle`, `isActive` |
| **Booleans** | is/has + PascalCase | `isActive`, `hasAccess`, `canEdit` |
| **Enums** | PascalCase | `UserRole.LEARNER`, `CourseStatus.PUBLISHED` |

---

## 3. Nommage des Endpoints API

### Conventions REST
```
Resource-based URLs:

GET    /api/v1/courses              → List all courses
GET    /api/v1/courses/:id          → Get single course
POST   /api/v1/courses              → Create course
PATCH  /api/v1/courses/:id          → Update course
DELETE /api/v1/courses/:id          → Delete course

Nested resources:
GET    /api/v1/courses/:courseId/modules/:moduleId/lessons
POST   /api/v1/courses/:courseId/modules

Actions:
POST   /api/v1/courses/:id/publish   → Non-CRUD action
POST   /api/v1/users/:id/enroll
```

### Response Format - TOUJOURS utiliser:
```javascript
{
  "success": Boolean,
  "data": Object | Array | null,
  "error": {
    "code": String,
    "message": String,
    "details": Object (optional)
  },
  "meta": {
    "timestamp": ISO8601,
    "version": "1.0"
  }
}
```

### Status Codes
```
200 OK              - Requête réussie
201 Created         - Ressource créée
204 No Content      - Suppression réussie
400 Bad Request     - Erreur validation
401 Unauthorized    - Auth requise
403 Forbidden       - Access denied
404 Not Found       - Ressource inexistante
409 Conflict        - Conflit (ex: email déjà utilisé)
422 Unprocessable   - Logic error (ex: enroll impossible)
429 Too Many Requests - Rate limit atteint
500 Internal Server - Erreur serveur
```

---

## 4. Authentification & Sécurité

### JWT Tokens
```
Header: "Authorization: Bearer {token}"
Algorithm: HS256 (dev) ou RS256 (prod)
TTL: 24h (access), 7 jours (refresh)
Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "learner|instructor|admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Password Requirements
```
Minimum: 8 characters
Must contain: 1 uppercase, 1 lowercase, 1 number, 1 special char
Hash: bcryptjs avec salt rounds = 10
Never store plain text
```

### Rate Limiting
```
Auth endpoints: 5 requests per 10 minutes per IP
API endpoints: 100 requests per 1 hour per user
AI Chat: 20 requests per 1 hour per user
Retry-After header: Always include si 429
```

---

## 5. Logging & Monitoring

### Logging Levels
```
DEBUG    - Dev info only (variables values, flow)
INFO     - Important actions (login, course created, payment)
WARNING  - Unexpected but handled (rate limit, retry)
ERROR    - Error occurred but recoverable (failed payment, bad input)
CRITICAL - Fatal error (DB down, service crash)
```

### Log Format Standard
```
timestamp | level | service | request_id | message | context

2024-01-15T10:30:45.123Z | INFO | auth-service | req-12345 | User registered | {"email":"user@test.com","role":"learner"}
```

### Must Log
- User authentication (login, logout, signup)
- Course enrollment / payments
- Admin actions
- All errors + stack traces
- API responses (anonymized)

---

## 6. Database Design

### MongoDB Collections Naming
```
users           (never "Users" or "user")
courses
modules
lessons
enrollments
lesson_progress
transactions
subscriptions
quizzes
quiz_questions
quiz_attempts
```

### Indexing Strategy
```
Always index:
- User IDs (lookups)
- Course IDs (lookups)
- Foreign keys (relationships)
- Status fields (filtering)
- Timestamps (sorting)
- Email (unique)

Example:
db.courses.createIndex({ instructor_id: 1, status: 1 })
db.enrollments.createIndex({ user_id: 1, course_id: 1 }, { unique: true })
```

### Denormalization Guidelines
```
DO denormalize:
- Frequently accessed related data
- Instructor name in courses collection
- User name in enrollments

DON'T denormalize:
- Frequently changing data
- Course content (could become stale)
- Lists that grow infinitely
```

---

## 7. Error Handling

### Try-Catch Pattern
```javascript
// CORRECT
try {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // process user
} catch (error) {
  logger.error('Failed to fetch user', { userId, error: error.message });
  res.status(500).json({
    success: false,
    error: { code: 'USER_FETCH_ERROR', message: 'Failed to fetch user' }
  });
}

// WRONG - Don't do this:
const user = await User.findById(userId);  // No error handling
res.json(user);
```

### Custom Error Classes
```javascript
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
  }
}
```

---

## 8. Environment Variables

### Naming Convention
```
SERVICE_NAME: value
DATABASE_URL: mongodb://...
JWT_SECRET: secret-key
EXTERNAL_API_KEY: api-key
FEATURE_FLAG_SOMETHING: true/false
LOG_LEVEL: debug|info|warn|error
```

### Never Commit
```
.env
.env.local
.env.prod
*.key
*.pem
```

### Always Include
```
.env.example (with dummy values)
Instructions in README for setup
```

---

## 9. Testing

### File Organization
```
src/
├── services/
│   └── user-service.js
├── __tests__/
│   └── user-service.test.js
```

### Test Naming
```javascript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when user exists', () => { ... });
    it('should throw NotFoundError when user not found', () => { ... });
    it('should return user with correct fields', () => { ... });
  });
});
```

### Coverage Targets
```
Backend: 80% minimum
- Auth service: 90%
- Core endpoints: 85%
- Utils: 70%

Frontend: 70% minimum
- Components: 75%
- Hooks: 80%
- Utils: 60%
```

---

## 10. Git & Commits

### Branch Naming
```
feature/user-auth       → Feature development
bugfix/login-issue      → Bug fix
hotfix/payment-critical → Critical production fix
chore/update-deps       → Maintenance
docs/api-documentation  → Documentation
```

### Commit Messages
```
Format: [TYPE] message

Types:
feat:     New feature
fix:      Bug fix
refactor: Code refactor
docs:     Documentation
chore:    Maintenance
test:     Testing

Examples:
[feat] Add user authentication endpoint
[fix] Fix course enrollment validation
[chore] Update npm dependencies
```

### PR Guidelines
```
Title: [Agent Name] Brief description

Description:
- What was implemented
- Key features/fixes
- Breaking changes (if any)

Tests:
- [ ] Unit tests added
- [ ] Integration tests passed
- [ ] Manual testing done

- Linked to: #[issue_number]
```

---

## 11. Documentation

### README Structure
```
# Service Name

## Overview
Brief description (1-2 paragraphs)

## Features
- Feature 1
- Feature 2

## Getting Started
```bash
npm install
npm run dev
```

## API Endpoints
- GET /api/v1/... → Description

## Environment Variables
| Variable | Required | Description |
| ... |

## Testing
```bash
npm test
```

## Deployment
Instructions for production deployment
```

### Code Comments
```javascript
// GOOD: Explains WHY
// User retries 3 times because API sometimes returns 500 on first attempt
const MAX_RETRIES = 3;

// BAD: Explains WHAT (code already does that)
// Set max retries to 3
const MAX_RETRIES = 3;
```

---

## 12. Frontend Specific

### Component Structure
```javascript
// components/CourseCard.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CourseCard component displays course info
 * @param {Object} course - Course data
 * @param {Function} onEnroll - Callback on enroll
 */
function CourseCard({ course, onEnroll }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="course-card">
      {/* JSX */}
    </div>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.required,
    title: PropTypes.string.required,
  }).required,
  onEnroll: PropTypes.func.required,
};

export default CourseCard;
```

### CSS Class Naming (BEM)
```css
.course-card { }
.course-card__image { }
.course-card__content { }
.course-card__title { }
.course-card--featured { }

/* Tailwind (preferred) */
<div className="bg-white rounded-lg shadow hover:shadow-lg">
```

---

## 13. Backend Specific (Python)

### Module Organization
```python
# services/user_service.py
from typing import Optional, Dict
from models import User
from utils import logger

class UserService:
    """Service for user-related operations."""
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[User]:
        """Fetch user by ID."""
        try:
            user = User.objects(id=user_id).first()
            return user
        except Exception as e:
            logger.error(f"Failed to fetch user: {e}")
            raise
```

### Type Hints
```python
# GOOD
def create_course(title: str, price: float) -> Course:
    pass

def get_users(limit: int = 10) -> List[User]:
    pass

# Avoid bare except or generic Exception
try:
    ...
except SpecificError as e:
    ...
```

---

## 14. Performance Guidelines

### Caching Strategy
```
Database queries: Cache 5-30 minutes (Redis)
User recommendations: Cache 1 hour
Course list: Cache 1 hour (invalidate on course update)
User profile: Cache 10 minutes (invalidate on profile update)

Cache Key Pattern:
user:{user_id}:profile
course:{course_id}:details
courses:list:{page}:{filters}
```

### Query Optimization
```
❌ N+1 Query Problem:
for course in courses:
    instructor = fetch_instructor(course.instructor_id)

✅ Use Joins/Aggregation:
db.courses.aggregate([
  {$lookup: {from: "users", ...}}
])

❌ Full Collection Scan:
db.courses.find({title: "Python"})

✅ Use Index:
db.courses.find({title: "Python"}).hint({title: 1})
```

---

## 15. Checklist d'Agent

Avant de soumettre du code:

- [ ] Code follows naming conventions
- [ ] Error handling implemented
- [ ] Logging added for important actions
- [ ] Input validation on all endpoints
- [ ] Tests written and passing
- [ ] Documentation updated (README, JSDoc)
- [ ] No hardcoded values (use env vars)
- [ ] No console.log (use proper logger)
- [ ] No TODO comments (resolve or create issue)
- [ ] Code formatted (Prettier/Black)
- [ ] Linting passes (ESLint/Pylint)
- [ ] No secrets in code
- [ ] Database indexes created
- [ ] Performance considered

---

**Validity:** Updated per release cycle
**Last Updated:** 2024-01-15