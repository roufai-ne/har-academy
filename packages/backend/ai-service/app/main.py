from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.vector_db_service import vector_db_service
import uvicorn
import logging

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    description="AI-powered features for HAR Academy: recommendations, content generation, RAG chatbot",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api import recommendations, content_generation, chatbot, analytics

app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(content_generation.router, prefix="/api/v1/content", tags=["content"])
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["chatbot"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/health")
def health_check():
    vector_stats = vector_db_service.get_collection_stats()
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0",
        "vectorDb": vector_stats
    }

@app.get("/")
def root():
    return {
        "message": "HAR Academy AI Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/api/v1/vector-db/ingest/{course_id}")
async def ingest_course(course_id: str):
    """Ingest course content into vector DB for RAG chatbot."""
    success = await vector_db_service.ingest_course(course_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to ingest course content")
    return {"success": True, "message": f"Course {course_id} ingested successfully"}

@app.delete("/api/v1/vector-db/{course_id}")
async def remove_course_vectors(course_id: str):
    """Remove course content from vector DB."""
    success = vector_db_service.delete_course(course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found in vector DB")
    return {"success": True, "message": f"Course {course_id} removed from vector DB"}

@app.get("/api/v1/vector-db/stats")
def vector_db_stats():
    """Get vector database statistics."""
    return vector_db_service.get_collection_stats()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.ai_service_port, reload=settings.debug)
