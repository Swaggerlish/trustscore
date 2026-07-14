from __future__ import annotations

from fastapi import APIRouter

from app.schemas.performance import (
    PerformanceEvaluationRequest,
    PerformanceEvaluationResponse,
)
from app.services.performance_service import evaluate_performance

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.post("/evaluate", response_model=PerformanceEvaluationResponse)
def evaluate_performance_endpoint(
    payload: PerformanceEvaluationRequest,
) -> PerformanceEvaluationResponse:
    return evaluate_performance(payload)
