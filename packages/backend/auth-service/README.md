# Auth Service

Authentication and authorization service for HAR Academy, handling user management, JWT tokens, and role-based access control.

## Features

- **User Registration**: Email/password signup with validation
- **Login**: JWT-based authentication
- **Email Verification**: Token-based email verification
- **Password Reset**: Secure password reset flow
- **Profile Management**: Update user information
- **Role-Based Access Control**: Learner, Instructor, Admin roles
- **Admin Functions**: User management and role assignment

## Tech Stack

- Node.js 18+ with Express
- PostgreSQL with Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing
- Winston logging

## API Endpoints

### Public Routes
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/verify/:token` - Verify email
- `POST /api/v1/auth/password-reset/request` - Request password reset
- `POST /api/v1/auth/password-reset/:token` - Reset password

### Protected Routes
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/password/change` - Change password

### Admin Routes
- `GET /api/v1/auth/users` - Get all users
- `PUT /api/v1/auth/users/:userId/role` - Update user role
- `PATCH /api/v1/auth/users/:userId/toggle-status` - Activate/deactivate user

## User Roles

| Role | Description |
|------|-------------|
| learner | Standard user, can enroll in courses |
| instructor | Can create and manage courses |
| admin | Full system access, user management |

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. Start service:
```bash
npm run dev  # Development
npm start    # Production
```

## Database

The service uses PostgreSQL. Sequelize models will auto-sync in development. For production, use migrations:

```bash
npx sequelize-cli migration:generate --name init
npx sequelize-cli db:migrate
```

## Docker

```bash
docker build -t har-auth-service .
docker run -p 3000:3000 --env-file .env har-auth-service
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```
