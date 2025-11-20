from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseSettings
import uvicorn

class Settings(BaseSettings):
    app_name: str = "HAR Academy AI Service"
    debug: bool = True
    openai_api_key: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-powered features for HAR Academy: recommendations, content generation, RAG chatbot",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "HAR Academy AI Service",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=settings.debug)
