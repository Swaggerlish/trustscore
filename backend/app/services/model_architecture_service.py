from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.model_architecture import (
    ModelArchitectureEvaluationRequest,
    ModelArchitectureEvaluationResponse,
)


CONTROL_LABELS = {
    "architecture_documented": "model architecture documentation",
    "training_methodology_documented": "training methodology documentation",
    "version_control": "version control and release traceability",
    "deployment_architecture_provided": "deployment architecture documentation",
    "explainability_mechanism": "explainability mechanism documentation",
}


def evaluate_model_architecture(
    payload: ModelArchitectureEvaluationRequest,
) -> ModelArchitectureEvaluationResponse:
    resolved_controls = {
        "architecture_documented": payload.architecture_documented,
        "training_methodology_documented": (
            payload.training_methodology_documented
            or payload.validation_strategy_defined
        ),
        "version_control": payload.version_control or payload.model_versioning_enabled,
        "deployment_architecture_provided": (
            payload.deployment_architecture_provided
            or payload.dependency_inventory_available
        ),
        "explainability_mechanism": payload.explainability_mechanism or payload.limitations_documented,
    }
    controls = {
        label: resolved_controls[field_name]
        for field_name, label in CONTROL_LABELS.items()
    }
    model_architecture_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Document {control} to strengthen architecture review readiness."
        for control in missing_controls
    ]

    return ModelArchitectureEvaluationResponse(
        score=model_architecture_score,
        risk_level=classify_risk(model_architecture_score),
        recommendations=recommendations,
        model_architecture_score=model_architecture_score,
        missing_controls=missing_controls,
    )
