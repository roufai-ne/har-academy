from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter()

class CourseRecommendation(BaseModel):
    courseId: str
    title: str
    score: float
    reason: str

class RecommendationRequest(BaseModel):
    userId: str
    userInterests: Optional[List[str]] = []
    completedCourses: Optional[List[str]] = []
    limit: int = 5

# Pattern-based recommendations (simplified, no LLM)
DOMAIN_KEYWORDS = {
    'dev_web': ['web', 'html', 'css', 'javascript', 'react', 'node', 'backend', 'frontend'],
    'mobile': ['mobile', 'ios', 'android', 'flutter', 'react native', 'app'],
    'data_science': ['data', 'python', 'machine learning', 'ai', 'analytics', 'pandas'],
    'design': ['design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator'],
    'marketing': ['marketing', 'seo', 'social media', 'ads', 'growth']
}

def calculate_match_score(user_interests: List[str], course_tags: List[str]) -> float:
    """Simple pattern matching to calculate relevance score"""
    if not user_interests or not course_tags:
        return 0.5
    
    matches = 0
    for interest in user_interests:
        interest_lower = interest.lower()
        for tag in course_tags:
            if interest_lower in tag.lower() or tag.lower() in interest_lower:
                matches += 1
    
    # Normalize score between 0.5 and 0.95
    max_possible = len(user_interests) * len(course_tags)
    if max_possible == 0:
        return 0.5
    
    score = 0.5 + (matches / max_possible) * 0.45
    return round(min(score, 0.95), 2)

@router.post("/personalized", response_model=List[CourseRecommendation])
async def get_personalized_recommendations(request: RecommendationRequest):
    """
    Get personalized course recommendations based on user interests.
    Uses basic pattern matching (no LLM required for Phase 1).
    """
    recommendations = []
    
    # Mock course database - in production, fetch from course service
    mock_courses = [
        {"id": "1", "title": "Web Development with React", "tags": ["web", "react", "javascript", "frontend"]},
        {"id": "2", "title": "Python for Data Science", "tags": ["data", "python", "analytics"]},
        {"id": "3", "title": "Mobile App with Flutter", "tags": ["mobile", "flutter", "app"]},
        {"id": "4", "title": "UI/UX Design Fundamentals", "tags": ["design", "ui", "ux", "figma"]},
        {"id": "5", "title": "Digital Marketing Strategy", "tags": ["marketing", "seo", "social media"]},
    ]
    
    # Calculate scores based on user interests
    for course in mock_courses:
        if course["id"] not in (request.completedCourses or []):
            score = calculate_match_score(request.userInterests, course["tags"])
            if score > 0.6:  # Only recommend if score is decent
                recommendations.append(
                    CourseRecommendation(
                        courseId=course["id"],
                        title=course["title"],
                        score=score,
                        reason=f"Matches your interests: {', '.join(request.userInterests[:2])}"
                    )
                )
    
    # Sort by score and limit
    recommendations.sort(key=lambda x: x.score, reverse=True)
    return recommendations[:request.limit]

@router.get("/trending", response_model=List[CourseRecommendation])
async def get_trending_courses(limit: int = 10):
    """Get trending courses (simplified without analytics)."""
    # Mock trending - in production, based on enrollment metrics
    trends = [
        CourseRecommendation(
            courseId=f"trending_{i}",
            title=f"Popular Course {i}",
            score=0.85,
            reason="High enrollment this week"
        )
        for i in range(1, min(limit + 1, 11))
    ]
    return trends

@router.post("/similar/{course_id}", response_model=List[CourseRecommendation])
async def get_similar_courses(course_id: str, limit: int = 5):
    """Get courses similar to the specified course (pattern-based)."""
    # Mock similar courses
    similar = [
        CourseRecommendation(
            courseId=f"similar_{i}",
            title=f"Related Course {i}",
            score=0.80,
            reason="Similar content and level"
        )
        for i in range(1, min(limit + 1, 6))
    ]
    return similar
