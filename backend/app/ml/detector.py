import os
import json
import logging
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np

from app.ml.feature_pipeline import FEATURE_NAMES, extract_features_from_dict

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

class FraudGuardEngine:
    def __init__(self):
        self.scaler = None
        self.isolation_forest = None
        self.random_forest = None
        self.metrics = {}
        self.is_loaded = False
        self.load_models()
        
    def load_models(self):
        try:
            scaler_path = os.path.join(SAVED_MODELS_DIR, "scaler.joblib")
            iso_path = os.path.join(SAVED_MODELS_DIR, "isolation_forest.joblib")
            rf_path = os.path.join(SAVED_MODELS_DIR, "random_forest.joblib")
            metrics_path = os.path.join(SAVED_MODELS_DIR, "metrics.json")
            
            if os.path.exists(scaler_path) and os.path.exists(iso_path) and os.path.exists(rf_path):
                self.scaler = joblib.load(scaler_path)
                self.isolation_forest = joblib.load(iso_path)
                self.random_forest = joblib.load(rf_path)
                
                if os.path.exists(metrics_path):
                    with open(metrics_path, "r") as f:
                        self.metrics = json.load(f)
                        
                self.is_loaded = True
                logger.info("FraudGuard ML Models and Scaler successfully loaded.")
            else:
                logger.warning("Model files not found in saved_models directory. Running in rule-based fallback mode.")
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            self.is_loaded = False

    def evaluate_rules(self, txn: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
        """
        Evaluate deterministic security rules.
        Returns: (rule_score_0_to_100, detection_reasons, triggered_rules)
        """
        amount = float(txn.get("amount", 0.0))
        previous_behavior = float(txn.get("previous_behavior", 1.0))
        expected_baseline = max(100.0, previous_behavior * 1000.0)
        deviation_ratio = amount / expected_baseline
        
        is_collect = txn.get("is_collect_request") in (True, 1, "true", "True")
        is_new_beneficiary = txn.get("is_new_beneficiary") in (True, 1, "true", "True")
        receiver_risk = float(txn.get("receiver_risk_history", 0.0))
        velocity = float(txn.get("transaction_velocity", 1.0))
        frequency = int(txn.get("transaction_frequency", 1))
        account_age = int(txn.get("account_age", 30))
        
        rule_points = 0.0
        reasons = []
        triggered_rules = []
        
        # Rule 1: High-value Collect Request to New Beneficiary (Classic UPI Phishing)
        if is_collect and is_new_beneficiary:
            rule_points += 35.0
            triggered_rules.append("RULE_COLLECT_NEW_BENEFICIARY")
            reasons.append(
                f"UPI Collect Request received from an unverified, new beneficiary for INR {amount:,.2f}."
            )
            
        # Rule 2: Receiver High Risk Score
        if receiver_risk >= 0.70:
            rule_points += 40.0
            triggered_rules.append("RULE_MULE_BENEFICIARY_HISTORY")
            reasons.append(
                f"Beneficiary VPA has an elevated risk index ({receiver_risk * 100:.1f}%) with previous reported complaints."
            )
        elif receiver_risk >= 0.35:
            rule_points += 20.0
            triggered_rules.append("RULE_MODERATE_RECEIVER_RISK")
            reasons.append(
                f"Beneficiary VPA has flagged historical anomalies ({receiver_risk * 100:.1f}% risk score)."
            )
            
        # Rule 3: Extreme Amount Deviation
        if deviation_ratio >= 4.0:
            rule_points += 30.0
            triggered_rules.append("RULE_EXTREME_AMOUNT_DEVIATION")
            reasons.append(
                f"Payment amount of INR {amount:,.2f} is {deviation_ratio:.1f}x higher than sender's average pattern (baseline ~INR {expected_baseline:,.0f})."
            )
        elif deviation_ratio >= 2.5:
            rule_points += 15.0
            triggered_rules.append("RULE_MODERATE_AMOUNT_DEVIATION")
            reasons.append(
                f"Payment amount is {deviation_ratio:.1f}x above typical spending habits."
            )

        # Rule 4: High Transaction Velocity Burst (Drain Attack)
        if velocity >= 4.0:
            rule_points += 35.0
            triggered_rules.append("RULE_HIGH_VELOCITY_BURST")
            reasons.append(
                f"High velocity burst detected: {velocity:.1f} transactions per hour initiated from this device."
            )
        elif velocity >= 2.5 or frequency >= 8:
            rule_points += 15.0
            triggered_rules.append("RULE_ELEVATED_VELOCITY")
            reasons.append(
                f"Unusually high transaction frequency ({frequency} transfers today, velocity {velocity:.1f}/hr)."
            )

        # Rule 5: New Account with High Immediate Outflow
        if account_age <= 5 and amount >= 15000.0:
            rule_points += 25.0
            triggered_rules.append("RULE_NEW_ACCOUNT_HIGH_OUTFLOW")
            reasons.append(
                f"High-value payment (INR {amount:,.2f}) attempted from a freshly provisioned UPI profile ({account_age} days old)."
            )

        # Rule 6: Off-Hours Nocturnal Activity
        timestamp = txn.get("timestamp")
        hour = 14
        if isinstance(timestamp, str):
            try:
                from datetime import datetime
                hour = datetime.fromisoformat(timestamp.replace("Z", "+00:00")).hour
            except Exception:
                pass
        if hour >= 23 or hour <= 5:
            rule_points += 10.0
            triggered_rules.append("RULE_NOCTURNAL_TRANSACTION")
            reasons.append(
                f"Payment initiated during atypical nocturnal window ({hour:02d}:00 hrs)."
            )

        capped_rule_score = min(100.0, rule_points)
        return capped_rule_score, reasons, triggered_rules

    def analyze_transaction(self, txn: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single transaction through the hybrid detection pipeline:
        1. Supervised Random Forest probability
        2. Isolation Forest anomaly score
        3. Rule-based expert checks
        4. Explainability generator
        """
        rule_score, rule_reasons, triggered_rules = self.evaluate_rules(txn)
        
        # Default fallback values if ML model is unavailable
        supervised_prob = rule_score / 100.0
        anomaly_score = rule_score / 100.0
        feature_contributions = {}
        
        if self.is_loaded and self.scaler and self.random_forest and self.isolation_forest:
            try:
                raw_features = extract_features_from_dict(txn)
                scaled_features = self.scaler.transform(raw_features)
                
                # Supervised classifier prediction
                rf_probs = self.random_forest.predict_proba(scaled_features)[0]
                supervised_prob = float(rf_probs[1]) if len(rf_probs) > 1 else float(rf_probs[0])
                
                # Isolation Forest anomaly score (normalized to 0..1 range)
                # decision_function: positive = normal, negative = anomalous
                raw_decision = float(self.isolation_forest.decision_function(scaled_features)[0])
                # Sigmoid-like transformation for anomaly score where negative decision maps to high score
                anomaly_score = float(1.0 / (1.0 + np.exp(raw_decision * 5.0)))
                
                # Compute SHAP-inspired feature contributions (scaled deviation from median)
                for i, name in enumerate(FEATURE_NAMES):
                    dev = float(abs(scaled_features[0, i]))
                    if dev > 0.5:
                        feature_contributions[name] = round(dev, 3)
                        
            except Exception as e:
                logger.error(f"Error in ML feature inference: {e}")
                supervised_prob = rule_score / 100.0
                anomaly_score = rule_score / 100.0
        
        # Calculate Blended Risk Score (0 - 100)
        # Weights: 50% Supervised Model, 25% Anomaly Detection, 25% Rule Score
        blended_score = (
            0.50 * (supervised_prob * 100.0) +
            0.25 * (anomaly_score * 100.0) +
            0.25 * rule_score
        )
        risk_score = round(min(100.0, max(0.0, blended_score)), 1)
        
        # Determine Risk Category
        if risk_score >= 70.0:
            risk_category = "High"
            is_flagged = True
            recommended_action = "BLOCK_AND_VERIFY"
        elif risk_score >= 30.0:
            risk_category = "Medium"
            is_flagged = True
            recommended_action = "STEP_UP_2FA"
        else:
            risk_category = "Low"
            is_flagged = False
            recommended_action = "ALLOW"
            
        # Compile explainable detection reasons
        all_reasons = list(rule_reasons)
        if anomaly_score >= 0.70 and "RULE_HIGH_ANOMALY" not in triggered_rules:
            triggered_rules.append("RULE_HIGH_ANOMALY")
            all_reasons.append(
                f"Behavioral anomaly detector identified outlier vectors in transaction topology (Anomaly index: {anomaly_score * 100:.1f}%)."
            )
            
        if supervised_prob >= 0.80 and not all_reasons:
            all_reasons.append(
                f"Supervised fraud classifier detected high statistical correlation with known fraudulent patterns (Fraud probability: {supervised_prob * 100:.1f}%)."
            )
            
        if not all_reasons:
            all_reasons.append("Standard legitimate transaction parameters within normal user baseline.")
            
        return {
            "transaction_id": txn.get("transaction_id", "UNKNOWN"),
            "fraud_probability": round(supervised_prob, 4),
            "risk_score": risk_score,
            "risk_category": risk_category,
            "anomaly_score": round(anomaly_score, 4),
            "is_flagged": is_flagged,
            "detection_reasons": all_reasons,
            "rule_triggers": triggered_rules,
            "recommended_action": recommended_action,
            "anomaly_detection_result": {
                "model": "IsolationForest",
                "anomaly_score": round(anomaly_score, 4),
                "is_outlier": bool(anomaly_score >= 0.55)
            },
            "supervised_classification_result": {
                "model": "RandomForestClassifier",
                "fraud_probability": round(supervised_prob, 4),
                "feature_contributions": feature_contributions
            }
        }

# Global singleton engine instance
fraud_detector = FraudGuardEngine()
