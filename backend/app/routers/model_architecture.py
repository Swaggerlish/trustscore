from __future__ import annotations

from fastapi import APIRouter

from app.schemas.model_architecture import (
    ModelArchitectureEvaluationRequest,
    ModelArchitectureEvaluationResponse,
)
from app.services.model_architecture_service import evaluate_model_architecture

router = APIRouter(prefix="/model-architecture", tags=["Model Architecture"])


@router.post("/evaluate", response_model=ModelArchitectureEvaluationResponse)
def evaluate_model_architecture_endpoint(
    payload: ModelArchitectureEvaluationRequest,
) -> ModelArchitectureEvaluationResponse:
    return evaluate_model_architecture(payload)
