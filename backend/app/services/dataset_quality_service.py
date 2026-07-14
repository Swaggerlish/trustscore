from __future__ import annotations

from dataclasses import dataclass
from io import StringIO

import pandas as pd

from app.core.scoring import classify_risk, clamp_score, score_boolean_controls
from app.schemas.dataset_quality import (
    DatasetQualityEvaluationRequest,
    DatasetQualityEvaluationResponse,
)

try:
    from evidently.metric_preset import DataQualityPreset
    from evidently.report import Report
except ImportError:  # pragma: no cover - exercised only when dependency is absent.
    DataQualityPreset = None
    Report = None


CONTROL_LABELS = {
    "documented_sources": "documented dataset sources",
    "representative_samples": "representativeness analysis across intended populations",
    "data_lineage_available": "data lineage and transformation records",
    "quality_checks_performed": "data quality checks for missingness, duplication, and drift",
    "licensing_verified": "dataset licensing and usage rights verification",
}


@dataclass(frozen=True)
class EvidentlyQualityResult:
    score: float
    metrics: dict[str, float | int | bool | str]
    recommendations: list[str]


def evaluate_dataset_quality(
    payload: DatasetQualityEvaluationRequest,
) -> DatasetQualityEvaluationResponse:
    rule_score, missing_controls = _score_rule_controls(payload)
    recommendations = [
        f"Add {control} before relying on this dataset for procurement approval."
        for control in missing_controls
    ]
    data_quality_metrics: dict[str, float | int | bool | str] = {}
    evaluation_method = "rule_based"
    dataset_quality_score = rule_score

    records = payload.records or _records_from_csv_content(payload.csv_content)

    if records:
        evidently_result = _evaluate_records_with_evidently(payload, records)
        data_quality_metrics = evidently_result.metrics
        recommendations.extend(evidently_result.recommendations)
        dataset_quality_score = clamp_score((rule_score * 0.4) + (evidently_result.score * 0.6))
        evaluation_method = (
            "hybrid_evidently_rule_based"
            if evidently_result.metrics.get("evidently_report_generated")
            else "hybrid_profile_rule_based"
        )

    return DatasetQualityEvaluationResponse(
        score=dataset_quality_score,
        risk_level=classify_risk(dataset_quality_score),
        recommendations=recommendations,
        dataset_quality_score=dataset_quality_score,
        missing_controls=missing_controls,
        evaluation_method=evaluation_method,
        data_quality_metrics=data_quality_metrics,
    )


def _score_rule_controls(payload: DatasetQualityEvaluationRequest) -> tuple[float, list[str]]:
    controls = {
        label: getattr(payload, field_name)
        for field_name, label in CONTROL_LABELS.items()
    }
    return score_boolean_controls(controls)


def _records_from_csv_content(csv_content: str | None) -> list[dict]:
    if not csv_content or not csv_content.strip():
        return []

    try:
        dataframe = pd.read_csv(StringIO(csv_content))
    except Exception:
        return []

    if dataframe.empty:
        return []

    normalized = dataframe.astype(object).where(pd.notna(dataframe), None)
    return normalized.to_dict(orient="records")


def _evaluate_records_with_evidently(
    payload: DatasetQualityEvaluationRequest,
    records: list[dict],
) -> EvidentlyQualityResult:
    current_data = pd.DataFrame(records)
    if current_data.empty:
        return EvidentlyQualityResult(
            score=0.0,
            metrics={"rows": 0, "evidently_report_generated": False},
            recommendations=["Provide dataset records so automated data quality profiling can run."],
        )

    reference_data = (
        pd.DataFrame(payload.reference_records)
        if payload.reference_records
        else None
    )
    report_generated = _run_evidently_report(current_data, reference_data)
    profile_score, metrics, recommendations = _score_dataframe_quality(current_data)
    metrics["evidently_report_generated"] = report_generated

    if not report_generated:
        recommendations.append(
            "Install the Evidently package in the backend environment to enable the full data quality report."
        )

    return EvidentlyQualityResult(
        score=profile_score,
        metrics=metrics,
        recommendations=recommendations,
    )


def _run_evidently_report(
    current_data: pd.DataFrame,
    reference_data: pd.DataFrame | None,
) -> bool:
    if Report is None or DataQualityPreset is None:
        return False

    try:
        report = Report(metrics=[DataQualityPreset()])
        report.run(reference_data=reference_data, current_data=current_data)
        report.as_dict()
    except Exception:
        return False

    return True


def _score_dataframe_quality(
    dataframe: pd.DataFrame,
) -> tuple[float, dict[str, float | int | bool | str], list[str]]:
    row_count = len(dataframe)
    column_count = len(dataframe.columns)
    total_cells = max(row_count * column_count, 1)
    missing_cells = int(dataframe.isna().sum().sum())
    duplicate_rows = int(dataframe.duplicated().sum())
    constant_columns = int(sum(dataframe[column].nunique(dropna=False) <= 1 for column in dataframe.columns))

    missing_ratio = missing_cells / total_cells
    duplicate_ratio = duplicate_rows / max(row_count, 1)
    constant_column_ratio = constant_columns / max(column_count, 1)

    score = clamp_score(
        100
        - (missing_ratio * 45)
        - (duplicate_ratio * 35)
        - (constant_column_ratio * 20)
    )
    recommendations: list[str] = []

    if missing_ratio > 0.05:
        recommendations.append(
            "Investigate missing values and define imputation or exclusion rules before model evaluation."
        )
    if duplicate_ratio > 0.02:
        recommendations.append(
            "Remove or justify duplicate records to avoid over-representing repeated observations."
        )
    if constant_columns:
        recommendations.append(
            "Review constant or near-empty columns because they add little predictive or governance value."
        )
    if row_count < 50:
        score = clamp_score(score - 10)
        recommendations.append(
            "Provide a larger sample for automated profiling; small samples may hide quality issues."
        )

    metrics: dict[str, float | int | bool | str] = {
        "rows": row_count,
        "columns": column_count,
        "missing_cells": missing_cells,
        "missing_ratio": round(missing_ratio, 4),
        "duplicate_rows": duplicate_rows,
        "duplicate_ratio": round(duplicate_ratio, 4),
        "constant_columns": constant_columns,
        "constant_column_ratio": round(constant_column_ratio, 4),
    }

    return score, metrics, recommendations
