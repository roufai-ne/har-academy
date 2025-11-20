# 🚀 Run All Services - Quick Guide

## Option 1: Docker Compose (Recommended)

### Start Everything

```bash
# From project root
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

### Expected Services Running

```
NAME                  STATUS          PORTS
har-mongodb-auth      Up (healthy)    0.0.0.0:27019->27017/tcp
har-mongodb-courses   Up (healthy)    0.0.0.0:27017->27017/tcp
har-mongodb-payments  Up (healthy)    0.0.0.0:27018->27017/tcp
har-redis             Up (healthy)    0.0.0.0:6379->6379/tcp
har-auth-service      Up              0.0.0.0:3001->3001/tcp
har-course-service    Up              0.0.0.0:3002->3002/tcp
har-payment-service   Up              0.0.0.0:3003->3003/tcp
har-ai-service        Up              0.0.0.0:5000->5000/tcp
har-api-gateway       Up              0.0.0.0:8000->8000/tcp
```

### Health Checks

```bash
# Auth Service
curl http://localhost:3001/api/v1/health

# Course Service
curl http://localhost:3002/api/v1/health

# Payment Service
curl http://localhost:3003/api/v1/health

# AI Service
curl http://localhost:5000/api/v1/health

# API Gateway
curl http://localhost:8000/api/v1/health
```

---

## Option 2: Local Development (Individual Services)

### Prerequisites

```bash
# Install Node.js 18+
node --version

# Install Python 3.9+ (for AI Service)
python --version

# Start databases only
docker compose up -d mongodb-auth mongodb-courses mongodb-payments redis
```

### 1. Run Auth Service

```bash
cd packages/backend/auth-service

# Install dependencies (first time only)
npm install

# Copy .env if not exists
cp .env.example .env

# Start in dev mode
npm run dev

# Service starts on http://localhost:3001
```

**Test:**
```bash
curl http://localhost:3001/api/v1/health
```

---

### 2. Run Course Service

```bash
# In a new terminal
cd packages/backend/course-service

# Install dependencies
npm install

# Copy .env
cp .env.example .env

# Start in dev mode
npm run dev

# Service starts on http://localhost:3002
```

**Test:**
```bash
curl http://localhost:3002/api/v1/health
```

---

### 3. Run Payment Service

```bash
# In a new terminal
cd packages/backend/payment-service

# Install dependencies
npm install

# Copy .env
cp .env.example .env

# Add Stripe test keys to .env
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# Start in dev mode
npm run dev

# Service starts on http://localhost:3003
```

**Test:**
```bash
curl http://localhost:3003/api/v1/health
```

---

### 4. Run AI Service (Python/FastAPI)

```bash
# In a new terminal
cd packages/backend/ai-service

# Create virtual environment (first time)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy .env
cp .env.example .env

# Add OpenAI key to .env
# OPENAI_API_KEY=sk-...

# Start in dev mode
uvicorn app.main:app --reload --port 5000

# Service starts on http://localhost:5000
```

**Test:**
```bash
curl http://localhost:5000/api/v1/health
```

---

### 5. Run API Gateway

```bash
# In a new terminal
cd packages/backend/api-gateway

# Install dependencies
npm install

# Copy .env
cp .env.example .env

# Start in dev mode
npm run dev

# Service starts on http://localhost:8000
```

**Test:**
```bash
curl http://localhost:8000/api/v1/health
```

---

## 🧪 Quick Integration Test

### Test Full Auth Flow Through API Gateway

```bash
# 1. Register via API Gateway
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Save the token from response

# 2. Get profile via API Gateway
TOKEN="your_token_here"

curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. List courses via API Gateway
curl http://localhost:8000/api/v1/courses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker compose ps mongodb-auth mongodb-courses mongodb-payments

# Check logs
docker compose logs mongodb-auth

# Restart MongoDB
docker compose restart mongodb-auth
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in .env
```

### Service Won't Start

```bash
# Check logs
cd packages/backend/auth-service
npm run dev

# Check for missing dependencies
npm install

# Check .env file exists
ls -la .env

# Check MongoDB connection string in .env
cat .env | grep MONGO_URI
```

### "Module not found" Error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Service Dependencies

```
                    ┌─────────────┐
                    │ API Gateway │
                    │  (Port 8000)│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌────▼────┐     ┌────▼────┐
    │   Auth    │    │ Course  │     │ Payment │
    │  (3001)   │    │ (3002)  │     │ (3003)  │
    └─────┬─────┘    └────┬────┘     └────┬────┘
          │               │                │
          └───────┬───────┴────────┬───────┘
                  │                │
         ┌────────▼────────┐  ┌───▼────┐
         │    MongoDB      │  │ Redis  │
         │ (27017-27019)   │  │ (6379) │
         └─────────────────┘  └────────┘
```

**Start Order:**
1. MongoDB (3 instances) + Redis
2. Auth Service (others depend on it)
3. Course, Payment, AI Services (can start in parallel)
4. API Gateway (last, routes to all services)

---

## 📝 Environment Variables Checklist

### Auth Service (.env)
```bash
PORT=3001
MONGO_URI=mongodb://admin:mongopassword@mongodb-auth:27017/har_auth?authSource=admin
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
```

### Course Service (.env)
```bash
PORT=3002
MONGO_URI=mongodb://admin:mongopassword@mongodb-courses:27017/har_courses?authSource=admin
JWT_SECRET=your-secret-key  # Same as Auth Service
AUTH_SERVICE_URL=http://localhost:3001
```

### Payment Service (.env)
```bash
PORT=3003
MONGO_URI=mongodb://admin:mongopassword@mongodb-payments:27017/har_payments?authSource=admin
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
COURSE_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
```

### AI Service (.env)
```bash
PORT=5000
OPENAI_API_KEY=sk-...
COURSE_SERVICE_URL=http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3001
```

### API Gateway (.env)
```bash
PORT=8000
AUTH_SERVICE_URL=http://localhost:3001
COURSE_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
AI_SERVICE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
```

---

## ✅ Services Running Checklist

- [ ] MongoDB Auth (27019) - Healthy
- [ ] MongoDB Courses (27017) - Healthy
- [ ] MongoDB Payments (27018) - Healthy
- [ ] Redis (6379) - Healthy
- [ ] Auth Service (3001) - Running, /health responds
- [ ] Course Service (3002) - Running, /health responds
- [ ] Payment Service (3003) - Running, /health responds
- [ ] AI Service (5000) - Running, /health responds
- [ ] API Gateway (8000) - Running, /health responds

**If all checked → System is ready for testing!**

---

## 🎯 Quick Commands Reference

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f auth-service

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Restart a service
docker compose restart auth-service

# Rebuild a service
docker compose up -d --build auth-service

# Execute command in container
docker compose exec auth-service sh

# Connect to MongoDB
docker compose exec mongodb-auth mongosh -u admin -p mongopassword

# Connect to Redis
docker compose exec redis redis-cli
```

---

**Next:** Test individual services with [TEST_AUTH_SERVICE.md](TEST_AUTH_SERVICE.md)
