from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.dashboard import DashboardAnalyticsResponse
from app.services.analytics_service import get_dashboard_analytics

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """
    Returns high-level fintech security analytics aggregated live from actual database records.
    """
    return get_dashboard_analytics(db)

