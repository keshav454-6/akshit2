# FraudGuard AI — Real-Time Fraud Detection for UPI and Digital Payments

> **"Detect Before You Pay. Protect Every Transaction."**

FraudGuard AI is an intelligent fintech cybersecurity and real-time fraud prevention platform engineered to safeguard digital payment ecosystems (UPI VPAs, QR payments, Net Banking, and Wallet transfers). By intercepting and analyzing transaction requests **prior to fund clearing**, FraudGuard AI calculates composite risk scores and generates explainable security alerts to protect users from social engineering, deceptive UPI collect scams, velocity drain attacks, and mule accounts.

---

## 🌟 Key Features

1. **Hybrid Ensemble AI Engine**:
   - **Supervised Classification**: Random Forest trained on 10,000+ realistic transaction scenarios (amount deviation, collect scams, velocity bursts, mule beneficiary histories).
   - **Unsupervised Anomaly Detection**: Isolation Forest outlier scoring on high-dimensional behavioral feature topology.
   - **Deterministic Security Rules**: Real-time heuristics identifying rapid velocity bursts, abnormal amount deviation multipliers, and off-hour nocturnal anomalies.

2. **Explainable AI (XAI)**:
   - Eliminates "black box" decisions by producing human-understandable explanations for why a transaction was flagged (e.g., *"UPI Collect Request from unverified beneficiary for INR 48,000"*, *"Beneficiary VPA has elevated risk index (88%)"*).
   - Dynamically recommends multi-tiered security actions:
     - **0–29 (Low Risk)**: `ALLOW` (Normal transaction, seamless payment)
     - **30–69 (Medium Risk)**: `STEP_UP_2FA` (Secondary biometric / OTP challenge)
     - **70–100 (High Risk)**: `BLOCK_AND_VERIFY` (Payment suspended, case escalated)

3. **Live Transaction Simulator**:
   - Continuous synthetic UPI transaction generator with configurable speeds (0.5s to 4.0s).
   - Streams live payments through the active ML detection pipeline and broadcasts real-time threat alerts over WebSockets.
   - Distinctly tagged with `DEMO DATA` indicators for hackathon demonstrations.

4. **Dedicated Security & Investigation Operations**:
   - **Alert Management**: Filter by priority (`critical`, `high`, `medium`), review, escalate, or resolve alerts with analyst notes.
   - **Fraud Investigation Workbench**: Forensic case files with sender/receiver telemetry, findings documentation, and formal outcome classifications (`confirmed_fraud`, `false_positive`, `customer_verified`, `blocked_user`).

5. **Batch CSV Dataset Analysis**:
   - Upload enterprise CSV archives or evaluate sample datasets (`sample_upload_test.csv`).
   - Automated schema validation, ML prediction scoring, and downloadable risk reports.

6. **Model Insights & Evaluation**:
   - Evaluated on a 20% held-out test split showing Recall, Precision, Accuracy, ROC-AUC, FPR/FNR, Confusion Matrix, and Gini Feature Importances.

---

## 🏗️ Architecture & Technology Stack

```
fraudguard-ai/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/           # Modular REST APIs (Auth, Txns, Alerts, Invs, Simulator, Metrics)
│   │   ├── core/             # JWT Security, Password Hashing & Configuration
│   │   ├── database/         # SQLAlchemy ORM, Engine & Database Seeder
│   │   ├── ml/               # Feature Pipeline, Hybrid Detector & Model Training
│   │   ├── models/           # Relational Models (User, Txn, FraudPrediction, Alert, Inv)
│   │   ├── schemas/          # Pydantic Schemas & Request/Response Models
│   │   ├── services/         # Business Logic & DB Operations
│   │   ├── simulator/        # Async Live Transaction Generator
│   │   └── websocket/        # Real-time WebSocket Connection Manager
│   └── tests/                # Automated Backend Test Suite
├── frontend/                 # React.js 19 + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/       # Layouts, Navbar, Sidebar & Modals
│   │   ├── context/          # Authentication & Session Management
│   │   ├── hooks/            # WebSocket Stream Hook
│   │   ├── pages/            # 8 Interactive Fintech Pages
│   │   ├── services/         # Centralized Axios API Layer
│   │   └── types/            # TypeScript Domain Definitions
└── ml/                       # Persisted Models & Datasets
    ├── datasets/             # Synthetic Training Data & Sample Upload CSVs
    └── saved_models/         # Joblib Ensembles & Evaluation Metrics JSON
```

