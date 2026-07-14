from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.privacy import PrivacyEvaluationRequest, PrivacyEvaluationResponse


CONTROL_LABELS = {
    "encryption": "encryption",
    "anonymization": "anonymization",
    "access_controls": "access controls",
    "data_minimization": "data minimization",
}


def evaluate_privacy(payload: PrivacyEvaluationRequest) -> PrivacyEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    privacy_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Implement {control} to strengthen privacy and security controls."
        for control in missing_controls
    ]

    return PrivacyEvaluationResponse(
        score=privacy_score,
        risk_level=classify_risk(privacy_score),
        recommendations=recommendations,
        privacy_score=privacy_score,
        missing_controls=missing_controls,
    )
