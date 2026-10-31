import asyncio
import random
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any

from app.database.session import SessionLocal
from app.services.transaction_service import analyze_and_record_transaction
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

LOCATIONS = [
    "Mumbai, IN", "Delhi, IN", "Bengaluru, IN", "Hyderabad, IN",
    "Pune, IN", "Chennai, IN", "Kolkata, IN", "Ahmedabad, IN",
    "Jaipur, IN", "Lucknow, IN", "Chandigarh, IN", "Kochi, IN"
]

DEVICES = [
    "DEV-SM-A536B", "DEV-IPHONE-15", "DEV-REDMI-NT12", "DEV-ONEPLUS-11",
    "DEV-PIXEL-8", "DEV-MOTO-G84", "DEV-VIVO-V29", "DEV-S24-ULTRA"
]

class TransactionSimulator:
    def __init__(self):
        self.is_running: bool = False
        self.task: asyncio.Task = None
        self.interval: float = 2.0  # seconds between transactions
        self.counter: int = 1000

    def start(self, interval: float = 2.0):
        if self.is_running:
            return {"status": "already_running", "interval": self.interval}
            
        self.interval = max(0.5, min(10.0, interval))
        self.is_running = True
        self.task = asyncio.create_task(self._simulation_loop())
        logger.info(f"Live UPI Transaction Simulator started (interval: {self.interval}s)")
        return {"status": "started", "interval": self.interval}

    def stop(self):
        if not self.is_running:
            return {"status": "not_running"}
            
        self.is_running = False
        if self.task:
            self.task.cancel()
            self.task = None
        logger.info("Live UPI Transaction Simulator stopped")
        return {"status": "stopped"}

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "interval": self.interval,
            "demo_label": "DEMO DATA (SYNTHETIC UPI TRANSACTIONS)"
        }

    async def _simulation_loop(self):
        while self.is_running:
            try:
                txn = self._generate_simulated_transaction()
                db = SessionLocal()
                try:
                    await analyze_and_record_transaction(db, txn, persist=True)
                finally:
                    db.close()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in simulator loop iteration: {e}")
                
            await asyncio.sleep(self.interval)

    def _generate_simulated_transaction(self) -> Dict[str, Any]:
        self.counter += 1
        txn_id = f"SIM-UPI-{uuid.uuid4().hex[:6].upper()}"
        is_suspicious = random.random() < 0.28  # 28% suspicious for exciting live demo
        
        sender_id = f"usr_{random.randint(100, 999)}@okaxis"
        receiver_id = f"merchant_{random.randint(100, 999)}@paytm"
        
        if not is_suspicious:
            # Safe payment
            amount = round(random.choice([
                random.uniform(50, 450),
                random.uniform(500, 2500),
                random.uniform(2500, 7500)
            ]), 2)
            txn_type = random.choice(["P2P", "P2M", "BILL_PAY"])
            payment_method = random.choice(["UPI", "QR_CODE"])
            device_id = random.choice(DEVICES)
            ip_address = f"192.168.1.{random.randint(2, 254)}"
            location = random.choice(LOCATIONS)
            account_age = random.randint(30, 800)
            previous_behavior = round(random.uniform(0.8, 1.8), 2)
            transaction_frequency = random.randint(1, 4)
            receiver_risk_history = round(random.uniform(0.01, 0.15), 3)
            is_collect_request = False
            is_new_beneficiary = random.random() < 0.15
            transaction_velocity = round(random.uniform(0.2, 1.2), 2)
        else:
            # Suspicious scenario
            pattern = random.choice([
                "collect_scam", "velocity_burst", "whale_deviation", "mule_payee", "nocturnal_drain"
            ])
            device_id = random.choice(DEVICES)
            location = random.choice(LOCATIONS)
            ip_address = f"103.{random.randint(10, 190)}.{random.randint(10, 240)}.{random.randint(2, 254)}"
            
            if pattern == "collect_scam":
                amount = round(random.uniform(8000, 45000), 2)
                txn_type = "COLLECT_REQUEST"
                payment_method = "UPI"
                account_age = random.randint(20, 250)
                previous_behavior = round(random.uniform(0.5, 1.2), 2)
                transaction_frequency = random.randint(2, 6)
                receiver_risk_history = round(random.uniform(0.65, 0.95), 3)
                is_collect_request = True
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(1.2, 3.2), 2)
                
            elif pattern == "velocity_burst":
                amount = round(random.uniform(12000, 85000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(40, 300)
                previous_behavior = round(random.uniform(0.6, 1.4), 2)
                transaction_frequency = random.randint(10, 30)
                receiver_risk_history = round(random.uniform(0.4, 0.8), 3)
                is_collect_request = False
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(5.0, 12.0), 2)
                
            elif pattern == "whale_deviation":
                amount = round(random.uniform(50000, 99000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(15, 100)
                previous_behavior = round(random.uniform(0.1, 0.3), 2)  # 10x-30x deviation
                transaction_frequency = random.randint(1, 3)
                receiver_risk_history = round(random.uniform(0.5, 0.85), 3)
                is_collect_request = random.random() < 0.3
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(1.5, 2.8), 2)
                
            elif pattern == "mule_payee":
                amount = round(random.uniform(15000, 60000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(25, 200)
                previous_behavior = round(random.uniform(0.8, 1.5), 2)
                transaction_frequency = random.randint(4, 12)
                receiver_risk_history = round(random.uniform(0.82, 0.99), 3)
                is_collect_request = False
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(2.5, 5.5), 2)
                
            else:  # nocturnal_drain
                amount = round(random.uniform(20000, 75000), 2)
                txn_type = "P2P"
                payment_method = "UPI"
                account_age = random.randint(2, 10)
                previous_behavior = round(random.uniform(0.4, 1.0), 2)
                transaction_frequency = random.randint(6, 18)
                receiver_risk_history = round(random.uniform(0.45, 0.8), 3)
                is_collect_request = False
                is_new_beneficiary = True
                transaction_velocity = round(random.uniform(3.5, 7.0), 2)

        return {
            "transaction_id": txn_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "amount": amount,
            "timestamp": datetime.now(timezone.utc).isoformat(),
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
            "transaction_velocity": transaction_velocity
        }

simulator = TransactionSimulator()

