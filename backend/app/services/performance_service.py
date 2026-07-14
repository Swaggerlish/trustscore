from __future__ import annotations

from app.core.scoring import classify_risk, score_boolean_controls
from app.schemas.performance import (
    PerformanceEvaluationRequest,
    PerformanceEvaluationResponse,
)


CONTROL_LABELS = {
    "latency_sla_defined": "latency service-level objective",
    "throughput_tested": "throughput and concurrency testing",
    "accuracy_validated": "accuracy or task-quality validation",
    "monitoring_enabled": "production performance monitoring",
    "benchmark_documented": "benchmark methodology and results documentation",
}


def evaluate_performance(
    payload: PerformanceEvaluationRequest,
) -> PerformanceEvaluationResponse:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    performance_score, missing_controls = score_boolean_controls(controls)
    recommendations = [
        f"Provide {control} to support performance acceptance testing."
        for control in missing_controls
    ]

    return PerformanceEvaluationResponse(
        score=performance_score,
        risk_level=classify_risk(performance_score),
        recommendations=recommendations,
        performance_score=performance_score,
        missing_controls=missing_controls,
    )
