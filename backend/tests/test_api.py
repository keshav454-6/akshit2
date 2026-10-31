import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FraudGuard AI" in data["service"]

def test_model_metrics():
    response = client.get("/api/v1/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert data["recall"] >= 0.90

def test_auth_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "analyst@fraudguard.ai",
        "password": "Analyst@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "analyst"

def test_transaction_analysis_safe():
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
    response = client.post("/api/v1/transactions/analyze", json=txn_data)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_category"] == "Low"
    assert data["risk_score"] < 30
    assert data["recommended_action"] == "ALLOW"

def test_transaction_analysis_fraud():
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
    response = client.post("/api/v1/transactions/analyze", json=txn_data)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_category"] == "High"
    assert data["risk_score"] >= 70
    assert "BLOCK" in data["recommended_action"] or "2FA" in data["recommended_action"]
    assert len(data["detection_reasons"]) > 0

def test_dashboard_analytics():
    response = client.get("/api/v1/dashboard/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "safe_transactions" in data
    assert "pie_distribution" in data

def test_alerts_list():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_simulator_status():
    response = client.get("/api/v1/simulator/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data

