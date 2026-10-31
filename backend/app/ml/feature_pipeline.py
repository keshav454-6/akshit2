import math
from datetime import datetime
from typing import Dict, Any, List
import numpy as np

FEATURE_NAMES = [
    "amount",
    "log_amount",
    "amount_deviation",
    "hour_of_day",
    "is_night_transaction",
    "transaction_frequency",
    "account_age",
    "receiver_risk_history",
    "is_collect_request",
    "is_new_beneficiary",
    "transaction_velocity",
    "high_velocity_flag",
    "new_beneficiary_high_amount",
    "suspicious_collect_flag",
    "new_account_rush",
]

def extract_features_from_dict(txn: Dict[str, Any]) -> np.ndarray:
    """Extract and calculate numerical feature array for a single transaction dictionary."""
    amount = float(txn.get("amount", 0.0))
    log_amount = math.log1p(max(0.0, amount))
    
    # Previous behavior is baseline multiplier/average
    previous_behavior = float(txn.get("previous_behavior", 1.0))
    expected_baseline = max(100.0, previous_behavior * 1000.0)
    amount_deviation = amount / expected_baseline
    
    # Parse timestamp for timing features
    timestamp = txn.get("timestamp")
    if isinstance(timestamp, str):
        try:
            # Handle ISO string
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            hour = dt.hour
        except Exception:
            hour = 14
    elif isinstance(timestamp, datetime):
        hour = timestamp.hour
    else:
        hour = 14
        
    is_night_transaction = 1.0 if (hour >= 23 or hour <= 5) else 0.0
    
    txn_frequency = float(txn.get("transaction_frequency", 1))
    account_age = float(txn.get("account_age", 30))
    receiver_risk_history = float(txn.get("receiver_risk_history", 0.0))
    is_collect_request = 1.0 if txn.get("is_collect_request") in (True, 1, "true", "True") else 0.0
    is_new_beneficiary = 1.0 if txn.get("is_new_beneficiary") in (True, 1, "true", "True") else 0.0
    transaction_velocity = float(txn.get("transaction_velocity", 1.0))
    
    # Advanced interaction features
    high_velocity_flag = 1.0 if transaction_velocity >= 3.0 else 0.0
    new_beneficiary_high_amount = 1.0 if (is_new_beneficiary == 1.0 and amount >= 15000.0) else 0.0
    suspicious_collect_flag = 1.0 if (is_collect_request == 1.0 and (receiver_risk_history >= 0.35 or is_new_beneficiary == 1.0)) else 0.0
    new_account_rush = 1.0 if (account_age <= 7.0 and transaction_velocity >= 2.0) else 0.0
    
    features = [
        amount,
        log_amount,
        amount_deviation,
        float(hour),
        is_night_transaction,
        txn_frequency,
        account_age,
        receiver_risk_history,
        is_collect_request,
        is_new_beneficiary,
        transaction_velocity,
        high_velocity_flag,
        new_beneficiary_high_amount,
        suspicious_collect_flag,
        new_account_rush,
    ]
    
    return np.array(features, dtype=np.float32).reshape(1, -1)

