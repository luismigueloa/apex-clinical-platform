from fastapi import APIRouter
router = APIRouter(prefix="/facilities", tags=["facilities"])

@router.get("/")
def list_facilities():
    return []

@router.get("/{id}/stats")
def get_facility_stats(id: int):
    return {"id": id, "stats": {}}
