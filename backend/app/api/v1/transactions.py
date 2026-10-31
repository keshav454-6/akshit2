from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.transaction import (
    TransactionAnalyzeRequest,
    TransactionAnalyzeResponse,
    TransactionResponse,
    BulkUploadResponse
)
from app.services.transaction_service import (
    analyze_and_record_transaction,
    get_transactions,
    get_transaction_by_id,
    process_bulk_csv
)
from app.services.auth_service import get_current_user
from app.models.entities import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/analyze", response_model=TransactionAnalyzeResponse)
async def analyze_transaction(
    request: TransactionAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Main transaction analysis endpoint.
    Processes features through Hybrid ML models + Explainable Rule system,
    stores records in PostgreSQL / SQLite, and broadcasts real-time alerts.
    """
    txn_dict = request.dict()
    analysis = await analyze_and_record_transaction(db, txn_dict, persist=True)
    return analysis

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    risk_category: Optional[str] = Query(None, description="Low, Medium, or High"),
    search: Optional[str] = Query(None, description="Search by transaction ID, sender, receiver, location"),
    db: Session = Depends(get_db)
):
    """Retrieve all monitored transactions with search and filter capabilities."""
    txns = get_transactions(db, skip=skip, limit=limit, risk_category=risk_category, search=search)
    return txns

@router.get("/{id}", response_model=TransactionResponse)
def get_transaction(
    id: str,
    db: Session = Depends(get_db)
):
    """Get complete transaction details along with ML prediction and explainability reasons."""
    txn = get_transaction_by_id(db, id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.post("/bulk-upload", response_model=BulkUploadResponse)
async def upload_bulk_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Upload CSV dataset of transactions.
    Validates structure, runs each through the ML pipeline, and outputs risk scores.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    contents = await file.read()
    try:
        summary = await process_bulk_csv(db, contents)
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

