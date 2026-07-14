from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.transparency import (
    TransparencyEvaluationRequest,
    TransparencyEvaluationResponse,
)


CONTROL_LABELS = {
    "model_card_available": "model card or system factsheet",
    "explainability_documented": "explainability and feature attribution documentation",
    "decision_logging_enabled": "decision logging and traceability",
    "user_disclosures_provided": "user-facing AI disclosures",
    "limitations_disclosed": "known limitations and appropriate-use boundaries",
}


def evaluate_transparency(
    payload: TransparencyEvaluationRequest,
) -> TransparencyEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    transparency_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Provide {control} to improve transparency and auditability."
        for control in missing_controls
    ]

    return TransparencyEvaluationResponse(
        score=transparency_score,
        risk_level=classify_risk(transparency_score),
        recommendations=recommendations,
        transparency_score=transparency_score,
        missing_controls=missing_controls,
    )
