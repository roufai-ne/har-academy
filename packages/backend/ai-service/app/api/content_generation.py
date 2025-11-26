from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re
import random

router = APIRouter()

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str

class QuizGenerationRequest(BaseModel):
    courseId: str
    topic: str
    difficulty: str = "medium"
    numQuestions: int = 5

class SummaryRequest(BaseModel):
    content: str
    maxLength: int = 200

class SummaryResponse(BaseModel):
    summary: str
    keyPoints: List[str]

# Pattern-based quiz templates (no LLM)
QUIZ_TEMPLATES = {
    'dev_web': [
        ("What is {keyword}?", ["A programming language", "A framework", "A library", "A tool"]),
        ("Which of these is used for {keyword}?", ["HTML", "CSS", "JavaScript", "Python"]),
        ("How do you implement {keyword}?", ["Method A", "Method B", "Method C", "Method D"]),
    ],
    'data_science': [
        ("What does {keyword} stand for in data science?", ["Definition A", "Definition B", "Definition C", "Definition D"]),
        ("Which algorithm is best for {keyword}?", ["Linear Regression", "Neural Networks", "Decision Trees", "K-Means"]),
    ],
    'mobile': [
        ("What framework is used for {keyword}?", ["React Native", "Flutter", "Ionic", "Xamarin"]),
        ("How do you optimize {keyword}?", ["Caching", "Lazy loading", "Compression", "All of the above"]),
    ]
}

def extract_keywords(topic: str) -> List[str]:
    """Extract keywords from topic using regex"""
    # Remove common words
    common_words = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']
    words = re.findall(r'\b\w+\b', topic.lower())
    return [w for w in words if w not in common_words and len(w) > 3]

@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate quiz questions using pattern matching (no GPT-4).
    Uses predefined templates and topic keywords.
    """
    keywords = extract_keywords(request.topic)
    if not keywords:
        keywords = ["concept", "topic", "subject"]
    
    # Determine domain from topic
    domain = 'dev_web'  # Default
    topic_lower = request.topic.lower()
    if any(word in topic_lower for word in ['data', 'analytics', 'python']):
        domain = 'data_science'
    elif any(word in topic_lower for word in ['mobile', 'app', 'ios', 'android']):
        domain = 'mobile'
    
    templates = QUIZ_TEMPLATES.get(domain, QUIZ_TEMPLATES['dev_web'])
    questions = []
    
    for i in range(request.numQuestions):
        template = templates[i % len(templates)]
        keyword = keywords[i % len(keywords)]
        
        question_text = template[0].format(keyword=keyword)
        options = template[1].copy()
        correct_idx = random.randint(0, len(options) - 1)
        
        questions.append(
            QuizQuestion(
                question=question_text,
                options=options,
                correctAnswer=correct_idx,
                explanation=f"The correct answer explains {keyword} in the context of {request.topic}."
            )
        )
    
    return questions

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate a basic summary using text extraction (no LLM).
    """
    # Simple summarization: take first sentences
    sentences = re.split(r'[.!?]+', request.content)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    # Take first 2-3 sentences as summary
    summary_sentences = sentences[:min(3, len(sentences))]
    summary = '. '.join(summary_sentences) + '.'
    
    # Extract key points (sentences with keywords)
    keywords = ['important', 'key', 'main', 'essential', 'crucial', 'fundamental']
    key_points = []
    for sentence in sentences[:10]:
        if any(kw in sentence.lower() for kw in keywords):
            key_points.append(sentence.strip())
    
    if not key_points:
        key_points = sentences[:3]
    
    return SummaryResponse(
        summary=summary[:request.maxLength],
        keyPoints=key_points[:3]
    )

class LearningPathRequest(BaseModel):
    userId: str
    targetSkill: str
    currentLevel: str = "beginner"

class LearningPathResponse(BaseModel):
    path: List[str]
    estimatedDuration: str
    milestones: List[str]

@router.post("/learning-path", response_model=LearningPathResponse)
async def generate_learning_path(request: LearningPathRequest):
    """
    Generate learning path using predefined templates.
    """
    levels = ["beginner", "intermediate", "advanced"]
    target_skill = request.targetSkill.lower()
    
    path = [
        f"{request.targetSkill} - {level.capitalize()}"
        for level in levels
    ]
    
    return LearningPathResponse(
        path=path,
        estimatedDuration="12 weeks",
        milestones=["Complete fundamentals", "Build practical projects", "Master advanced concepts"]
    )
