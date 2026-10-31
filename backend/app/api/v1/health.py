import os
from fastapi import APIRouter
from app.ml.detector import fraud_detector
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "database": "sqlite/postgresql",
        "ml_engine_loaded": fraud_detector.is_loaded
    }

