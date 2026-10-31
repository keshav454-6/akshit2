from typing import List, Dict, Any
from pydantic import BaseModel

class TrendPoint(BaseModel):
    timestamp: str
    total_count: int
    fraud_count: int
    suspicious_count: int
    safe_count: int

class CategoryDistribution(BaseModel):
    name: str
    value: int
    color: str

class RecentAlertSummary(BaseModel):
    id: str
    transaction_id: str
    amount: float
    priority: str
    status: str
    reason: str
    timestamp: str

class LiveTransactionFeedItem(BaseModel):
    transaction_id: str
    sender_id: str
    receiver_id: str
    amount: float
    risk_score: float
    risk_category: str
    is_flagged: bool
    timestamp: str

class DashboardAnalyticsResponse(BaseModel):
    total_transactions: int
    total_analyzed: int
    safe_transactions: int
    suspicious_transactions: int
    confirmed_fraud_cases: int
    total_transaction_value: float
    fraud_detection_rate: float  # percentage
    average_risk_score: float
    
    # Visual chart analytics
    trend_data: List[TrendPoint]
    pie_distribution: List[CategoryDistribution]
    risk_score_distribution: List[Dict[str, Any]]
    recent_alerts: List[RecentAlertSummary]
    live_feed: List[LiveTransactionFeedItem]

