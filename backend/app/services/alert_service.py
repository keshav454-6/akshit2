from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.models.entities import Alert, Transaction, User, Investigation
from app.schemas.alert import AlertUpdate

def get_alerts(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    priority: Optional[str] = None
) -> List[Alert]:
    query = db.query(Alert)
    
    if status and status != "all":
        query = query.filter(Alert.status == status)
    if priority and priority != "all":
        query = query.filter(Alert.priority == priority)
        
    return query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()

def get_alert_by_id(db: Session, alert_id: str) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == alert_id).first()

def update_alert(
    db: Session,
    alert_id: str,
    update_data: AlertUpdate,
    user_id: Optional[str] = None
) -> Optional[Alert]:
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        return None
        
    if update_data.status:
        alert.status = update_data.status
    if update_data.priority:
        alert.priority = update_data.priority
    if update_data.resolution_notes:
        alert.resolution_notes = update_data.resolution_notes
        
    if user_id:
        alert.reviewed_by = user_id
        
    # If escalated, auto-create or update investigation
    if update_data.status == "escalated":
        existing_inv = db.query(Investigation).filter(Investigation.alert_id == alert.id).first()
        if not existing_inv:
            new_inv = Investigation(
                alert_id=alert.id,
                transaction_id=alert.transaction_id,
                analyst_id=user_id,
                status="in_progress",
                notes=f"Escalated from Alert: {alert.reason}",
                findings={"triggered_rules": alert.triggered_rules, "escalated_by": user_id}
            )
            db.add(new_inv)
            
    db.commit()
    db.refresh(alert)
    return alert

