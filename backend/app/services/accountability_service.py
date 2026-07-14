from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.accountability import (
    AccountabilityEvaluationRequest,
    AccountabilityEvaluationResponse,
)


CONTROL_LABELS = {
    "responsible_owner_defined": "responsible owner defined",
    "audit_logs_available": "audit logs available",
    "human_oversight_present": "human oversight present",
    "incident_response_process": "incident response process",
    "governance_board_defined": "governance board defined",
}


def evaluate_accountability(
    payload: AccountabilityEvaluationRequest,
) -> AccountabilityEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    accountability_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Establish {control} for stronger vendor accountability."
        for control in missing_controls
    ]

    return AccountabilityEvaluationResponse(
        score=accountability_score,
        risk_level=classify_risk(accountability_score),
        recommendations=recommendations,
        accountability_score=accountability_score,
        missing_controls=missing_controls,
    )
