from fastapi import APIRouter
router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/morning-brief/{facility_id}")
def get_morning_brief(facility_id: int):
    return {"facility_id": facility_id, "url": "http://example.com/brief.pdf"}
