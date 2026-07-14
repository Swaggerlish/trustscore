from __future__ import annotations

from fastapi import APIRouter

from app.schemas.privacy import PrivacyEvaluationRequest, PrivacyEvaluationResponse
from app.services.privacy_service import evaluate_privacy

router = APIRouter(prefix="/privacy", tags=["Privacy & Security"])


@router.post("/evaluate", response_model=PrivacyEvaluationResponse)
def evaluate_privacy_endpoint(
    payload: PrivacyEvaluationRequest,
) -> PrivacyEvaluationResponse:
    return evaluate_privacy(payload)
