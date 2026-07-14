from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.robustness import (
    RobustnessEvaluationRequest,
    RobustnessEvaluationResponse,
)


CONTROL_LABELS = {
    "adversarial_testing_performed": "adversarial and misuse testing",
    "drift_monitoring_enabled": "data and model drift monitoring",
    "fallback_controls_defined": "fallback controls for degraded model behavior",
    "stress_testing_completed": "stress testing under edge cases and load",
    "incident_playbooks_available": "incident response playbooks for model failures",
}


def evaluate_robustness(
    payload: RobustnessEvaluationRequest,
) -> RobustnessEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    robustness_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Implement {control} to reduce operational and model failure risk."
        for control in missing_controls
    ]

    return RobustnessEvaluationResponse(
        score=robustness_score,
        risk_level=classify_risk(robustness_score),
        recommendations=recommendations,
        robustness_score=robustness_score,
        missing_controls=missing_controls,
    )
