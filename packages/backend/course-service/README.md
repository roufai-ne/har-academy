# HAR Academy — Course Service

This service manages courses, enrollments, reviews and categories for HAR Academy.

## Requirements
- Node.js >= 18
- npm
- MongoDB (local or via Docker)

## Quick start (local)

1. Copy environment file:

   cp .env.example .env

2. Install dependencies:

   npm ci

3. Start the service (development):

   npm run dev

4. API base path:

   http://localhost:3002/api/v1

## Docker

Build and run using the repository root `docker-compose.yml`:

- Service name: `course-service` (exposes port `3002`)

## Tests

Run tests with coverage:

```powershell
npm test
```

Watch mode:

```powershell
npm run test:watch
```

CI mode (JUnit report):

```powershell
npm run test:ci
```

## OpenAPI

A minimal OpenAPI spec is available at `src/docs/openapi.json` (serving not implemented in this PR).

## Notes
- Health check endpoint: `/health`
- API root: `/api/v1`
- JWT auth required for protected endpoints. Use the Auth service for token generation.

If you want, I can add an endpoint to serve the OpenAPI spec and a small Postman collection next.