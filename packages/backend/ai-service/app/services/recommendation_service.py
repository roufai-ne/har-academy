from typing import List, Dict, Any, Set
from app.services.backend_client import backend_client
from app.models.schemas import CourseRecommendation
from app.config import settings
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Recommendation engine using rule-based and content-based filtering.
    No ML models required - uses heuristics and similarity scoring.
    """
    
    async def get_personalized_recommendations(
        self, 
        user_id: str, 
        limit: int = 5
    ) -> List[CourseRecommendation]:
        """
        Generate personalized recommendations based on:
        1. User's enrolled courses (domain preference)
        2. Courses not yet enrolled
        3. Difficulty progression
        4. Popularity (students count)
        """
        try:
            # Fetch user data
            enrollments = await backend_client.get_user_enrollments(user_id)
            all_courses = await backend_client.get_courses(status="published")
            
            # Get enrolled course IDs
            enrolled_ids: Set[str] = {e.get("courseId", e.get("course_id")) for e in enrollments}
            
            # Get user's preferred domains from enrollments
            enrolled_courses = [c for c in all_courses if str(c.get("_id")) in enrolled_ids]
            preferred_domains = self._extract_preferred_domains(enrolled_courses)
            
            # Filter out already enrolled courses
            candidate_courses = [c for c in all_courses if str(c.get("_id")) not in enrolled_ids]
            
            # Score each candidate
            scored_courses = []
            for course in candidate_courses:
                score = self._calculate_recommendation_score(
                    course, 
                    preferred_domains, 
                    enrolled_courses
                )
                if score >= settings.recommendation_min_score:
                    scored_courses.append((course, score))
            
            # Sort by score and take top N
            scored_courses.sort(key=lambda x: x[1], reverse=True)
            top_courses = scored_courses[:min(limit, settings.recommendation_max_results)]
            
            # Convert to recommendations
            recommendations = []
            for course, score in top_courses:
                reason = self._generate_reason(course, preferred_domains, enrolled_courses)
                recommendations.append(
                    CourseRecommendation(
                        courseId=str(course.get("_id")),
                        title=course.get("title", "Unknown Course"),
                        score=round(score, 2),
                        reason=reason,
                        domain=course.get("domain"),
                        difficultyLevel=course.get("difficultyLevel", course.get("difficulty_level")),
                        estimatedDuration=course.get("duration", 0)
                    )
                )
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _extract_preferred_domains(self, enrolled_courses: List[Dict]) -> Dict[str, int]:
        """Count courses per domain to identify preferences"""
        domain_count = defaultdict(int)
        for course in enrolled_courses:
            domain = course.get("domain", "general")
            domain_count[domain] += 1
        return dict(domain_count)
    
    def _calculate_recommendation_score(
        self, 
        course: Dict[str, Any], 
        preferred_domains: Dict[str, int],
        enrolled_courses: List[Dict]
    ) -> float:
        """
        Calculate recommendation score (0-1) based on multiple factors:
        - Domain match: 0.4 weight
        - Difficulty progression: 0.3 weight
        - Popularity: 0.2 weight
        - Rating: 0.1 weight
        """
        score = 0.0
        
        # 1. Domain Match Score (0.4)
        course_domain = course.get("domain", "general")
        if course_domain in preferred_domains:
            domain_score = min(preferred_domains[course_domain] / 5.0, 1.0)
            score += 0.4 * domain_score
        
        # 2. Difficulty Progression Score (0.3)
        difficulty_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
        course_difficulty = difficulty_map.get(
            course.get("difficultyLevel", course.get("difficulty_level", "beginner")), 
            1
        )
        
        if enrolled_courses:
            avg_enrolled_difficulty = sum(
                difficulty_map.get(c.get("difficultyLevel", c.get("difficulty_level", "beginner")), 1) 
                for c in enrolled_courses
            ) / len(enrolled_courses)
            
            # Prefer courses slightly above current level
            difficulty_diff = abs(course_difficulty - avg_enrolled_difficulty)
            if difficulty_diff <= 1:
                score += 0.3 * (1 - difficulty_diff / 2)
        else:
            # New users: prefer beginner courses
            if course_difficulty == 1:
                score += 0.3
        
        # 3. Popularity Score (0.2)
        students_count = course.get("studentsCount", course.get("students_count", 0))
        if students_count > 0:
            popularity_score = min(students_count / 1000.0, 1.0)
            score += 0.2 * popularity_score
        
        # 4. Rating Score (0.1)
        rating = course.get("rating", 0)
        if rating > 0:
            rating_score = rating / 5.0
            score += 0.1 * rating_score
        
        return min(score, 1.0)
    
    def _generate_reason(
        self, 
        course: Dict[str, Any], 
        preferred_domains: Dict[str, int],
        enrolled_courses: List[Dict]
    ) -> str:
        """Generate human-readable reason for recommendation"""
        course_domain = course.get("domain", "general")
        
        if course_domain in preferred_domains:
            return f"Basé sur votre intérêt pour {course_domain}"
        
        if not enrolled_courses:
            return "Parfait pour commencer votre apprentissage"
        
        students_count = course.get("studentsCount", course.get("students_count", 0))
        if students_count > 500:
            return "Cours populaire dans votre domaine"
        
        rating = course.get("rating", 0)
        if rating >= 4.5:
            return "Très bien noté par les apprenants"
        
        return "Recommandé pour vous"

# Singleton instance
recommendation_service = RecommendationService()
