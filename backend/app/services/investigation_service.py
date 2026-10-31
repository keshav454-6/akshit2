from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.entities import Investigation, Alert, Transaction, User
from app.schemas.investigation import InvestigationCreate, InvestigationUpdate

def get_investigations(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
) -> List[Investigation]:
    query = db.query(Investigation)
    if status and status != "all":
        query = query.filter(Investigation.status == status)
    return query.order_by(desc(Investigation.created_at)).offset(skip).limit(limit).all()

def get_investigation_by_id(db: Session, investigation_id: str) -> Optional[Investigation]:
    return db.query(Investigation).filter(Investigation.id == investigation_id).first()

def create_investigation(
    db: Session,
    data: InvestigationCreate,
    analyst_id: Optional[str] = None
) -> Investigation:
    inv = Investigation(
        alert_id=data.alert_id,
        transaction_id=data.transaction_id,
        analyst_id=analyst_id,
        status=data.status or "open",
        notes=data.notes,
        findings=data.findings or {},
        outcome=data.outcome
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

def update_investigation(
    db: Session,
    investigation_id: str,
    data: InvestigationUpdate,
    analyst_id: Optional[str] = None
) -> Optional[Investigation]:
    inv = get_investigation_by_id(db, investigation_id)
    if not inv:
        return None
        
    if data.status:
        inv.status = data.status
    if data.notes is not None:
        inv.notes = data.notes
    if data.findings is not None:
        inv.findings = data.findings
    if data.outcome:
        inv.outcome = data.outcome
        # If outcome is confirmed_fraud, update related alert
        if inv.alert_id:
            alert = db.query(Alert).filter(Alert.id == inv.alert_id).first()
            if alert:
                alert.status = "resolved"
                alert.resolution_notes = f"Investigation concluded: {data.outcome}. Notes: {data.notes or ''}"
                
    if analyst_id and not inv.analyst_id:
        inv.analyst_id = analyst_id
        
    db.commit()
    db.refresh(inv)
    return inv

