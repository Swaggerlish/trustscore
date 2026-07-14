from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.compliance import ComplianceEvaluationRequest, ComplianceEvaluationResponse


REQUIREMENT_LABELS = {
    "gdpr": "GDPR",
    "eu_ai_act": "EU AI Act",
    "hipaa": "HIPAA",
}


def evaluate_compliance(payload: ComplianceEvaluationRequest) -> ComplianceEvaluationResponse:
    requirements = {
        label: getattr(payload, field_name)
        for field_name, label in REQUIREMENT_LABELS.items()
    }
    compliance_score, failed_requirements = score_boolean_controls(requirements)
    recommendations = [
        f"Close documented gaps for {requirement} before procurement approval."
        for requirement in failed_requirements
    ]

    return ComplianceEvaluationResponse(
        score=compliance_score,
        risk_level=classify_risk(compliance_score),
        recommendations=recommendations,
        compliance_score=compliance_score,
        failed_requirements=failed_requirements,
    )
