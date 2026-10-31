from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class InvestigationCreate(BaseModel):
    alert_id: Optional[str] = None
    transaction_id: str
    status: str = "open"
    notes: Optional[str] = None
    findings: Optional[Dict[str, Any]] = None
    outcome: Optional[str] = None

class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    findings: Optional[Dict[str, Any]] = None
    outcome: Optional[str] = None

class InvestigationResponse(BaseModel):
    id: str
    alert_id: Optional[str] = None
    transaction_id: str
    analyst_id: Optional[str] = None
    status: str
    notes: Optional[str] = None
    findings: Dict[str, Any]
    outcome: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    transaction_details: Optional[Dict[str, Any]] = None
    analyst_name: Optional[str] = None

    class Config:
        from_attributes = True

