import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst", nullable=False)  # admin, analyst
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    # Relationships
    alerts_reviewed = relationship("Alert", back_populates="reviewer")
    investigations = relationship("Investigation", back_populates="analyst")
    audit_logs = relationship("AuditLog", back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    sender_id = Column(String(128), index=True, nullable=False)
    receiver_id = Column(String(128), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    
    transaction_type = Column(String(50), default="P2P")  # P2P, P2M, BILL_PAY, COLLECT_REQUEST
    payment_method = Column(String(50), default="UPI")  # UPI, QR_CODE, NET_BANKING, CARD
    device_id = Column(String(128), index=True, nullable=False)
    ip_address = Column(String(64), nullable=False)
    location = Column(String(128), nullable=False)
    
    # Behavioral and risk features
    transaction_frequency = Column(Integer, default=1)  # txns in last 24h
    account_age = Column(Integer, default=30)  # days
    previous_behavior = Column(Float, default=1.0)  # average txn amount ratio
    receiver_risk_history = Column(Float, default=0.0)  # historical risk score (0.0 - 1.0)
    is_collect_request = Column(Boolean, default=False)
    is_new_beneficiary = Column(Boolean, default=False)
    transaction_velocity = Column(Float, default=1.0)  # txns per hour
    
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    prediction = relationship("FraudPrediction", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="transaction", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="transaction", cascade="all, delete-orphan")


class FraudPrediction(Base):
    __tablename__ = "fraud_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    fraud_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_category = Column(String(20), nullable=False)  # Low, Medium, High
    anomaly_score = Column(Float, nullable=False)  # 0.0 to 1.0
    is_flagged = Column(Boolean, default=False, nullable=False)
    
    detection_reasons = Column(JSON, default=list)  # list of explainability strings
    rule_triggers = Column(JSON, default=list)  # list of triggered security rules
    recommended_action = Column(String(255), nullable=False)  # ALLOW, STEP_UP_2FA, BLOCK, MANUAL_REVIEW
    model_version = Column(String(50), default="v1.0-ensemble")
    
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    transaction = relationship("Transaction", back_populates="prediction")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    
    alert_type = Column(String(100), default="SUSPICIOUS_TRANSACTION")
    priority = Column(String(20), default="high")  # critical, high, medium, low
    status = Column(String(30), default="new")  # new, under_review, resolved, escalated
    reason = Column(Text, nullable=False)
    triggered_rules = Column(JSON, default=list)
    
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    transaction = relationship("Transaction", back_populates="alerts")
    reviewer = relationship("User", back_populates="alerts_reviewed")
    investigations = relationship("Investigation", back_populates="alert")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    analyst_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    status = Column(String(30), default="open")  # open, in_progress, closed, escalated
    notes = Column(Text, nullable=True)
    findings = Column(JSON, default=dict)
    outcome = Column(String(50), nullable=True)  # confirmed_fraud, false_positive, customer_verified, blocked_user
    
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    alert = relationship("Alert", back_populates="investigations")
    transaction = relationship("Transaction", back_populates="investigations")
    analyst = relationship("User", back_populates="investigations")


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # IsolationForest, RandomForest, Ensemble
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    false_positive_rate = Column(Float, nullable=False)
    false_negative_rate = Column(Float, nullable=False)
    confusion_matrix = Column(JSON, nullable=False)  # {"tn": 0, "fp": 0, "fn": 0, "tp": 0}
    feature_importances = Column(JSON, default=dict)
    
    evaluation_date = Column(DateTime(timezone=True), default=utcnow)
    is_active = Column(Boolean, default=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, ANALYZE_TXN, RESOLVE_ALERT, START_SIMULATOR, etc.
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(64), default="127.0.0.1")
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")

