import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FraudGuard AI"
    TAGLINE: str = "Detect Before You Pay. Protect Every Transaction."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fraudguard-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (PostgreSQL primary with SQLite local fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./fraudguard.db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Models path
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODEL_DIR: str = os.path.join(BASE_DIR, "ml", "saved_models")
    
settings = Settings()

