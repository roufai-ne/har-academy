import httpx
from typing import List, Optional, Dict, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class BackendClient:
    """Client to interact with HAR Academy Backend API"""
    
    def __init__(self):
        self.base_url = settings.backend_url
        self.api_key = settings.backend_api_key
        self.timeout = 10.0
    
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    async def get_courses(self, status: str = "published", limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch all published courses"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/courses",
                    params={"status": status, "limit": limit},
                    headers=self._get_headers()
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("courses", [])
                else:
                    logger.warning(f"Failed to fetch courses: {response.status_code}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching courses: {e}")
            return []
    
    async def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single course by ID"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/courses/{course_id}",
                    headers=self._get_headers()
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("course")
                else:
                    logger.warning(f"Course {course_id} not found")
                    return None
        except Exception as e:
            logger.error(f"Error fetching course {course_id}: {e}")
            return None
    
    async def get_user_enrollments(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch user's enrollments"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/enrollments/user/{user_id}",
                    headers=self._get_headers()
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("enrollments", [])
                else:
                    logger.warning(f"Failed to fetch enrollments for user {user_id}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching enrollments: {e}")
            return []
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user profile"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/auth/profile/{user_id}",
                    headers=self._get_headers()
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("user")
                else:
                    logger.warning(f"User {user_id} not found")
                    return None
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            return None

# Singleton instance
backend_client = BackendClient()
