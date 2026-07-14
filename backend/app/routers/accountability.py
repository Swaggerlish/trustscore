from __future__ import annotations

from fastapi import APIRouter

from app.schemas.accountability import (
    AccountabilityEvaluationRequest,
    AccountabilityEvaluationResponse,
)
from app.services.accountability_service import evaluate_accountability

router = APIRouter(prefix="/accountability", tags=["Accountability"])


@router.post("/evaluate", response_model=AccountabilityEvaluationResponse)
def evaluate_accountability_endpoint(
    payload: AccountabilityEvaluationRequest,
) -> AccountabilityEvaluationResponse:
    return evaluate_accountability(payload)
