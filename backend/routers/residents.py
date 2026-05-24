from fastapi import APIRouter
router = APIRouter(prefix="/residents", tags=["residents"])

@router.get("/")
def list_residents():
    return []

@router.get("/{id}")
def get_resident(id: int):
    return {"id": id}
