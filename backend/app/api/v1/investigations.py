from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.investigation import (
    InvestigationCreate, InvestigationResponse, InvestigationUpdate
)
from app.services.investigation_service import (
    get_investigations, get_investigation_by_id, create_investigation, update_investigation
)
from app.services.auth_service import get_current_user
from app.models.entities import User

router = APIRouter(prefix="/investigations", tags=["Fraud Investigations"])

@router.get("", response_model=List[InvestigationResponse])
def list_investigations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None, description="open, in_progress, closed, escalated"),
    db: Session = Depends(get_db)
):
    invs = get_investigations(db, skip=skip, limit=limit, status=status)
    results = []
    for inv in invs:
        res = InvestigationResponse.from_orm(inv)
        if inv.analyst:
            res.analyst_name = inv.analyst.full_name
        if inv.transaction:
            res.transaction_details = {
                "transaction_id": inv.transaction.transaction_id,
                "amount": inv.transaction.amount,
                "sender_id": inv.transaction.sender_id,
                "receiver_id": inv.transaction.receiver_id,
                "location": inv.transaction.location
            }
        results.append(res)
    return results

@router.get("/{id}", response_model=InvestigationResponse)
def get_investigation(
    id: str,
    db: Session = Depends(get_db)
):
    inv = get_investigation_by_id(db, id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")
        
    res = InvestigationResponse.from_orm(inv)
    if inv.analyst:
        res.analyst_name = inv.analyst.full_name
    if inv.transaction:
        res.transaction_details = {
            "transaction_id": inv.transaction.transaction_id,
            "amount": inv.transaction.amount,
            "sender_id": inv.transaction.sender_id,
            "receiver_id": inv.transaction.receiver_id,
            "location": inv.transaction.location
        }
    return res

@router.post("", response_model=InvestigationResponse)
def create_new_investigation(
    data: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    analyst_id = current_user.id if current_user else None
    inv = create_investigation(db, data, analyst_id=analyst_id)
    res = InvestigationResponse.from_orm(inv)
    if inv.analyst:
        res.analyst_name = inv.analyst.full_name
    return res

@router.patch("/{id}", response_model=InvestigationResponse)
def modify_investigation(
    id: str,
    data: InvestigationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    analyst_id = current_user.id if current_user else None
    updated = update_investigation(db, id, data, analyst_id=analyst_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Investigation case not found")
        
    res = InvestigationResponse.from_orm(updated)
    if updated.analyst:
        res.analyst_name = updated.analyst.full_name
    if updated.transaction:
        res.transaction_details = {
            "transaction_id": updated.transaction.transaction_id,
            "amount": updated.transaction.amount,
            "sender_id": updated.transaction.sender_id,
            "receiver_id": updated.transaction.receiver_id,
            "location": updated.transaction.location
        }
    return res

