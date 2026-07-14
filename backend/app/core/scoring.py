from __future__ import annotations

from enum import Enum


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


def clamp_score(score: float) -> float:
    return round(max(0.0, min(100.0, score)), 2)


def classify_risk(score: float) -> RiskLevel:
    if score >= 80:
        return RiskLevel.LOW
    if score >= 60:
        return RiskLevel.MEDIUM
    return RiskLevel.HIGH


def score_boolean_controls(controls: dict[str, bool]) -> tuple[float, list[str]]:
    total_controls = len(controls)
    passed_controls = sum(1 for enabled in controls.values() if enabled)
    score = (passed_controls / total_controls) * 100 if total_controls else 0
    missing = [name for name, enabled in controls.items() if not enabled]
    return clamp_score(score), missing
