from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.quiz_service import quiz_service
from app.models.schemas import QuizQuestion, QuizGenerationRequest, DifficultyLevel
import re
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class SummaryRequest(BaseModel):
    content: str
    maxLength: int = 200


class SummaryResponse(BaseModel):
    summary: str
    keyPoints: List[str]


@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate quiz questions from course content using NLP techniques.
    Uses sentence extraction, key term identification, cloze tests, and distractor generation.
    """
    try:
        questions = quiz_service.generate_quiz(
            content=request.content,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            language=request.language
        )

        if not questions:
            raise HTTPException(
                status_code=400,
                detail="Could not generate questions from provided content. Please provide more text."
            )

        return questions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")


@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate a basic summary using text extraction.
    """
    sentences = re.split(r'[.!?]+', request.content)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

    summary_sentences = sentences[:min(3, len(sentences))]
    summary = '. '.join(summary_sentences) + '.'

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
    Generate learning path using predefined progression templates.
    """
    levels = ["beginner", "intermediate", "advanced"]

    path = [
        f"{request.targetSkill} - {level.capitalize()}"
        for level in levels
    ]

    return LearningPathResponse(
        path=path,
        estimatedDuration="12 weeks",
        milestones=["Complete fundamentals", "Build practical projects", "Master advanced concepts"]
    )
