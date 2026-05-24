from fastapi import APIRouter
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token")
def get_token():
    return {"access_token": "mock_token"}
