import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.entities import User, Transaction, FraudPrediction, Alert, Investigation, ModelMetrics
from app.core.security import get_password_hash
from app.ml.detector import fraud_detector

def seed_database(db: Session):
    # 1. Seed Users
    admin_user = db.query(User).filter(User.email == "admin@fraudguard.ai").first()
    if not admin_user:
        admin_user = User(
            email="admin@fraudguard.ai",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Chief Risk Officer (Admin)",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        
    analyst_user = db.query(User).filter(User.email == "analyst@fraudguard.ai").first()
    if not analyst_user:
        analyst_user = User(
            email="analyst@fraudguard.ai",
            hashed_password=get_password_hash("Analyst@123"),
            full_name="Sarah Jenkins (Fraud Analyst)",
            role="analyst",
            is_active=True
        )
        db.add(analyst_user)
        
    db.commit()
    db.refresh(analyst_user)

    # 2. Seed Initial Transactions if empty
    txn_count = db.query(Transaction).count()
    if txn_count < 20:
        print("[SEED] Seeding realistic sample transactions and fraud cases...")
        now = datetime.now(timezone.utc)
        
        LOCATIONS = ["Mumbai, IN", "Delhi, IN", "Bengaluru, IN", "Hyderabad, IN", "Pune, IN", "Chennai, IN"]
        DEVICES = ["DEV-SM-A536B", "DEV-IPHONE-15", "DEV-REDMI-NT12", "DEV-ONEPLUS-11"]
        
        sample_scenarios = [
            # High Risk Flagged 1
            {
                "amount": 78500.0,
                "sender_id": "rajesh.sharma@okhdfc",
                "receiver_id": "crypto_trader99@paytm",
                "txn_type": "COLLECT_REQUEST",
                "payment_method": "UPI",
                "is_collect": True,
                "is_new": True,
                "velocity": 3.8,
                "frequency": 6,
                "receiver_risk": 0.88,
                "deviation": 8.5,
                "account_age": 14
            },
            # High Risk Flagged 2
            {
                "amount": 92000.0,
                "sender_id": "vikram.patel@oksbi",
                "receiver_id": "instant_prize_lottery@icici",
                "txn_type": "P2P",
                "payment_method": "UPI",
                "is_collect": False,
                "is_new": True,
                "velocity": 7.2,
                "frequency": 18,
                "receiver_risk": 0.94,
                "deviation": 12.0,
                "account_age": 45
            },
            # Medium Risk Flagged 3
            {
                "amount": 16400.0,
                "sender_id": "ananya.sen@okaxis",
                "receiver_id": "electronics_gadgets_hub@ybl",
                "txn_type": "P2M",
                "payment_method": "UPI",
                "is_collect": False,
                "is_new": True,
                "velocity": 2.6,
                "frequency": 4,
                "receiver_risk": 0.42,
                "deviation": 3.2,
                "account_age": 120
            },
            # Medium Risk Flagged 4
            {
                "amount": 28900.0,
                "sender_id": "deepak.kumar@okicici",
                "receiver_id": "unknown_cash_reward@airtel",
                "txn_type": "COLLECT_REQUEST",
                "payment_method": "UPI",
                "is_collect": True,
                "is_new": True,
                "velocity": 1.8,
                "frequency": 3,
                "receiver_risk": 0.55,
                "deviation": 4.1,
                "account_age": 80
            }
        ]
        
        # Add 35 legitimate transactions
        for i in range(35):
            t_offset = random.randint(10, 4300) # minutes ago
            t_time = now - timedelta(minutes=t_offset)
            amt = round(random.choice([
                random.uniform(50, 400),
                random.uniform(400, 2200),
                random.uniform(2200, 6500)
            ]), 2)
            
            txn_dict = {
                "transaction_id": f"TXN-SEED-{1000 + i}",
                "sender_id": f"customer_{random.randint(10, 99)}@okbank",
                "receiver_id": f"merchant_{random.randint(10, 99)}@upi",
                "amount": amt,
                "timestamp": t_time.isoformat(),
                "transaction_type": random.choice(["P2P", "P2M", "BILL_PAY"]),
                "payment_method": random.choice(["UPI", "QR_CODE"]),
                "device_id": random.choice(DEVICES),
                "ip_address": f"192.168.1.{random.randint(10, 250)}",
                "location": random.choice(LOCATIONS),
                "transaction_frequency": random.randint(1, 3),
                "account_age": random.randint(50, 600),
                "previous_behavior": round(random.uniform(0.8, 1.5), 2),
                "receiver_risk_history": round(random.uniform(0.01, 0.12), 3),
                "is_collect_request": False,
                "is_new_beneficiary": random.random() < 0.1,
                "transaction_velocity": round(random.uniform(0.2, 1.0), 2)
            }
            
            eval_res = fraud_detector.analyze_transaction(txn_dict)
            
            db_txn = Transaction(
                transaction_id=txn_dict["transaction_id"],
                sender_id=txn_dict["sender_id"],
                receiver_id=txn_dict["receiver_id"],
                amount=txn_dict["amount"],
                timestamp=t_time,
                transaction_type=txn_dict["transaction_type"],
                payment_method=txn_dict["payment_method"],
                device_id=txn_dict["device_id"],
                ip_address=txn_dict["ip_address"],
                location=txn_dict["location"],
                transaction_frequency=txn_dict["transaction_frequency"],
                account_age=txn_dict["account_age"],
                previous_behavior=txn_dict["previous_behavior"],
                receiver_risk_history=txn_dict["receiver_risk_history"],
                is_collect_request=txn_dict["is_collect_request"],
                is_new_beneficiary=txn_dict["is_new_beneficiary"],
                transaction_velocity=txn_dict["transaction_velocity"]
            )
            db.add(db_txn)
            db.flush()
            
            db_pred = FraudPrediction(
                transaction_id=db_txn.id,
                fraud_probability=eval_res["fraud_probability"],
                risk_score=eval_res["risk_score"],
                risk_category=eval_res["risk_category"],
                anomaly_score=eval_res["anomaly_score"],
                is_flagged=eval_res["is_flagged"],
                detection_reasons=eval_res["detection_reasons"],
                rule_triggers=eval_res["rule_triggers"],
                recommended_action=eval_res["recommended_action"],
                model_version="v1.0-ensemble"
            )
            db.add(db_pred)
            
        # Add the suspicious scenarios
        for idx, sc in enumerate(sample_scenarios):
            t_time = now - timedelta(minutes=random.randint(5, 600))
            txn_dict = {
                "transaction_id": f"TXN-ALERT-{2000 + idx}",
                "sender_id": sc["sender_id"],
                "receiver_id": sc["receiver_id"],
                "amount": sc["amount"],
                "timestamp": t_time.isoformat(),
                "transaction_type": sc["txn_type"],
                "payment_method": sc["payment_method"],
                "device_id": random.choice(DEVICES),
                "ip_address": f"103.{random.randint(20, 150)}.{random.randint(10, 200)}.{random.randint(10, 250)}",
                "location": random.choice(LOCATIONS),
                "transaction_frequency": sc["frequency"],
                "account_age": sc["account_age"],
                "previous_behavior": 0.5,
                "receiver_risk_history": sc["receiver_risk"],
                "is_collect_request": sc["is_collect"],
                "is_new_beneficiary": sc["is_new"],
                "transaction_velocity": sc["velocity"]
            }
            
            eval_res = fraud_detector.analyze_transaction(txn_dict)
            
            db_txn = Transaction(
                transaction_id=txn_dict["transaction_id"],
                sender_id=txn_dict["sender_id"],
                receiver_id=txn_dict["receiver_id"],
                amount=txn_dict["amount"],
                timestamp=t_time,
                transaction_type=txn_dict["transaction_type"],
                payment_method=txn_dict["payment_method"],
                device_id=txn_dict["device_id"],
                ip_address=txn_dict["ip_address"],
                location=txn_dict["location"],
                transaction_frequency=txn_dict["transaction_frequency"],
                account_age=txn_dict["account_age"],
                previous_behavior=txn_dict["previous_behavior"],
                receiver_risk_history=txn_dict["receiver_risk_history"],
                is_collect_request=txn_dict["is_collect_request"],
                is_new_beneficiary=txn_dict["is_new_beneficiary"],
                transaction_velocity=txn_dict["transaction_velocity"]
            )
            db.add(db_txn)
            db.flush()
            
            db_pred = FraudPrediction(
                transaction_id=db_txn.id,
                fraud_probability=eval_res["fraud_probability"],
                risk_score=eval_res["risk_score"],
                risk_category=eval_res["risk_category"],
                anomaly_score=eval_res["anomaly_score"],
                is_flagged=eval_res["is_flagged"],
                detection_reasons=eval_res["detection_reasons"],
                rule_triggers=eval_res["rule_triggers"],
                recommended_action=eval_res["recommended_action"],
                model_version="v1.0-ensemble"
            )
            db.add(db_pred)
            
            priority = "critical" if eval_res["risk_score"] >= 80 else "high"
            db_alert = Alert(
                transaction_id=db_txn.id,
                alert_type="FRAUD_RISK_TRIGGER",
                priority=priority,
                status="new" if idx % 2 == 0 else "under_review",
                reason=eval_res["detection_reasons"][0] if eval_res["detection_reasons"] else "Suspicious transaction",
                triggered_rules=eval_res["rule_triggers"],
                reviewed_by=analyst_user.id if idx % 2 != 0 else None
            )
            db.add(db_alert)
            db.flush()
            
            # Create sample investigation case for first alert
            if idx == 0:
                inv = Investigation(
                    alert_id=db_alert.id,
                    transaction_id=db_txn.id,
                    analyst_id=analyst_user.id,
                    status="in_progress",
                    notes="Analyst investigating high-value UPI Collect Request. Beneficiary flagged in known phishing mule lists.",
                    findings={
                        "risk_score": eval_res["risk_score"],
                        "triggered_rules": eval_res["rule_triggers"],
                        "customer_contacted": True
                    },
                    outcome="customer_verified"
                )
                db.add(inv)
                
        db.commit()
        print("[SEED] Successfully seeded initial transactions, alerts, and investigations.")

