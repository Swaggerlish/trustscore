from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class ComplianceEvaluationRequest(BaseModel):
    gdpr: bool = False
    eu_ai_act: bool = False
    hipaa: bool = False


class ComplianceEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    compliance_score: float = Field(..., ge=0, le=100)
    failed_requirements: list[str]
