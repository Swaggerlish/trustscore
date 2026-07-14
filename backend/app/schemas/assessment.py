from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel
from app.schemas.accountability import AccountabilityEvaluationRequest
from app.schemas.bias import BiasEvaluationRequest
from app.schemas.compliance import ComplianceEvaluationRequest
from app.schemas.dataset_quality import DatasetQualityEvaluationRequest
from app.schemas.environmental_impact import EnvironmentalImpactEvaluationRequest
from app.schemas.model_architecture import ModelArchitectureEvaluationRequest
from app.schemas.performance import PerformanceEvaluationRequest
from app.schemas.privacy import PrivacyEvaluationRequest
from app.schemas.robustness import RobustnessEvaluationRequest
from app.schemas.transparency import TransparencyEvaluationRequest


class AssessmentEvaluationRequest(BaseModel):
    vendor_name: str | None = Field(default=None, min_length=1)
    bias: BiasEvaluationRequest
    dataset_quality: DatasetQualityEvaluationRequest
    model_architecture: ModelArchitectureEvaluationRequest
    privacy: PrivacyEvaluationRequest
    compliance: ComplianceEvaluationRequest
    transparency: TransparencyEvaluationRequest
    environmental_impact: EnvironmentalImpactEvaluationRequest
    accountability: AccountabilityEvaluationRequest
    performance: PerformanceEvaluationRequest
    robustness: RobustnessEvaluationRequest


class AssessmentEvaluationResponse(BaseModel):
    bias_score: float = Field(..., ge=0, le=100)
    dataset_quality_score: float = Field(..., ge=0, le=100)
    model_architecture_score: float = Field(..., ge=0, le=100)
    privacy_score: float = Field(..., ge=0, le=100)
    compliance_score: float = Field(..., ge=0, le=100)
    transparency_score: float = Field(..., ge=0, le=100)
    environmental_impact_score: float = Field(..., ge=0, le=100)
    accountability_score: float = Field(..., ge=0, le=100)
    performance_score: float = Field(..., ge=0, le=100)
    robustness_score: float = Field(..., ge=0, le=100)
    demographic_parity_difference: float
    disparate_impact_ratio: float
    bias_evaluation_method: str
    dataset_quality_evaluation_method: str
    data_quality_metrics: dict[str, float | int | bool | str]
    overall_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
