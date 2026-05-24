"""
AI Query Router — Apex Health SNF Platform (Option C Architecture)

Security principles:
- ANTHROPIC_API_KEY lives only in server-side environment; never returned to client
- All requests are audit-logged (department, model, timestamp, token usage)
- PHI warning: prompts may contain resident info — do not log full prompt text in production
- Model selection is server-controlled; client may suggest but server validates
"""

import os
import time
import logging
from datetime import datetime, timezone
from typing import Optional

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.agents.department_agents import get_system_prompt, get_agent_name

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI"])

# ---------------------------------------------------------------------------
# Model routing — map logical names to Anthropic model IDs
# ---------------------------------------------------------------------------
MODEL_MAP = {
    "haiku":  "claude-haiku-4-5-20251001",    # Fast lookups, simple drafts
    "sonnet": "claude-sonnet-4-6",              # Clinical analysis, care plans
    "opus":   "claude-opus-4-6",                # Legal/regulatory deep analysis
}
DEFAULT_MODEL = "sonnet"

# Department → preferred model (can be overridden per-request)
DEPARTMENT_DEFAULT_MODEL: dict[str, str] = {
    "nursing":         "sonnet",
    "mds":             "sonnet",
    "dietary":         "sonnet",
    "social_work":     "sonnet",
    "activities":      "haiku",
    "business_office": "sonnet",
    "compliance":      "opus",   # Regulatory depth warrants Opus
    "all":             "sonnet",
}


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class AIQueryRequest(BaseModel):
    department: str = "all"
    task: str
    model: Optional[str] = None          # client hint; server may override
    max_tokens: Optional[int] = 1024


class AIQueryResponse(BaseModel):
    result: str
    model_used: str
    department: str
    agent_name: str
    duration_ms: int


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post("/query", response_model=AIQueryResponse)
async def ai_query(request: AIQueryRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set ANTHROPIC_API_KEY in the backend environment."
        )

    # Validate department
    department = request.department.strip().lower() or "all"

    # Resolve model: client hint → department default → global default
    model_key = (request.model or "").strip().lower()
    if model_key not in MODEL_MAP:
        model_key = DEPARTMENT_DEFAULT_MODEL.get(department, DEFAULT_MODEL)
    model_id = MODEL_MAP[model_key]

    system_prompt = get_system_prompt(department)
    agent_name = get_agent_name(department)

    # Clamp max_tokens
    max_tokens = max(256, min(request.max_tokens or 1024, 4096))

    # Audit log — truncate task to avoid logging PHI in production
    logger.info(
        "[AI AUDIT] dept=%s model=%s agent=%s task_len=%d ts=%s",
        department,
        model_id,
        agent_name,
        len(request.task),
        datetime.now(timezone.utc).isoformat(),
    )

    start = time.monotonic()
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=model_id,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": request.task}],
        )
        result_text = message.content[0].text if message.content else ""
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key.")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Anthropic rate limit reached. Try again shortly.")
    except anthropic.APIError as e:
        logger.error("[AI ERROR] %s", str(e))
        raise HTTPException(status_code=502, detail=f"AI API error: {str(e)}")
    except Exception as e:
        logger.error("[AI ERROR] Unexpected: %s", str(e))
        raise HTTPException(status_code=500, detail="Unexpected AI service error.")

    duration_ms = int((time.monotonic() - start) * 1000)

    logger.info(
        "[AI AUDIT] completed dept=%s model=%s duration_ms=%d tokens_used=%s",
        department,
        model_id,
        duration_ms,
        getattr(message, "usage", {}).get("output_tokens", "?"),
    )

    return AIQueryResponse(
        result=result_text,
        model_used=model_id,
        department=department,
        agent_name=agent_name,
        duration_ms=duration_ms,
    )
