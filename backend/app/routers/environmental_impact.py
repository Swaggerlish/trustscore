from __future__ import annotations

from fastapi import APIRouter

from app.schemas.environmental_impact import (
    EnvironmentalImpactEvaluationRequest,
    EnvironmentalImpactEvaluationResponse,
)
from app.services.environmental_impact_service import evaluate_environmental_impact

router = APIRouter(prefix="/environmental-impact", tags=["Environmental Impact"])


@router.post("/evaluate", response_model=EnvironmentalImpactEvaluationResponse)
def evaluate_environmental_impact_endpoint(
    payload: EnvironmentalImpactEvaluationRequest,
) -> EnvironmentalImpactEvaluationResponse:
    return evaluate_environmental_impact(payload)
