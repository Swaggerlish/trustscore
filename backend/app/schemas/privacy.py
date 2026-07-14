from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class PrivacyEvaluationRequest(BaseModel):
    encryption: bool = False
    anonymization: bool = False
    access_controls: bool = False
    data_minimization: bool = False


class PrivacyEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    privacy_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
