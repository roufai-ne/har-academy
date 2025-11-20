# Course Service Integration Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional, for full stack)
- MongoDB (local development)

### Local Development Setup

#### 1. Install Dependencies
```powershell
cd packages/backend/course-service
npm ci
```

#### 2. Configure Environment
```powershell
# Copy the example .env file
cp .env.example .env

# Edit .env with your settings
# Ensure MONGODB_URI points to your local MongoDB instance
```

#### 3. Start MongoDB (if running locally)
```powershell
# Using Docker
docker run -d `
  -e MONGO_INITDB_ROOT_USERNAME=har_admin `
  -e MONGO_INITDB_ROOT_PASSWORD=mongopassword `
  -e MONGO_INITDB_DATABASE=har_academy_courses `
  -p 27017:27017 `
  --name course-mongodb `
  mongo:7-alpine

# Or connect to existing MongoDB instance
```

#### 4. Start the Service
```powershell
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The service will be available at `http://localhost:3002`

### Running Tests

```powershell
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- course.controller.test.js
```

### Docker Deployment

#### Using docker-compose.override.yml
```powershell
# From project root
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# This will:
# - Start MongoDB
# - Start Redis (inherited from base compose)
# - Start the course service
# - Set up proper networking and health checks
```

#### Building Manually
```powershell
# Build image
docker build -t har-academy/course-service:latest ./packages/backend/course-service

# Run container
docker run -p 3002:3002 `
  -e MONGODB_URI=mongodb://har_admin:password@host.docker.internal:27017/har_academy_courses?authSource=admin `
  -e JWT_SECRET=your_secret `
  har-academy/course-service:latest
```

## API Documentation

### Base URL
- Local: `http://localhost:3002/api/v1`
- Docker: `http://course-service:3002/api/v1`

### Health Check
```bash
GET /health
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Courses
- `GET /courses` - List all published courses (public)
- `POST /courses` - Create new course (instructor)
- `GET /courses/slug/{slug}` - Get course by slug (public)
- `PUT /courses/{id}` - Update course (instructor)
- `DELETE /courses/{id}` - Delete course (instructor)
- `GET /courses/{id}/analytics` - Get course analytics (instructor)

#### Enrollments
- `POST /enrollments` - Enroll in course (student)
- `GET /enrollments/my` - Get my enrollments (student)
- `GET /enrollments/{id}` - Get enrollment details (student/instructor)
- `PUT /enrollments/{id}/progress` - Update progress (student)
- `GET /enrollments/{id}/certificate` - Get certificate (student)
- `POST /enrollments/{id}/cancel` - Cancel enrollment (student)

#### Reviews
- `POST /reviews` - Create review (student)
- `GET /reviews/course/{courseId}` - Get course reviews (public)
- `PUT /reviews/{id}` - Update review (student)
- `DELETE /reviews/{id}` - Delete review (student)
- `POST /reviews/{id}/helpful` - Mark helpful (student)
- `POST /reviews/{id}/report` - Report review (student)
- `PUT /reviews/{id}/moderate` - Moderate review (admin)

#### Categories
- `GET /categories` - List categories (public)
- `GET /categories/slug/{slug}` - Get category details (public)
- `POST /categories` - Create category (admin)
- `PUT /categories/{id}` - Update category (admin)
- `DELETE /categories/{id}` - Delete category (admin)

### OpenAPI/Swagger
Full API documentation is available in:
- `src/docs/openapi.json` - OpenAPI 3.0 specification
- Swagger UI: Available at `/api/v1/docs` (when enabled)

## Development Workflow

### Code Structure
```
src/
├── config/          # Configuration
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── utils/          # Utilities (logger, helpers, DB)
├── app.js          # Express app
└── docs/           # OpenAPI specs

tests/
├── controllers/    # Controller tests
└── utils/          # Test setup and helpers
```

### Adding New Features

1. **Create Model** (`src/models/`)
   - Define MongoDB schema
   - Add validation and methods

2. **Create Controller** (`src/controllers/`)
   - Implement business logic
   - Add error handling

3. **Create Routes** (`src/routes/`)
   - Define endpoints
   - Add middleware

4. **Add Tests** (`tests/`)
   - Unit tests for controllers
   - Integration tests for APIs

### Code Quality

```powershell
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests with coverage report
npm test
```

## Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running: `docker ps | grep mongodb`
- Check connection URI in `.env`
- Verify credentials in environment variables

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3002
```
```powershell
# Kill process on port 3002
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### JWT Token Issues
```
Error: Invalid token
```
- Ensure `JWT_SECRET` is set in environment
- Verify token hasn't expired
- Check token format: `Bearer <token>`

## Monitoring and Logging

### Logs Location
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`

### Log Levels
Configure in `.env`: `LOG_LEVEL=debug|info|warn|error`

### Health Check
```bash
curl http://localhost:3002/health
```

## Performance Tips

1. **Database Indexing**
   - Indexes are created automatically on model initialization
   - For large collections, consider custom index strategies

2. **Caching**
   - Redis cache TTL: `CACHE_TTL=3600` (1 hour default)
   - Adjust based on data freshness requirements

3. **Pagination**
   - Default limit: 10 items per page
   - Max limit: 100 items per page
   - Always paginate large result sets

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets (32+ characters)
   - Rotate secrets regularly

2. **CORS Configuration**
   - Whitelist specific origins
   - Disable in production if not needed

3. **Rate Limiting**
   - Implement per-endpoint limits
   - Monitor for abuse patterns

4. **Data Validation**
   - All inputs validated with Joi schemas
   - Never trust client data

## Deployment Checklist

- [ ] Set strong `JWT_SECRET` and `MONGO_PASSWORD`
- [ ] Configure MongoDB with proper authentication
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure backups for MongoDB
- [ ] Test all endpoints with production data
- [ ] Set up health checks
- [ ] Configure auto-scaling if needed

## Next Steps

- Implement API Gateway integration
- Add request/response caching
- Set up monitoring and alerts
- Configure CI/CD pipeline
- Add more comprehensive tests
- Implement rate limiting
- Add request validation middleware
