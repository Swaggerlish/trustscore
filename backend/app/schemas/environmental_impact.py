from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class EnvironmentalImpactEvaluationRequest(BaseModel):
    energy_usage_tracked: bool = False
    carbon_impact_estimated: bool = False
    efficient_training_practices: bool = False
    resource_reporting_available: bool = False
    lifecycle_optimization_plan: bool = False


class EnvironmentalImpactEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    environmental_impact_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
