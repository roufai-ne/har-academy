"""
Simple AI Service Runner
Runs the HAR Academy AI Service without heavy dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="HAR Academy AI Service",
    description="AI-powered features for HAR Academy (Simplified Version)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    limit: int = 5

class CourseRecommendation(BaseModel):
    course_id: str
    title: str
    score: float
    reason: str

class QuizRequest(BaseModel):
    content: str
    num_questions: int = 5
    difficulty: str = "medium"

class QuizOption(BaseModel):
    id: str
    text: str
    isCorrect: bool

class QuizQuestion(BaseModel):
    id: str
    text: str
    type: str
    options: List[QuizOption]
    difficulty: str
    explanation: str

# Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0-simplified"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HAR Academy AI Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/api/v1/recommendations/personalized")
async def get_personalized_recommendations(request: RecommendationRequest):
    """
    Get personalized course recommendations
    Simplified version returns mock data
    """
    logger.info(f"Getting personalized recommendations for user: {request.user_id}")
    
    # Mock recommendations
    recommendations = [
        CourseRecommendation(
            course_id="mock_1",
            title="Introduction to Python Programming",
            score=0.95,
            reason="Based on your interest in programming"
        ),
        CourseRecommendation(
            course_id="mock_2",
            title="Web Development with React",
            score=0.88,
            reason="Complements your JavaScript skills"
        ),
        CourseRecommendation(
            course_id="mock_3",
            title="Data Science Fundamentals",
            score=0.82,
            reason="Popular among similar learners"
        )
    ]
    
    return {
        "success": True,
        "data": {
            "recommendations": recommendations[:request.limit],
            "source": "rule-based-simplified"
        }
    }

@app.get("/api/v1/recommendations/trending")
async def get_trending_courses(limit: int = 5):
    """Get trending courses"""
    logger.info(f"Getting trending courses (limit: {limit})")
    
    trending = [
        {"course_id": "trend_1", "title": "Machine Learning Basics", "enrollments": 1250},
        {"course_id": "trend_2", "title": "Full Stack Development", "enrollments": 980},
        {"course_id": "trend_3", "title": "Mobile App Development", "enrollments": 856},
    ]
    
    return {
        "success": True,
        "data": {"courses": trending[:limit]}
    }

@app.get("/api/v1/recommendations/similar/{course_id}")
async def get_similar_courses(course_id: str, limit: int = 3):
    """Get similar courses"""
    logger.info(f"Getting similar courses for: {course_id}")
    
    similar = [
        {"course_id": "sim_1", "title": "Advanced Topics in " + course_id, "similarity": 0.92},
        {"course_id": "sim_2", "title": "Practical Applications", "similarity": 0.85},
    ]
    
    return {
        "success": True,
        "data": {"courses": similar[:limit]}
    }

@app.post("/api/v1/content/quiz")
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz from content
    Simplified version with basic text processing
    """
    logger.info(f"Generating quiz with {request.num_questions} questions")
    
    # Simple quiz generation
    questions = []
    sentences = [s.strip() for s in request.content.split('.') if len(s.strip()) > 20]
    
    for i, sentence in enumerate(sentences[:request.num_questions]):
        words = sentence.split()
        if len(words) > 5:
            # Find a word to blank out (middle word)
            blank_index = len(words) // 2
            blank_word = words[blank_index]
            question_text = sentence.replace(blank_word, "______")
            
            questions.append(QuizQuestion(
                id=f"q{i+1}",
                text=question_text,
                type="multiple_choice",
                options=[
                    QuizOption(id="A", text=blank_word, isCorrect=True),
                    QuizOption(id="B", text=blank_word + "s", isCorrect=False),
                    QuizOption(id="C", text="Option C", isCorrect=False),
                    QuizOption(id="D", text="Option D", isCorrect=False),
                ],
                difficulty=request.difficulty,
                explanation=f"The correct answer is '{blank_word}'."
            ))
    
    return {
        "success": True,
        "data": {
            "questions": questions,
            "total": len(questions)
        }
    }

@app.post("/api/v1/chatbot/ask")
async def chatbot_ask(question: dict):
    """Simple chatbot endpoint"""
    user_question = question.get("question", "")
    logger.info(f"Chatbot question: {user_question}")
    
    # Simple template-based responses
    response = "I'm here to help! This is a simplified AI assistant. For detailed help, please contact support."
    
    if "cours" in user_question.lower() or "course" in user_question.lower():
        response = "You can browse our courses in the Courses section. Each course has detailed information about content, duration, and prerequisites."
    elif "help" in user_question.lower() or "aide" in user_question.lower():
        response = "I can help you with course recommendations, quiz generation, and general questions about the platform."
    
    return {
        "success": True,
        "data": {
            "answer": response,
            "confidence": 0.75,
            "sources": []
        }
    }

if __name__ == "__main__":
    logger.info("Starting HAR Academy AI Service (Simplified)")
    logger.info("This version runs without heavy ML dependencies")
    logger.info("Server will be available at: http://localhost:8001")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
