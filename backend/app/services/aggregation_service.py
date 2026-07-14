from __future__ import annotations

from app.core.scoring import classify_risk, clamp_score
from app.schemas.accountability import AccountabilityEvaluationResponse
from app.schemas.assessment import AssessmentEvaluationResponse
from app.schemas.bias import BiasEvaluationResponse
from app.schemas.compliance import ComplianceEvaluationResponse
from app.schemas.dataset_quality import DatasetQualityEvaluationResponse
from app.schemas.environmental_impact import EnvironmentalImpactEvaluationResponse
from app.schemas.model_architecture import ModelArchitectureEvaluationResponse
from app.schemas.performance import PerformanceEvaluationResponse
from app.schemas.privacy import PrivacyEvaluationResponse
from app.schemas.robustness import RobustnessEvaluationResponse
from app.schemas.transparency import TransparencyEvaluationResponse


BIAS_WEIGHT = 0.15
DATASET_QUALITY_WEIGHT = 0.12
MODEL_ARCHITECTURE_WEIGHT = 0.10
PRIVACY_WEIGHT = 0.12
COMPLIANCE_WEIGHT = 0.12
TRANSPARENCY_WEIGHT = 0.10
ENVIRONMENTAL_IMPACT_WEIGHT = 0.07
ACCOUNTABILITY_WEIGHT = 0.10
PERFORMANCE_WEIGHT = 0.07
ROBUSTNESS_WEIGHT = 0.05
WEIGHTED_AVERAGE_FACTOR = 0.70
WEAKEST_METRIC_FACTOR = 0.30
CRITICAL_METRIC_CAP = 59.0
SEVERE_METRIC_CAP = 49.0


def aggregate_assessment(
    bias: BiasEvaluationResponse,
    dataset_quality: DatasetQualityEvaluationResponse,
    model_architecture: ModelArchitectureEvaluationResponse,
    privacy: PrivacyEvaluationResponse,
    compliance: ComplianceEvaluationResponse,
    transparency: TransparencyEvaluationResponse,
    environmental_impact: EnvironmentalImpactEvaluationResponse,
    accountability: AccountabilityEvaluationResponse,
    performance: PerformanceEvaluationResponse,
    robustness: RobustnessEvaluationResponse,
) -> AssessmentEvaluationResponse:
    metric_scores = {
        "bias": bias.fairness_score,
        "dataset_quality": dataset_quality.dataset_quality_score,
        "model_architecture": model_architecture.model_architecture_score,
        "privacy": privacy.privacy_score,
        "compliance": compliance.compliance_score,
        "transparency": transparency.transparency_score,
        "environmental_impact": environmental_impact.environmental_impact_score,
        "accountability": accountability.accountability_score,
        "performance": performance.performance_score,
        "robustness": robustness.robustness_score,
    }
    overall_score = compute_overall_score(metric_scores)

    recommendations = [
        *bias.recommendations,
        *dataset_quality.recommendations,
        *model_architecture.recommendations,
        *privacy.recommendations,
        *compliance.recommendations,
        *transparency.recommendations,
        *environmental_impact.recommendations,
        *accountability.recommendations,
        *performance.recommendations,
        *robustness.recommendations,
    ]

    return AssessmentEvaluationResponse(
        bias_score=bias.fairness_score,
        dataset_quality_score=dataset_quality.dataset_quality_score,
        model_architecture_score=model_architecture.model_architecture_score,
        privacy_score=privacy.privacy_score,
        compliance_score=compliance.compliance_score,
        transparency_score=transparency.transparency_score,
        environmental_impact_score=environmental_impact.environmental_impact_score,
        accountability_score=accountability.accountability_score,
        performance_score=performance.performance_score,
        robustness_score=robustness.robustness_score,
        demographic_parity_difference=bias.demographic_parity_difference,
        disparate_impact_ratio=bias.disparate_impact_ratio,
        bias_evaluation_method=bias.evaluation_method,
        dataset_quality_evaluation_method=dataset_quality.evaluation_method,
        data_quality_metrics=dataset_quality.data_quality_metrics,
        overall_score=overall_score,
        risk_level=classify_risk(overall_score),
        recommendations=recommendations,
    )


def compute_overall_score(metric_scores: dict[str, float]) -> float:
    weighted_score = (
        (metric_scores["bias"] * BIAS_WEIGHT)
        + (metric_scores["dataset_quality"] * DATASET_QUALITY_WEIGHT)
        + (metric_scores["model_architecture"] * MODEL_ARCHITECTURE_WEIGHT)
        + (metric_scores["privacy"] * PRIVACY_WEIGHT)
        + (metric_scores["compliance"] * COMPLIANCE_WEIGHT)
        + (metric_scores["transparency"] * TRANSPARENCY_WEIGHT)
        + (metric_scores["environmental_impact"] * ENVIRONMENTAL_IMPACT_WEIGHT)
        + (metric_scores["accountability"] * ACCOUNTABILITY_WEIGHT)
        + (metric_scores["performance"] * PERFORMANCE_WEIGHT)
        + (metric_scores["robustness"] * ROBUSTNESS_WEIGHT)
    )
    weakest_metric = min(metric_scores.values())
    penalty_aware_score = (
        weighted_score * WEIGHTED_AVERAGE_FACTOR
    ) + (weakest_metric * WEAKEST_METRIC_FACTOR)

    if weakest_metric < 25:
        penalty_aware_score = min(penalty_aware_score, SEVERE_METRIC_CAP)
    elif min(
        metric_scores["bias"],
        metric_scores["privacy"],
        metric_scores["compliance"],
    ) < 40:
        penalty_aware_score = min(penalty_aware_score, CRITICAL_METRIC_CAP)

    return clamp_score(penalty_aware_score)
