from fastapi import APIRouter, Query
from app.simulator.stream_simulator import simulator

router = APIRouter(prefix="/simulator", tags=["Live Transaction Simulator"])

@router.post("/start")
def start_simulation(interval: float = Query(2.0, ge=0.5, le=10.0, description="Interval in seconds")):
    """Start continuous live UPI transaction generation through real-time ML detection."""
    return simulator.start(interval=interval)

@router.post("/stop")
def stop_simulation():
    """Stop the live simulation engine."""
    return simulator.stop()

@router.get("/status")
def get_simulation_status():
    """Get current running state of the live transaction simulator."""
    return simulator.get_status()

