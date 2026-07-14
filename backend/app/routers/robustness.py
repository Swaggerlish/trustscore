from __future__ import annotations

from fastapi import APIRouter

from app.schemas.robustness import (
    RobustnessEvaluationRequest,
    RobustnessEvaluationResponse,
)
from app.services.robustness_service import evaluate_robustness

router = APIRouter(prefix="/robustness", tags=["Robustness"])


@router.post("/evaluate", response_model=RobustnessEvaluationResponse)
def evaluate_robustness_endpoint(
    payload: RobustnessEvaluationRequest,
) -> RobustnessEvaluationResponse:
    return evaluate_robustness(payload)
