import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.seed import seed_database
from app.ml.detector import fraud_detector
from app.websocket.manager import ws_manager
from app.api.v1 import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fraudguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing FraudGuard AI Backend Services...")
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified and initialized.")
        
        # Seed initial demo users and transactions
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
            
        logger.info(f"ML Detection Engine Status: {'Active (Ensemble loaded)' if fraud_detector.is_loaded else 'Running in rule-fallback mode'}")
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")
        
    yield
    
    # Shutdown actions
    logger.info("Shutting down FraudGuard AI services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-Time Fraud Detection for UPI and Digital Payments. Detect Before You Pay. Protect Every Transaction.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

@app.get("/docs", include_in_schema=False)
def docs_redirect():
    return RedirectResponse(url="/api/docs")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root Endpoint
@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

# Real-Time WebSocket for Live Transaction Alerts & Streaming
@app.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and await any client ping/pong or queries
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

