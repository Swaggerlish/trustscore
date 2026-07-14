from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class AccountabilityEvaluationRequest(BaseModel):
    responsible_owner_defined: bool = False
    audit_logs_available: bool = False
    human_oversight_present: bool = False
    incident_response_process: bool = False
    governance_board_defined: bool = False


class AccountabilityEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    accountability_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
