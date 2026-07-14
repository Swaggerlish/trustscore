from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class TransparencyEvaluationRequest(BaseModel):
    model_card_available: bool = False
    explainability_documented: bool = False
    decision_logging_enabled: bool = False
    user_disclosures_provided: bool = False
    limitations_disclosed: bool = False


class TransparencyEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    transparency_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
