from __future__ import annotations

from fastapi import APIRouter

from app.schemas.transparency import (
    TransparencyEvaluationRequest,
    TransparencyEvaluationResponse,
)
from app.services.transparency_service import evaluate_transparency

router = APIRouter(prefix="/transparency", tags=["Transparency"])


@router.post("/evaluate", response_model=TransparencyEvaluationResponse)
def evaluate_transparency_endpoint(
    payload: TransparencyEvaluationRequest,
) -> TransparencyEvaluationResponse:
    return evaluate_transparency(payload)
