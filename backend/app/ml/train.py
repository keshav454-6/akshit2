import os
import json
import random
from datetime import datetime, timedelta, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from app.ml.feature_pipeline import FEATURE_NAMES, extract_features_from_dict

# Deterministic seed for reproducible model weights and realistic synthetic data
random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_DIR = os.path.join(BASE_DIR, "ml")
SAVED_MODELS_DIR = os.path.join(ML_DIR, "saved_models")
DATASETS_DIR = os.path.join(ML_DIR, "datasets")

os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

LOCATIONS = [
    "Mumbai, IN", "Delhi, IN", "Bengaluru, IN", "Hyderabad, IN",
    "Pune, IN", "Chennai, IN", "Kolkata, IN", "Ahmedabad, IN",
    "Jaipur, IN", "Lucknow, IN", "Chandigarh, IN", "Kochi, IN"
]

DEVICES = [
    "DEV-SM-A536B", "DEV-IPHONE-15", "DEV-REDMI-NT12", "DEV-ONEPLUS-11",
    "DEV-PIXEL-8", "DEV-MOTO-G84", "DEV-VIVO-V29", "DEV-S24-ULTRA"
]

def generate_synthetic_data(num_samples: int = 10000):
    records = []
    base_time = datetime.now(timezone.utc) - timedelta(days=30)
    
    for i in range(num_samples):
        txn_id = f"TXN-{100000 + i}"
        sender_id = f"usr_{random.randint(100, 999)}@okaxis"
        receiver_id = f"pay_{random.randint(100, 999)}@oksbi"
        
        # Decide if legitimate (88%) or fraudulent (12%)
        is_fraud = 1 if (random.random() < 0.12) else 0
        
        # Advance timestamp
        minute_offset = random.randint(0, 30 * 24 * 60)
        timestamp = base_time + timedelta(minutes=minute_offset)
        hour = timestamp.hour
        
        if is_fraud == 0:
            # Normal UPI payment
            amount = round(random.choice([
                random.uniform(20, 500),
                random.uniform(500, 3000),
                random.uniform(3000, 10000),
            ]), 2)
            txn_type = random.choice(["P2P", "P2M", "BILL_PAY"])
            payment_method = random.choice(["UPI", "QR_CODE"])
            device_id = random.choice(DEVICES)
            ip_address = f"192.168.1.{random.randint(2, 250)}"
            location = random.choice(LOCATIONS)
            
            # Normal user behavior
            account_age = random.randint(30, 750)
            previous_behavior = round(random.uniform(0.7, 1.8), 2)
            transaction_frequency = random.randint(1, 5)
            receiver_risk_history = round(random.uniform(0.01, 0.18), 3)
            is_collect_request = random.random() < 0.08
            is_new_beneficiary = random.random() < 0.15
            transaction_velocity = round(random.uniform(0.2, 1.5), 2)
            
        else:
            # Fraudulent scenarios
            fraud_type = random.choice(["collect_scam", "velocity_drain", "extreme_amount", "mule_receiver", "new_account_burst"])
            location = random.choice(LOCATIONS)
            device_id = random.choice(DEVICES)
            ip_address = f"103.{random.randint(10, 190)}.{random.randint(10, 240)}.{random.randint(2, 250)}"
            
            if fraud_type == "collect_scam":
                # User tricked into paying fake collect request
                amount = round(random.uniform(5000, 60000), 2)
                txn_type = "COLLECT_REQUEST"
                payment_method = "UPI"
                account_age = random.randint(15, 300)
                previous_behavior = round(random.uniform(0.4, 1.2), 2)
                transaction_frequency = random.randint(2, 8)
                receiver_risk_history = round(random.uniform(0.65, 0.98), 3)
                is_collect_request = True
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(1.0, 3.5), 2)
                
            elif fraud_type == "velocity_drain":
                # Account takeover rapid draining
                amount = round(random.uniform(15000, 95000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(50, 400)
                previous_behavior = round(random.uniform(0.5, 1.5), 2)
                transaction_frequency = random.randint(12, 35)
                receiver_risk_history = round(random.uniform(0.45, 0.85), 3)
                is_collect_request = False
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(4.5, 14.0), 2)
                
            elif fraud_type == "extreme_amount":
                # Usual spender of 200 attempting 85,000 transfer
                amount = round(random.uniform(45000, 100000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(10, 120)
                previous_behavior = round(random.uniform(0.1, 0.4), 2)  # Normal average was 100-400
                transaction_frequency = random.randint(1, 4)
                receiver_risk_history = round(random.uniform(0.55, 0.90), 3)
                is_collect_request = random.random() < 0.4
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(1.2, 3.0), 2)
                
            elif fraud_type == "mule_receiver":
                # Known money mule UPI VPA
                amount = round(random.uniform(8000, 50000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(20, 200)
                previous_behavior = round(random.uniform(0.8, 1.6), 2)
                transaction_frequency = random.randint(4, 15)
                receiver_risk_history = round(random.uniform(0.78, 0.99), 3)
                is_collect_request = random.random() < 0.3
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(2.5, 6.0), 2)
                
            else:  # new_account_burst
                # Account registered 2 days ago doing high volume
                amount = round(random.uniform(12000, 75000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(1, 5)
                previous_behavior = round(random.uniform(0.5, 1.0), 2)
                transaction_frequency = random.randint(8, 25)
                receiver_risk_history = round(random.uniform(0.40, 0.85), 3)
                is_collect_request = random.random() < 0.2
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(4.0, 10.0), 2)

        records.append({
            "transaction_id": txn_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "amount": amount,
            "timestamp": timestamp.isoformat(),
            "transaction_type": txn_type,
            "payment_method": payment_method,
            "device_id": device_id,
            "ip_address": ip_address,
            "location": location,
            "transaction_frequency": transaction_frequency,
            "account_age": account_age,
            "previous_behavior": previous_behavior,
            "receiver_risk_history": receiver_risk_history,
            "is_collect_request": is_collect_request,
            "is_new_beneficiary": is_new_beneficiary,
            "transaction_velocity": transaction_velocity,
            "is_fraud": is_fraud
        })
        
    return pd.DataFrame(records)

def train_and_evaluate():
    print("[1/5] Generating 10,000 synthetic transaction records...")
    df = generate_synthetic_data(10000)
    
    # Save datasets
    dataset_csv = os.path.join(DATASETS_DIR, "synthetic_transactions.csv")
    df.to_csv(dataset_csv, index=False)
    print(f"Dataset saved to: {dataset_csv}")
    
    # Save a clean 40-item sample test set for CSV uploads
    sample_df = df.sample(40, random_state=101).copy()
    sample_df.drop(columns=["is_fraud"], inplace=True)
    sample_csv = os.path.join(DATASETS_DIR, "sample_upload_test.csv")
    sample_df.to_csv(sample_csv, index=False)
    print(f"Sample test upload CSV saved to: {sample_csv}")
    
    print("[2/5] Extracting engineered features...")
    X_list = []
    for _, row in df.iterrows():
        feat = extract_features_from_dict(row.to_dict())
        X_list.append(feat[0])
    
    X = np.array(X_list)
    y = df["is_fraud"].values
    
    # Train / test split (80 / 20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print("[3/5] Fitting StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("[4/5] Training Isolation Forest (Unsupervised Anomaly Detection)...")
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.12,
        max_samples="auto",
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_scaled)
    
    print("[5/5] Training Supervised Random Forest Classifier...")
    rf_clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        class_weight="balanced",
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    rf_clf.fit(X_train_scaled, y_train)
    
    # Evaluation on test set
    y_pred = rf_clf.predict(X_test_scaled)
    y_prob = rf_clf.predict_proba(X_test_scaled)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])
    
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
    
    # Feature importances
    importances = rf_clf.feature_importances_
    feat_imp = {name: float(round(imp, 4)) for name, imp in zip(FEATURE_NAMES, importances)}
    # Sort descending
    feat_imp_sorted = dict(sorted(feat_imp.items(), key=lambda item: item[1], reverse=True))
    
    metrics = {
        "model_name": "FraudGuard Ensemble v1.0",
        "model_type": "IsolationForest + RandomForest Hybrid",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "false_positive_rate": round(fpr, 4),
        "false_negative_rate": round(fnr, 4),
        "confusion_matrix": {
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp
        },
        "feature_importances": feat_imp_sorted,
        "evaluation_date": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "total_test_samples": len(y_test)
    }
    
    print("\n--- MODEL PERFORMANCE EVALUATION ---")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f} (High recall critical for fraud detection)")
    print(f"F1-Score:  {metrics['f1_score']:.4f}")
    print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"FPR: {metrics['false_positive_rate']:.4f}, FNR: {metrics['false_negative_rate']:.4f}")
    
    # Save artifacts
    joblib.dump(scaler, os.path.join(SAVED_MODELS_DIR, "scaler.joblib"))
    joblib.dump(iso_forest, os.path.join(SAVED_MODELS_DIR, "isolation_forest.joblib"))
    joblib.dump(rf_clf, os.path.join(SAVED_MODELS_DIR, "random_forest.joblib"))
    
    metrics_path = os.path.join(SAVED_MODELS_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved models and metrics to {SAVED_MODELS_DIR}")
    
    return metrics

if __name__ == "__main__":
    train_and_evaluate()

