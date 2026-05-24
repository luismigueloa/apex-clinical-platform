from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import residents, facilities, risk, reports, auth
from backend.routers.ai import router as ai_router

app = FastAPI(
    title="Apex Clinical Intelligence Platform",
    description="Backend API — AI keys are stored server-side only, never exposed to the browser.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(residents.router)
app.include_router(facilities.router)
app.include_router(risk.router)
app.include_router(reports.router)
app.include_router(auth.router)

# AI Command Center router (Option C — keys backend-only)
app.include_router(ai_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
