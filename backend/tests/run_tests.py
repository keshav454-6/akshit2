import unittest
import sys
from fastapi.testclient import TestClient
from app.main import app

class FraudGuardTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("FraudGuard AI", data["service"])
        print("[PASS] Health Check")

    def test_02_model_metrics(self):
        response = self.client.get("/api/v1/model/metrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("accuracy", data)
        self.assertIn("precision", data)
        self.assertIn("recall", data)
        self.assertGreaterEqual(data["recall"], 0.90)
        print(f"[PASS] Model Metrics (Recall: {data['recall']}, Accuracy: {data['accuracy']})")

    def test_03_auth_login(self):
        response = self.client.post("/api/v1/auth/login", json={
            "email": "analyst@fraudguard.ai",
            "password": "Analyst@123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "analyst")
        print("[PASS] Analyst JWT Authentication")

    def test_04_safe_transaction_analysis(self):
        txn_data = {
            "transaction_id": "TEST-SAFE-001",
            "sender_id": "alice@okaxis",
            "receiver_id": "bob@oksbi",
            "amount": 150.0,
            "transaction_type": "P2P",
            "payment_method": "UPI",
            "device_id": "DEV-TEST-01",
            "ip_address": "192.168.1.50",
            "location": "Mumbai, IN",
            "transaction_frequency": 2,
            "account_age": 180,
            "previous_behavior": 1.0,
            "receiver_risk_history": 0.05,
            "is_collect_request": False,
            "is_new_beneficiary": False,
            "transaction_velocity": 0.5
        }
        response = self.client.post("/api/v1/transactions/analyze", json=txn_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["risk_category"], "Low")
        self.assertLess(data["risk_score"], 30)
        self.assertEqual(data["recommended_action"], "ALLOW")
        print(f"[PASS] Safe Transaction Detection (Risk Score: {data['risk_score']})")

    def test_05_fraud_transaction_analysis(self):
        txn_data = {
            "transaction_id": "TEST-FRAUD-001",
            "sender_id": "victim@okhdfc",
            "receiver_id": "phishing_scammer@paytm",
            "amount": 78000.0,
            "transaction_type": "COLLECT_REQUEST",
            "payment_method": "UPI",
            "device_id": "DEV-TEST-02",
            "ip_address": "103.11.22.33",
            "location": "Delhi, IN",
            "transaction_frequency": 9,
            "account_age": 20,
            "previous_behavior": 0.3,
            "receiver_risk_history": 0.92,
            "is_collect_request": True,
            "is_new_beneficiary": True,
            "transaction_velocity": 6.5
        }
        response = self.client.post("/api/v1/transactions/analyze", json=txn_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["risk_category"], "High")
        self.assertGreaterEqual(data["risk_score"], 70)
        self.assertIn("BLOCK", data["recommended_action"])
        self.assertGreater(len(data["detection_reasons"]), 0)
        print(f"[PASS] Fraud Phishing Intercept (Risk Score: {data['risk_score']}, Reasons: {len(data['detection_reasons'])})")

    def test_06_dashboard_analytics(self):
        response = self.client.get("/api/v1/dashboard/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_transactions", data)
        self.assertIn("safe_transactions", data)
        self.assertIn("pie_distribution", data)
        print(f"[PASS] Dashboard Aggregations (Total Transactions: {data['total_transactions']})")

    def test_07_alerts_and_investigations(self):
        alerts_resp = self.client.get("/api/v1/alerts")
        self.assertEqual(alerts_resp.status_code, 200)
        alerts = alerts_resp.json()
        self.assertIsInstance(alerts, list)
        self.assertGreater(len(alerts), 0)

        inv_resp = self.client.get("/api/v1/investigations")
        self.assertEqual(inv_resp.status_code, 200)
        self.assertIsInstance(inv_resp.json(), list)
        print(f"[PASS] Alerts & Investigations Active (Alert Count: {len(alerts)})")

    def test_08_simulator_status(self):
        response = self.client.get("/api/v1/simulator/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("is_running", data)
        self.assertIn("DEMO", data["demo_label"])
        print("[PASS] Live Transaction Simulator API")

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(FraudGuardTestCase)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)

