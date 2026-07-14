from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.assessment import (
    AssessmentEvaluationRequest,
    AssessmentEvaluationResponse,
)
from app.services.accountability_service import evaluate_accountability
from app.services.aggregation_service import aggregate_assessment
from app.services.bias_service import evaluate_bias
from app.services.compliance_service import evaluate_compliance
from app.services.dataset_quality_service import evaluate_dataset_quality
from app.services.environmental_impact_service import evaluate_environmental_impact
from app.services.model_architecture_service import evaluate_model_architecture
from app.services.performance_service import evaluate_performance
from app.services.privacy_service import evaluate_privacy
from app.services.robustness_service import evaluate_robustness
from app.services.transparency_service import evaluate_transparency

router = APIRouter(prefix="/assessment", tags=["Assessment"])


@router.post("/evaluate", response_model=AssessmentEvaluationResponse)
def evaluate_assessment(
    payload: AssessmentEvaluationRequest,
) -> AssessmentEvaluationResponse:
    try:
        bias = evaluate_bias(payload.bias)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown protected group: {exc.args[0]}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    privacy = evaluate_privacy(payload.privacy)
    compliance = evaluate_compliance(payload.compliance)
    accountability = evaluate_accountability(payload.accountability)
    dataset_quality = evaluate_dataset_quality(payload.dataset_quality)
    model_architecture = evaluate_model_architecture(payload.model_architecture)
    transparency = evaluate_transparency(payload.transparency)
    environmental_impact = evaluate_environmental_impact(payload.environmental_impact)
    performance = evaluate_performance(payload.performance)
    robustness = evaluate_robustness(payload.robustness)

    return aggregate_assessment(
        bias=bias,
        dataset_quality=dataset_quality,
        model_architecture=model_architecture,
        privacy=privacy,
        compliance=compliance,
        transparency=transparency,
        environmental_impact=environmental_impact,
        accountability=accountability,
        performance=performance,
        robustness=robustness,
    )
