from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.core.scoring import RiskLevel


class DatasetQualityEvaluationRequest(BaseModel):
    documented_sources: bool = False
    representative_samples: bool = False
    data_lineage_available: bool = False
    quality_checks_performed: bool = False
    licensing_verified: bool = False
    records: list[dict[str, Any]] = Field(default_factory=list)
    reference_records: list[dict[str, Any]] = Field(default_factory=list)
    csv_content: str | None = None


class DatasetQualityEvaluationResponse(BaseModel):
    score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    recommendations: list[str]
    dataset_quality_score: float = Field(..., ge=0, le=100)
    missing_controls: list[str]
    evaluation_method: str
    data_quality_metrics: dict[str, float | int | bool | str]
