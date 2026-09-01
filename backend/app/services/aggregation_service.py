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
    values = list(metric_scores.values())
    return clamp_score(sum(values) / len(values))