### Stack Details:
- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router.
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Uvicorn, PyJWT, WebSockets.
- **Database**: PostgreSQL (Production) / SQLite fallback (Automatic local dev).
- **Machine Learning**: Scikit-learn (RandomForestClassifier, IsolationForest), Pandas, NumPy, Joblib.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Chief Risk Officer** | `admin@fraudguard.ai` | `Admin@123` | Full Admin & Policy Controls |
| **Lead Fraud Analyst** | `analyst@fraudguard.ai` | `Analyst@123` | Alert Triage & Investigations |

*(Note: Default session opens as Lead Fraud Analyst for immediate evaluation; switch roles in Settings).*

---

## 🚀 Quickstart & Installation

### Option 1: Local Development

#### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

#### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Train the ML models and generate datasets
python -m app.ml.train

# Run automated backend test suite
python -m tests.run_tests

# Start the FastAPI server (Runs on http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm packages
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

### Option 2: Docker Compose

```bash
# Build and run backend + PostgreSQL with a single command
docker-compose up --build
```

---

## 📡 API Endpoints Reference

Interactive OpenAPI documentation is live at **`http://localhost:8000/docs`**.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token |
| `POST` | `/api/v1/transactions/analyze` | Analyze single transaction through Hybrid AI pipeline |
| `GET` | `/api/v1/transactions` | Query and filter monitored transactions |
| `GET` | `/api/v1/transactions/{id}` | Detailed transaction telemetry & explainability |
| `POST` | `/api/v1/transactions/bulk-upload` | Upload CSV dataset for batch risk classification |
| `GET` | `/api/v1/dashboard/analytics` | Aggregated analytics (KPIs, trend line, pie charts) |
| `GET` | `/api/v1/alerts` | Query active fraud alerts by priority and status |
| `PATCH` | `/api/v1/alerts/{id}` | Update alert status (`under_review`, `resolved`, `escalated`) |
| `GET` | `/api/v1/investigations` | List active investigation cases |
| `PATCH` | `/api/v1/investigations/{id}` | Add analyst forensic findings & set outcome |
| `POST` | `/api/v1/simulator/start` | Start live synthetic UPI payment generator |
| `POST` | `/api/v1/simulator/stop` | Stop live simulator |
| `GET` | `/api/v1/simulator/status` | Current streaming status |
| `GET` | `/api/v1/model/metrics` | Model evaluation metrics (Precision, Recall, CM) |
| `GET` | `/api/v1/health` | Service health status |
| `WS` | `/ws/stream` | WebSocket endpoint for real-time live events |

---

## 🔒 Security & Privacy Notice

FraudGuard AI operates strictly on behavioral metadata and anonymized transactional signals. In full adherence to cybersecurity and digital banking compliance, **the system never requests, stores, or processes actual UPI PINs, bank passwords, OTPs, or card CVVs**.

---

## 🏆 Hackathon Demonstration Highlights

- **Live Simulator**: Click *"Start Live Simulator"* in the top navbar to watch transactions stream into the dashboard and trigger live alerts in real time over WebSockets.
- **Manual Payment Evaluator**: Click *"Analyze Transaction"* to test custom payment vectors (e.g. UPI Collect scams, rapid velocity bursts, mule receivers) with instant explainable reasons.
- **Dataset Analysis**: Head to *"Dataset Analysis"*, click *"Download Sample CSV"*, upload it, and watch the batch prediction engine classify all 50 transactions with full risk breakdowns.

