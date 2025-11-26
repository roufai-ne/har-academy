from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    app_name: str = "HAR Academy AI Service"
    debug: bool = True
    ai_service_port: int = 8001
    log_level: str = "info"
    
    # Backend Integration
    backend_url: str = "http://localhost:8000"
    backend_api_key: str = ""
    
    # Vector DB
    vector_db_path: str = "./data/chromadb"
    vector_db_collection: str = "har_academy_courses"
    
    # LLM (Optional)
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    llm_provider: str = "none"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # Recommendations
    recommendation_min_score: float = 0.5
    recommendation_max_results: int = 10
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:8000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
