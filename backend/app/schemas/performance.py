from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class PerformanceEvaluationRequest(BaseModel):
    latency_sla_defined: bool = False
    throughput_tested: bool = False
    accuracy_validated: bool = False
    monitoring_enabled: bool = False
    benchmark_documented: bool = False


class PerformanceEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    performance_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
