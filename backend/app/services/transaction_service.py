import io
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.models.entities import Transaction, FraudPrediction, Alert
from app.ml.detector import fraud_detector
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

async def analyze_and_record_transaction(
    db: Session,
    txn_data: Dict[str, Any],
    persist: bool = True
) -> Dict[str, Any]:
    """
    Core end-to-end transaction fraud analysis:
    Runs ML + Rules -> Persists to DB -> Generates Alerts if suspicious -> Emits WebSocket
    """
    # 1. Run ML detection engine
    result = fraud_detector.analyze_transaction(txn_data)
    
    if not persist:
        result["persisted"] = False
        return result

    # 2. Prepare database objects
    txn_id_str = txn_data.get("transaction_id") or f"TXN-{uuid.uuid4().hex[:8].upper()}"
    
    # Check if transaction_id already exists, if so generate unique suffix
    existing = db.query(Transaction).filter(Transaction.transaction_id == txn_id_str).first()
    if existing:
        txn_id_str = f"{txn_id_str}-{uuid.uuid4().hex[:4].upper()}"
        result["transaction_id"] = txn_id_str

    timestamp_val = txn_data.get("timestamp")
    if isinstance(timestamp_val, str):
        try:
            timestamp_dt = datetime.fromisoformat(timestamp_val.replace("Z", "+00:00"))
        except Exception:
            timestamp_dt = datetime.now(timezone.utc)
    elif isinstance(timestamp_val, datetime):
        timestamp_dt = timestamp_val
    else:
        timestamp_dt = datetime.now(timezone.utc)

    db_txn = Transaction(
        transaction_id=txn_id_str,
        sender_id=str(txn_data.get("sender_id", "sender@upi")),
        receiver_id=str(txn_data.get("receiver_id", "receiver@upi")),
        amount=float(txn_data.get("amount", 0.0)),
        timestamp=timestamp_dt,
        transaction_type=str(txn_data.get("transaction_type", "P2P")),
        payment_method=str(txn_data.get("payment_method", "UPI")),
        device_id=str(txn_data.get("device_id", "DEV-DEFAULT")),
        ip_address=str(txn_data.get("ip_address", "192.168.1.1")),
        location=str(txn_data.get("location", "Mumbai, IN")),
        transaction_frequency=int(txn_data.get("transaction_frequency", 1)),
        account_age=int(txn_data.get("account_age", 30)),
        previous_behavior=float(txn_data.get("previous_behavior", 1.0)),
        receiver_risk_history=float(txn_data.get("receiver_risk_history", 0.0)),
        is_collect_request=bool(txn_data.get("is_collect_request", False)),
        is_new_beneficiary=bool(txn_data.get("is_new_beneficiary", False)),
        transaction_velocity=float(txn_data.get("transaction_velocity", 1.0)),
    )
    db.add(db_txn)
    db.flush()

    # 3. Create prediction record
    db_pred = FraudPrediction(
        transaction_id=db_txn.id,
        fraud_probability=result["fraud_probability"],
        risk_score=result["risk_score"],
        risk_category=result["risk_category"],
        anomaly_score=result["anomaly_score"],
        is_flagged=result["is_flagged"],
        detection_reasons=result["detection_reasons"],
        rule_triggers=result["rule_triggers"],
        recommended_action=result["recommended_action"],
        model_version="v1.0-ensemble"
    )
    db.add(db_pred)

    alert_obj = None
    # 4. If flagged (Medium or High risk), automatically raise an Alert
    if result["is_flagged"]:
        priority = "critical" if result["risk_category"] == "High" and result["risk_score"] >= 85 else (
            "high" if result["risk_category"] == "High" else "medium"
        )
        primary_reason = result["detection_reasons"][0] if result["detection_reasons"] else "Suspicious transaction anomaly detected"
        
        alert_obj = Alert(
            transaction_id=db_txn.id,
            alert_type="FRAUD_RISK_TRIGGER",
            priority=priority,
            status="new",
            reason=primary_reason,
            triggered_rules=result["rule_triggers"]
        )
        db.add(alert_obj)

    db.commit()
    db.refresh(db_txn)

    # 5. Broadcast to real-time WebSocket clients
    broadcast_data = {
        "id": db_txn.id,
        "transaction_id": db_txn.transaction_id,
        "sender_id": db_txn.sender_id,
        "receiver_id": db_txn.receiver_id,
        "amount": db_txn.amount,
        "risk_score": result["risk_score"],
        "risk_category": result["risk_category"],
        "is_flagged": result["is_flagged"],
        "timestamp": db_txn.timestamp.isoformat(),
        "detection_reasons": result["detection_reasons"],
        "recommended_action": result["recommended_action"]
    }
    
    await ws_manager.broadcast({
        "type": "NEW_TRANSACTION",
        "data": broadcast_data
    })
    
    if alert_obj:
        await ws_manager.broadcast({
            "type": "NEW_ALERT",
            "data": {
                "id": alert_obj.id,
                "transaction_id": db_txn.transaction_id,
                "priority": alert_obj.priority,
                "status": alert_obj.status,
                "amount": db_txn.amount,
                "reason": alert_obj.reason,
                "created_at": alert_obj.created_at.isoformat()
            }
        })

    result["persisted"] = True
    result["id"] = db_txn.id
    return result

