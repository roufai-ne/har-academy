from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# ============= Enums =============

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple-choice"
    TRUE_FALSE = "true-false"
    SHORT_ANSWER = "short-answer"

# ============= Recommendation Models =============

class CourseRecommendation(BaseModel):
    course_id: str = Field(..., alias="courseId")
    title: str
    score: float = Field(..., ge=0.0, le=1.0)
    reason: str
    domain: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, alias="difficultyLevel")
    estimated_duration: Optional[float] = Field(None, alias="estimatedDuration")
    
    class Config:
        populate_by_name = True

class RecommendationRequest(BaseModel):
    user_id: str = Field(..., alias="userId")
    limit: int = Field(default=5, ge=1, le=20)
    
    class Config:
        populate_by_name = True

class RecommendationResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    meta: Dict[str, Any] = {}

# ============= Quiz Models =============

class QuizOption(BaseModel):
    id: str
    text: str
    is_correct: bool = Field(..., alias="isCorrect")
    
    class Config:
        populate_by_name = True

class QuizQuestion(BaseModel):
    id: str
    text: str
    type: QuestionType = QuestionType.MULTIPLE_CHOICE
    options: List[QuizOption]
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    explanation: Optional[str] = None

class QuizGenerationRequest(BaseModel):
    content: str
    num_questions: int = Field(default=5, ge=1, le=20, alias="numQuestions")
    language: str = Field(default="fr", pattern="^(fr|en)$")
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    
    class Config:
        populate_by_name = True

class QuizGenerationResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]

# ============= Chatbot Models =============

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatSource(BaseModel):
    lesson_id: str = Field(..., alias="lessonId")
    lesson_title: str = Field(..., alias="lessonTitle")
    excerpt: str
    
    class Config:
        populate_by_name = True

class ChatRequest(BaseModel):
    message: str
    course_id: str = Field(..., alias="courseId")
    lesson_id: Optional[str] = Field(None, alias="lessonId")
    conversation_id: Optional[str] = Field(None, alias="conversationId")
    
    class Config:
        populate_by_name = True

class ChatResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]

# ============= Course Models (for internal use) =============

class Course(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, alias="difficultyLevel")
    instructor_id: Optional[str] = Field(None, alias="instructorId")
    price: Optional[float] = None
    rating: Optional[float] = None
    students_count: Optional[int] = Field(0, alias="studentsCount")
    status: Optional[str] = "draft"
    
    class Config:
        populate_by_name = True

class Enrollment(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str = Field(..., alias="userId")
    course_id: str = Field(..., alias="courseId")
    progress: float = 0.0
    completed: bool = False
    enrolled_at: Optional[datetime] = Field(None, alias="enrolledAt")
    
    class Config:
        populate_by_name = True

class User(BaseModel):
    id: str = Field(..., alias="_id")
    email: str
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    role: str = "learner"
    preferences: Optional[Dict[str, Any]] = {}
    
    class Config:
        populate_by_name = True
