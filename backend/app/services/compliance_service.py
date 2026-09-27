from __future__ import annotations

from app.core.scoring import classify_risk
from app.schemas.compliance import ComplianceEvaluationRequest, ComplianceEvaluationResponse


REQUIREMENT_LABELS = {
    "gdpr": "GDPR",
    "eu_ai_act": "EU AI Act",
    "hipaa": "HIPAA",
}


def evaluate_compliance(payload: ComplianceEvaluationRequest) -> ComplianceEvaluationResponse:
    selected_frameworks = payload.risk_frameworks or [
        label
        for field_name, label in REQUIREMENT_LABELS.items()
        if getattr(payload, field_name)
    ]
    has_framework = bool(selected_frameworks)
    compliance_score = 100.0 if has_framework else 0.0
    failed_requirements = [] if has_framework else ["Risk management framework"]
    recommendations = [] if has_framework else [
        "Select at least one risk management framework before procurement approval."
    ]

    return ComplianceEvaluationResponse(
        score=compliance_score,
        risk_level=classify_risk(compliance_score),
        recommendations=recommendations,
        compliance_score=compliance_score,
        failed_requirements=failed_requirements,
    )
