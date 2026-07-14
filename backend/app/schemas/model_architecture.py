from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class ModelArchitectureEvaluationRequest(BaseModel):
    architecture_documented: bool = False
    training_methodology_documented: bool = False
    version_control: bool = False
    deployment_architecture_provided: bool = False
    explainability_mechanism: bool = False
    validation_strategy_defined: bool = False
    model_versioning_enabled: bool = False
    limitations_documented: bool = False
    dependency_inventory_available: bool = False


class ModelArchitectureEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    model_architecture_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
