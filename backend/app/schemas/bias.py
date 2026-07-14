from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class BiasDecisionRecord(BaseModel):
    protected_group: str = Field(..., min_length=1)
    favorable_outcome: bool


class BiasEvaluationRequest(BaseModel):
    decisions: list[BiasDecisionRecord] = Field(default_factory=list)
    privileged_group: str | None = None
    unprivileged_group: str | None = None
    assessment_text: str | None = None
    evidence_provided: bool = False


class BiasEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    demographic_parity_difference: float
    disparate_impact_ratio: float
    fairness_score: float = Field(..., ge=0, le=100)
    evaluation_method: str = "rule_based"
