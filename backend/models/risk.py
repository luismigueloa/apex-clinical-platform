from pydantic import BaseModel
class RiskScore(BaseModel):
    score: int
    band: str
