from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class AlertResponse(BaseModel):
    id: str
    transaction_id: str
    alert_type: str
    priority: str  # critical, high, medium, low
    status: str    # new, under_review, resolved, escalated
    reason: str
    triggered_rules: List[str]
    reviewed_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    transaction_details: Optional[dict] = None

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: Optional[str] = None  # new, under_review, resolved, escalated
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None

