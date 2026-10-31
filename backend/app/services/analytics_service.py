from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.entities import Transaction, FraudPrediction, Alert, Investigation

def get_dashboard_analytics(db: Session) -> Dict[str, Any]:
    # 1. Core counters
    total_txns = db.query(Transaction).count()
    total_analyzed = db.query(FraudPrediction).count()
    
    safe_count = db.query(FraudPrediction).filter(FraudPrediction.risk_category == "Low").count()
    suspicious_count = db.query(FraudPrediction).filter(FraudPrediction.risk_category == "Medium").count()
    high_risk_count = db.query(FraudPrediction).filter(FraudPrediction.risk_category == "High").count()
    
    confirmed_fraud = db.query(Investigation).filter(Investigation.outcome == "confirmed_fraud").count()
    if confirmed_fraud == 0:
        confirmed_fraud = high_risk_count
        
    total_value = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    avg_risk = db.query(func.avg(FraudPrediction.risk_score)).scalar() or 0.0
    
    detection_rate = (
        round((high_risk_count / total_analyzed) * 100.0, 2)
        if total_analyzed > 0 else 0.0
    )
    
    # 2. Risk Score Distribution (10 bins: 0-10, 10-20, ... 90-100)
    risk_bins = [
        {"range": "0-19", "min": 0, "max": 19, "count": 0},
        {"range": "20-39", "min": 20, "max": 39, "count": 0},
        {"range": "40-59", "min": 40, "max": 59, "count": 0},
        {"range": "60-79", "min": 60, "max": 79, "count": 0},
        {"range": "80-100", "min": 80, "max": 100, "count": 0},
    ]
    
    all_scores = db.query(FraudPrediction.risk_score).all()
    for (score,) in all_scores:
        s = float(score or 0.0)
        for b in risk_bins:
            if b["min"] <= s <= b["max"] or (b["range"] == "80-100" and s >= 80):
                b["count"] += 1
                break

    # 3. Trend Data (aggregate latest transactions into trend points)
    # Get last 7 days or sample points
    trend_data = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_start = now - timedelta(days=i, hours=now.hour, minutes=now.minute, seconds=now.second)
        day_end = day_start + timedelta(days=1)
        day_label = day_start.strftime("%b %d")
        
        # Count transactions in this window
        window_txns = db.query(Transaction.id).filter(
            Transaction.timestamp >= day_start,
            Transaction.timestamp < day_end
        ).all()
        txn_ids = [t[0] for t in window_txns]
        
        if txn_ids:
            day_total = len(txn_ids)
            day_fraud = db.query(FraudPrediction).filter(
                FraudPrediction.transaction_id.in_(txn_ids),
                FraudPrediction.risk_category == "High"
            ).count()
            day_susp = db.query(FraudPrediction).filter(
                FraudPrediction.transaction_id.in_(txn_ids),
                FraudPrediction.risk_category == "Medium"
            ).count()
            day_safe = day_total - day_fraud - day_susp
        else:
            day_total = 0
            day_fraud = 0
            day_susp = 0
            day_safe = 0
            
        trend_data.append({
            "timestamp": day_label,
            "total_count": day_total,
            "fraud_count": day_fraud,
            "suspicious_count": day_susp,
            "safe_count": max(0, day_safe)
        })

    # If database has transactions but they aren't spread over 7 days, provide distribution across recent chunks
    total_trend_sum = sum(t["total_count"] for t in trend_data)
    if total_trend_sum < total_txns and total_txns > 0:
        # Generate trend buckets from latest transactions
        recent_txns = db.query(Transaction).order_by(Transaction.timestamp.asc()).all()
        chunk_size = max(1, len(recent_txns) // 7)
        chunks = [recent_txns[i:i + chunk_size] for i in range(0, len(recent_txns), chunk_size)][:7]
        trend_data = []
        for idx, chunk in enumerate(chunks):
            chunk_ids = [t.id for t in chunk]
            c_high = db.query(FraudPrediction).filter(FraudPrediction.transaction_id.in_(chunk_ids), FraudPrediction.risk_category == "High").count()
            c_med = db.query(FraudPrediction).filter(FraudPrediction.transaction_id.in_(chunk_ids), FraudPrediction.risk_category == "Medium").count()
            c_safe = len(chunk) - c_high - c_med
            label = chunk[-1].timestamp.strftime("%H:%M") if chunk else f"P{idx+1}"
            trend_data.append({
                "timestamp": label,
                "total_count": len(chunk),
                "fraud_count": c_high,
                "suspicious_count": c_med,
                "safe_count": max(0, c_safe)
            })

    # 4. Pie Distribution
    pie_distribution = [
        {"name": "Safe (Low Risk)", "value": safe_count, "color": "#10B981"},         # Emerald Green
        {"name": "Suspicious (Medium)", "value": suspicious_count, "color": "#F59E0B"}, # Amber Orange
        {"name": "High Risk (Critical)", "value": high_risk_count, "color": "#EF4444"},# Crimson Red
    ]

    # 5. Recent Alerts
    recent_alerts_db = db.query(Alert).join(Transaction).order_by(desc(Alert.created_at)).limit(6).all()
    recent_alerts = []
    for a in recent_alerts_db:
        recent_alerts.append({
            "id": a.id,
            "transaction_id": a.transaction.transaction_id if a.transaction else "N/A",
            "amount": a.transaction.amount if a.transaction else 0.0,
            "priority": a.priority,
            "status": a.status,
            "reason": a.reason,
            "timestamp": a.created_at.strftime("%H:%M:%S, %d %b")
        })

    # 6. Live Feed
    latest_txns_db = db.query(Transaction).outerjoin(FraudPrediction).order_by(desc(Transaction.timestamp)).limit(8).all()
    live_feed = []
    for t in latest_txns_db:
        pred = t.prediction
        live_feed.append({
            "transaction_id": t.transaction_id,
            "sender_id": t.sender_id,
            "receiver_id": t.receiver_id,
            "amount": t.amount,
            "risk_score": pred.risk_score if pred else 0.0,
            "risk_category": pred.risk_category if pred else "Low",
            "is_flagged": pred.is_flagged if pred else False,
            "timestamp": t.timestamp.strftime("%H:%M:%S")
        })

    return {
        "total_transactions": total_txns,
        "total_analyzed": total_analyzed,
        "safe_transactions": safe_count,
        "suspicious_transactions": suspicious_count,
        "confirmed_fraud_cases": confirmed_fraud,
        "total_transaction_value": round(total_value, 2),
        "fraud_detection_rate": detection_rate,
        "average_risk_score": round(float(avg_risk), 1),
        "trend_data": trend_data,
        "pie_distribution": pie_distribution,
        "risk_score_distribution": risk_bins,
        "recent_alerts": recent_alerts,
        "live_feed": live_feed
    }

