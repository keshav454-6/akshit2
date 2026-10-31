from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TransactionBase(BaseModel):
    transaction_id: str
    sender_id: str
    receiver_id: str
    amount: float = Field(..., gt=0, description="Transaction amount in INR")
    timestamp: Optional[datetime] = None
    transaction_type: str = "P2P"
    payment_method: str = "UPI"
    device_id: str
    ip_address: str = "192.168.1.100"
    location: str = "Mumbai, IN"
    transaction_frequency: int = Field(default=1, ge=0)
    account_age: int = Field(default=30, ge=0)
    previous_behavior: float = Field(default=1.0, ge=0)
    receiver_risk_history: float = Field(default=0.0, ge=0.0, le=1.0)
    is_collect_request: bool = False
    is_new_beneficiary: bool = False
    transaction_velocity: float = Field(default=1.0, ge=0)

class TransactionCreate(TransactionBase):
    pass

class FraudPredictionResponse(BaseModel):
    id: Optional[str] = None
    fraud_probability: float
    risk_score: float
    risk_category: str
    anomaly_score: float
    is_flagged: bool
    detection_reasons: List[str]
    rule_triggers: List[str]
    recommended_action: str
    model_version: str = "v1.0-ensemble"
    feature_contributions: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True

class TransactionResponse(TransactionBase):
    id: str
    created_at: datetime
    prediction: Optional[FraudPredictionResponse] = None

    class Config:
        from_attributes = True

class TransactionAnalyzeRequest(TransactionBase):
    pass

class TransactionAnalyzeResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    risk_score: float
    risk_category: str  # Low, Medium, High
    anomaly_detection_result: Dict[str, Any]
    supervised_classification_result: Dict[str, Any]
    detection_reasons: List[str]
    rule_triggers: List[str]
    recommended_action: str
    is_flagged: bool
    persisted: bool = True

class BulkUploadResultItem(BaseModel):
    transaction_id: str
    amount: float
    risk_score: float
    risk_category: str
    is_flagged: bool
    reasons: List[str]

class BulkUploadResponse(BaseModel):
    total_processed: int
    safe_count: int
    suspicious_count: int
    high_risk_count: int
    results: List[BulkUploadResultItem]

