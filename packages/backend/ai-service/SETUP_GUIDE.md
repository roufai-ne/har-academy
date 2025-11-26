# AI Service Setup Guide

## Prerequisites

The AI service is a Python FastAPI application that provides:
- Personalized course recommendations
- Automated quiz generation
- RAG-based chatbot (optional)

## Setup Options

### Option 1: Docker (Recommended for Windows)

**Requirements:**
- Docker Desktop installed and running

**Steps:**
```bash
# From project root
docker-compose up -d ai-service --build

# Check logs
docker-compose logs -f ai-service

# Test the service
curl http://localhost:8001/health
```

**Note:** If Docker Desktop is not running, start it first.

---

### Option 2: Linux/WSL2

**Requirements:**
- Python 3.11+
- pip

**Steps:**
```bash
cd packages/backend/ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
# OR
.\venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and set:
# BACKEND_URL=http://localhost:8000
# AI_SERVICE_PORT=8001

# Run the service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

### Option 3: Windows with Build Tools

**Requirements:**
- Python 3.11+
- Microsoft Visual C++ Build Tools (for scikit-learn)
- Rust compiler (for pydantic-core)

**Install Build Tools:**

1. **Visual C++ Build Tools:**
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install "Desktop development with C++"

2. **Rust:**
   - Download from: https://rustup.rs/
   - Run installer and follow prompts

3. **Then install dependencies:**
```bash
cd packages/backend/ai-service
python -m venv venv
.\.gemini\venv\Scripts\activate
pip install -r requirements.txt
```

**Note:** This option is complex and not recommended for development.

---

### Option 4: Simplified Mode (Current State)

The AI service currently has **minimal dependencies** to avoid build issues:
- FastAPI
- Uvicorn
- Pydantic
- httpx

**Missing features in this mode:**
- ChromaDB (RAG/vector search) - gracefully degrades
- Advanced ML features (scikit-learn, numpy, pandas)

**To run:**
```bash
cd packages/backend/ai-service
python -m venv venv
.\.gemini\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

---

## Environment Variables

Create `packages/backend/ai-service/.env`:

```env
# App Configuration
APP_NAME=HAR Academy AI Service
DEBUG=true
AI_SERVICE_PORT=8001
LOG_LEVEL=info

# Backend Integration
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=

# Vector DB (Optional)
VECTOR_DB_PATH=./data/chromadb
VECTOR_DB_COLLECTION=har_academy_courses

# LLM (Optional - not required for basic features)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
LLM_PROVIDER=none

# Recommendations
RECOMMENDATION_MIN_SCORE=0.5
RECOMMENDATION_MAX_RESULTS=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

---

## Testing the AI Service

Once running, test the endpoints:

### Health Check
```bash
curl http://localhost:8001/health
```

### Get Recommendations
```bash
curl -X POST http://localhost:8001/api/v1/recommendations/personalized \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID_HERE", "limit": 5}'
```

### Generate Quiz
```bash
curl -X POST http://localhost:8001/api/v1/content/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Python is a high-level programming language. It was created by Guido van Rossum in 1991.",
    "num_questions": 3,
    "difficulty": "medium"
  }'
```

### API Documentation
Visit: http://localhost:8001/docs

---

## Integration with Frontend

The frontend is already configured to call the AI service through the API Gateway:

**File:** `packages/frontend/src/services/recommendationService.ts`

```typescript
// Get personalized recommendations
const recommendations = await recommendationService.getPersonalized(5)

// Get trending courses
const trending = await recommendationService.getTrending(10)

// Get similar courses
const similar = await recommendationService.getSimilar(courseId, 3)
```

**Note:** The API Gateway proxies `/api/ai/*` to the AI service.

---

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Ensure you're in the virtual environment and all dependencies are installed.

### Issue: "Port 8001 already in use"
**Solution:** 
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8001 | xargs kill -9
```

### Issue: ChromaDB errors
**Solution:** ChromaDB is optional. The service will log a warning and continue without RAG features.

### Issue: Pydantic build errors on Windows
**Solution:** Use Docker or WSL2, or install Rust compiler.

---

## Production Deployment

For production, use Docker Compose:

```yaml
# docker-compose.yml (already configured)
ai-service:
  build:
    context: ./packages/backend/ai-service
  environment:
    AI_SERVICE_PORT: 8001
    BACKEND_URL: http://api-gateway:8000
    DEBUG: false
  ports:
    - "8001:8001"
```

Deploy with:
```bash
docker-compose up -d
```

---

## Current Status

✅ **Implemented:**
- Recommendation engine (rule-based)
- Quiz generator (NLP-based)
- Chatbot service (template-based)
- Backend integration client
- FastAPI endpoints
- API documentation

⏸️ **Pending:**
- Local Windows deployment (build tool issues)
- ChromaDB integration (optional)
- LLM integration (optional)

🎯 **Recommended Next Step:**
Use Docker to deploy the AI service, or proceed with frontend testing using mock data until Docker is available.

---

**Last Updated:** 2025-11-21