def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    risk_category: Optional[str] = None,
    search: Optional[str] = None
) -> List[Transaction]:
    query = db.query(Transaction).outerjoin(FraudPrediction)
    
    if risk_category and risk_category != "all":
        query = query.filter(FraudPrediction.risk_category == risk_category)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(search_filter),
                Transaction.sender_id.ilike(search_filter),
                Transaction.receiver_id.ilike(search_filter),
                Transaction.location.ilike(search_filter)
            )
        )
        
    return query.order_by(desc(Transaction.timestamp)).offset(skip).limit(limit).all()

def get_transaction_by_id(db: Session, txn_identifier: str) -> Optional[Transaction]:
    return db.query(Transaction).filter(
        or_(
            Transaction.id == txn_identifier,
            Transaction.transaction_id == txn_identifier
        )
    ).first()

async def process_bulk_csv(db: Session, file_contents: bytes) -> Dict[str, Any]:
    """Parse uploaded CSV and analyze all transactions."""
    df = pd.read_csv(io.BytesIO(file_contents))
    
    # Column mapping tolerance
    col_map = {
        "amount": "amount",
        "transaction_id": "transaction_id",
        "sender_id": "sender_id",
        "receiver_id": "receiver_id",
        "transaction_type": "transaction_type",
        "payment_method": "payment_method",
        "device_id": "device_id",
        "ip_address": "ip_address",
        "location": "location",
        "transaction_frequency": "transaction_frequency",
        "account_age": "account_age",
        "previous_behavior": "previous_behavior",
        "receiver_risk_history": "receiver_risk_history",
        "is_collect_request": "is_collect_request",
        "is_new_beneficiary": "is_new_beneficiary",
        "transaction_velocity": "transaction_velocity"
    }
    
    results = []
    safe_count = 0
    suspicious_count = 0
    high_risk_count = 0
    
    for _, row in df.iterrows():
        txn_dict = row.to_dict()
        # Clean boolean fields
        for b_field in ["is_collect_request", "is_new_beneficiary"]:
            if b_field in txn_dict:
                txn_dict[b_field] = str(txn_dict[b_field]).lower() in ("true", "1", "yes")
                
        # Analyze & persist
        analysis = await analyze_and_record_transaction(db, txn_dict, persist=True)
        
        category = analysis["risk_category"]
        if category == "Low":
            safe_count += 1
        elif category == "Medium":
            suspicious_count += 1
        elif category == "High":
            high_risk_count += 1
            
        results.append({
            "transaction_id": analysis["transaction_id"],
            "amount": float(txn_dict.get("amount", 0.0)),
            "risk_score": analysis["risk_score"],
            "risk_category": analysis["risk_category"],
            "is_flagged": analysis["is_flagged"],
            "reasons": analysis["detection_reasons"]
        })
        
    return {
        "total_processed": len(results),
        "safe_count": safe_count,
        "suspicious_count": suspicious_count,
        "high_risk_count": high_risk_count,
        "results": results
    }

