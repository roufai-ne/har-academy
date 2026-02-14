from fastapi import APIRouter, HTTPException
from typing import List
from app.services.recommendation_service import recommendation_service
from app.services.backend_client import backend_client
from app.models.schemas import CourseRecommendation, RecommendationRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/personalized", response_model=List[CourseRecommendation])
async def get_personalized_recommendations(request: RecommendationRequest):
    """
    Get personalized course recommendations based on user enrollment history.
    Uses content-based filtering with domain, difficulty, popularity, and rating scores.
    """
    try:
        recommendations = await recommendation_service.get_personalized_recommendations(
            user_id=request.user_id,
            limit=request.limit
        )
        return recommendations
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.get("/trending", response_model=List[CourseRecommendation])
async def get_trending_courses(limit: int = 10):
    """Get trending courses based on recent enrollment metrics."""
    try:
        courses = await backend_client.get_courses(status="published", limit=limit)

        trending = []
        sorted_courses = sorted(
            courses,
            key=lambda c: c.get("studentsCount", c.get("students_count", 0)),
            reverse=True
        )

        for course in sorted_courses[:limit]:
            students = course.get("studentsCount", course.get("students_count", 0))
            trending.append(
                CourseRecommendation(
                    courseId=str(course.get("_id", "")),
                    title=course.get("title", "Unknown"),
                    score=min(students / 1000.0, 0.95) if students > 0 else 0.5,
                    reason="Populaire cette semaine"
                )
            )

        return trending
    except Exception as e:
        logger.error(f"Trending error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending courses")


@router.post("/similar/{course_id}", response_model=List[CourseRecommendation])
async def get_similar_courses(course_id: str, limit: int = 5):
    """Get courses similar to the specified course based on domain and difficulty."""
    try:
        target_course = await backend_client.get_course_by_id(course_id)
        if not target_course:
            raise HTTPException(status_code=404, detail="Course not found")

        all_courses = await backend_client.get_courses(status="published")
        target_domain = target_course.get("domain", "")
        target_difficulty = target_course.get("difficultyLevel", target_course.get("difficulty_level", ""))

        similar = []
        for course in all_courses:
            cid = str(course.get("_id", ""))
            if cid == course_id:
                continue

            score = 0.0
            if course.get("domain") == target_domain:
                score += 0.5
            difficulty = course.get("difficultyLevel", course.get("difficulty_level", ""))
            if difficulty == target_difficulty:
                score += 0.3
            rating = course.get("rating", 0)
            if rating > 0:
                score += 0.2 * (rating / 5.0)

            if score > 0.3:
                similar.append(
                    CourseRecommendation(
                        courseId=cid,
                        title=course.get("title", "Unknown"),
                        score=round(score, 2),
                        reason="Contenu et niveau similaires"
                    )
                )

        similar.sort(key=lambda x: x.score, reverse=True)
        return similar[:limit]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Similar courses error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch similar courses")
