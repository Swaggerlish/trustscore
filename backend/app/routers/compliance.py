from __future__ import annotations

from fastapi import APIRouter

from app.schemas.compliance import ComplianceEvaluationRequest, ComplianceEvaluationResponse
from app.services.compliance_service import evaluate_compliance

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.post("/evaluate", response_model=ComplianceEvaluationResponse)
def evaluate_compliance_endpoint(
    payload: ComplianceEvaluationRequest,
) -> ComplianceEvaluationResponse:
    return evaluate_compliance(payload)
