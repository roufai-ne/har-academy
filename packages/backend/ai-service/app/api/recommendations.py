from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

class CourseRecommendation(BaseModel):
    courseId: str
    title: str
    score: float
    reason: str

class RecommendationRequest(BaseModel):
    userId: str
    limit: int = 5

@router.post("/personalized", response_model=List[CourseRecommendation])
async def get_personalized_recommendations(request: RecommendationRequest):
    """
    Get personalized course recommendations based on user history and preferences.
    Uses collaborative filtering and content-based algorithms.
    """
    # Mock implementation - in production, use ML model
    recommendations = [
        CourseRecommendation(
            courseId=f"course_{i}",
            title=f"Recommended Course {i}",
            score=round(random.uniform(0.7, 0.99), 2),
            reason="Based on your interests in web development"
        )
        for i in range(1, request.limit + 1)
    ]
    return recommendations

@router.get("/trending", response_model=List[CourseRecommendation])
async def get_trending_courses(limit: int = 10):
    """Get trending courses based on enrollment and engagement metrics."""
    trends = [
        CourseRecommendation(
            courseId=f"trending_{i}",
            title=f"Trending Course {i}",
            score=round(random.uniform(0.8, 0.95), 2),
            reason="Popular this week"
        )
        for i in range(1, limit + 1)
    ]
    return trends

@router.post("/similar/{course_id}", response_model=List[CourseRecommendation])
async def get_similar_courses(course_id: str, limit: int = 5):
    """Get courses similar to the specified course."""
    similar = [
        CourseRecommendation(
            courseId=f"similar_{i}",
            title=f"Similar Course {i}",
            score=round(random.uniform(0.75, 0.92), 2),
            reason="Similar content and difficulty"
        )
        for i in range(1, limit + 1)
    ]
    return similar
