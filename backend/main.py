from fastapi import FastAPI
from backend.routers import residents, facilities, risk, reports, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Apex Clinical Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(residents.router)
app.include_router(facilities.router)
app.include_router(risk.router)
app.include_router(reports.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "ok"}
