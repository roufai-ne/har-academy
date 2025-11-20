# AI Core Service

Python FastAPI service providing AI-powered features for HAR Academy: personalized recommendations, content generation, RAG chatbot, and learning analytics.

## Features

### 1. Course Recommendations
- **Personalized**: ML-based recommendations using collaborative filtering
- **Trending**: Popular courses based on engagement metrics
- **Similar**: Content-based similarity matching

### 2. Content Generation
- **Quiz Generation**: Auto-generate quiz questions using GPT-4
- **Summaries**: AI-powered content summarization
- **Learning Paths**: Personalized course sequences for skill development

### 3. RAG Chatbot
- **Q&A**: Answer questions using course content (ChromaDB vector store)
- **Context-Aware**: Maintains conversation history
- **Source Attribution**: Cites specific course materials

### 4. Learning Analytics
- **Performance Metrics**: Track completion rates, scores, time spent
- **Engagement Analysis**: Platform-wide usage patterns
- **Predictive Models**: Forecast course completion likelihood

## Tech Stack

- Python 3.11+ with FastAPI
- OpenAI API (GPT-4) for content generation
- ChromaDB for vector storage (RAG)
- scikit-learn for recommendation algorithms
- pandas/numpy for data processing

## API Endpoints

### Recommendations
- `POST /api/v1/recommendations/personalized` - Get personalized courses
- `GET /api/v1/recommendations/trending` - Get trending courses
- `POST /api/v1/recommendations/similar/{course_id}` - Find similar courses

### Content Generation
- `POST /api/v1/content/quiz` - Generate quiz questions
- `POST /api/v1/content/summary` - Summarize content
- `POST /api/v1/content/learning-path` - Create learning path

### Chatbot
- `POST /api/v1/chatbot/ask` - Ask question (RAG-based)
- `POST /api/v1/chatbot/feedback` - Submit feedback
- `GET /api/v1/chatbot/history/{user_id}` - Get conversation history

### Analytics
- `POST /api/v1/analytics/performance` - Get user performance metrics
- `GET /api/v1/analytics/engagement` - Get engagement analytics
- `POST /api/v1/analytics/predict-completion` - Predict completion

## Setup

1. Install Python 3.11+

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Add your OpenAI API key
```

5. Start service:
```bash
python -m uvicorn app.main:app --reload --port 8001
```

6. Access documentation:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Docker

```bash
docker build -t har-ai-service .
docker run -p 8001:8001 --env-file .env har-ai-service
```

## Development

Current implementation uses mock data for rapid development. Production implementation requires:

1. **OpenAI Integration**: Replace mock with actual GPT-4 API calls
2. **ChromaDB Setup**: Configure vector store for RAG chatbot
3. **ML Models**: Train recommendation and prediction models
4. **Database**: Connect to course/user databases for real data

## Testing

```bash
pytest tests/ --cov=app
```

## Future Enhancements

- Multi-language support with translation
- Voice-to-text for accessibility
- Adaptive learning difficulty adjustment
- Plagiarism detection for assignments
- Social learning network analysis
