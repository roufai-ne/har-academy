# API Gateway

Centralized API Gateway for HAR Academy microservices architecture. Routes requests to appropriate backend services with rate limiting, CORS, and security.

## Features

- **Service Routing**: Proxy requests to Auth, Course, Payment, and AI services
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Security**: Helmet.js security headers
- **Logging**: Request logging with Winston
- **Health Checks**: Gateway and service health monitoring

## Tech Stack

- Node.js 18+ with Express
- http-proxy-middleware for service proxying
- express-rate-limit for DDoS protection
- Winston for logging

## Route Mapping

| Gateway Route | Target Service | Backend Endpoint |
|--------------|----------------|------------------|
| `/api/auth/*` | Auth Service (3000) | `/api/v1/auth/*` |
| `/api/courses/*` | Course Service (3001) | `/api/v1/courses/*` |
| `/api/payments/*` | Payment Service (3002) | `/api/v1/payments/*` |
| `/api/ai/*` | AI Service (8001) | `/api/v1/*` |

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit service URLs if needed
```

3. Start gateway:
```bash
npm run dev  # Development with auto-reload
npm start    # Production
```

## Usage Examples

```bash
# Auth - Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Courses - List
curl http://localhost:8000/api/courses

# Payments - Create purchase
curl -X POST http://localhost:8000/api/payments/purchase \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"courseId":"123","amount":49.99}'

# AI - Get recommendations
curl http://localhost:8000/api/ai/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Docker

```bash
docker build -t har-api-gateway .
docker run -p 8000:8000 --env-file .env har-api-gateway
```

## Monitoring

Health check: `GET /health`

Returns:
```json
{
  "status": "ok",
  "service": "api-gateway",
  "uptime": 12345.67
}
```
