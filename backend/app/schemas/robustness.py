from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class RobustnessEvaluationRequest(BaseModel):
    adversarial_testing_performed: bool = False
    drift_monitoring_enabled: bool = False
    fallback_controls_defined: bool = False
    stress_testing_completed: bool = False
    incident_playbooks_available: bool = False


class RobustnessEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    robustness_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
