from fastapi import APIRouter
router = APIRouter(prefix="/risk-scores", tags=["risk"])

@router.get("/")
def get_risk_scores():
    return []

@router.post("/calculate")
def calculate_risk():
    return {"status": "calculated"}
