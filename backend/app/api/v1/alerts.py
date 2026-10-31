from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.alert import AlertResponse, AlertUpdate
from app.services.alert_service import get_alerts, get_alert_by_id, update_alert
from app.services.auth_service import get_current_user
from app.models.entities import User

router = APIRouter(prefix="/alerts", tags=["Fraud Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None, description="new, under_review, resolved, escalated"),
    priority: Optional[str] = Query(None, description="critical, high, medium, low"),
    db: Session = Depends(get_db)
):
    alerts = get_alerts(db, skip=skip, limit=limit, status=status, priority=priority)
    results = []
    for a in alerts:
        res = AlertResponse.from_orm(a)
        if a.transaction:
            res.transaction_details = {
                "transaction_id": a.transaction.transaction_id,
                "amount": a.transaction.amount,
                "sender_id": a.transaction.sender_id,
                "receiver_id": a.transaction.receiver_id,
                "location": a.transaction.location,
                "timestamp": a.transaction.timestamp.isoformat()
            }
        results.append(res)
    return results

@router.get("/{id}", response_model=AlertResponse)
def get_alert(
    id: str,
    db: Session = Depends(get_db)
):
    alert = get_alert_by_id(db, id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    res = AlertResponse.from_orm(alert)
    if alert.transaction:
        res.transaction_details = {
            "transaction_id": alert.transaction.transaction_id,
            "amount": alert.transaction.amount,
            "sender_id": alert.transaction.sender_id,
            "receiver_id": alert.transaction.receiver_id,
            "location": alert.transaction.location,
            "timestamp": alert.transaction.timestamp.isoformat()
        }
    return res

@router.patch("/{id}", response_model=AlertResponse)
def modify_alert(
    id: str,
    update_data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_id = current_user.id if current_user else None
    updated = update_alert(db, id, update_data, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    res = AlertResponse.from_orm(updated)
    if updated.transaction:
        res.transaction_details = {
            "transaction_id": updated.transaction.transaction_id,
            "amount": updated.transaction.amount,
            "sender_id": updated.transaction.sender_id,
            "receiver_id": updated.transaction.receiver_id,
            "location": updated.transaction.location,
            "timestamp": updated.transaction.timestamp.isoformat()
        }
    return res

