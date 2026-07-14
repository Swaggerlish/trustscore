from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.environmental_impact import (
    EnvironmentalImpactEvaluationRequest,
    EnvironmentalImpactEvaluationResponse,
)


CONTROL_LABELS = {
    "energy_usage_tracked": "energy usage tracking",
    "carbon_impact_estimated": "carbon impact estimation",
    "efficient_training_practices": "efficient training and inference practices",
    "resource_reporting_available": "compute and resource utilization reporting",
    "lifecycle_optimization_plan": "lifecycle optimization and retirement planning",
}


def evaluate_environmental_impact(
    payload: EnvironmentalImpactEvaluationRequest,
) -> EnvironmentalImpactEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    environmental_impact_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Add {control} to improve environmental accountability."
        for control in missing_controls
    ]

    return EnvironmentalImpactEvaluationResponse(
        score=environmental_impact_score,
        risk_level=classify_risk(environmental_impact_score),
        recommendations=recommendations,
        environmental_impact_score=environmental_impact_score,
        missing_controls=missing_controls,
    )
