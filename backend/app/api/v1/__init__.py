from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.simulator import router as simulator_router
from app.api.v1.model import router as model_router
from app.api.v1.health import router as health_router
from app.api.v1.download import router as download_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(transactions_router)
api_router.include_router(alerts_router)
api_router.include_router(investigations_router)
api_router.include_router(dashboard_router)
api_router.include_router(simulator_router)
api_router.include_router(model_router)
api_router.include_router(health_router)
api_router.include_router(download_router)

