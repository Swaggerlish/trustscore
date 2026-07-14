from __future__ import annotations

from dataclasses import dataclass
from math import isfinite

import pandas as pd

from app.core.scoring import RiskLevel, clamp_score
from app.schemas.bias import BiasEvaluationRequest

try:
    from aif360.datasets import BinaryLabelDataset
    from aif360.metrics import BinaryLabelDatasetMetric, ClassificationMetric
except ImportError:  # pragma: no cover - exercised only when the dependency is absent.
    BinaryLabelDataset = None
    BinaryLabelDatasetMetric = None
    ClassificationMetric = None


PROTECTED_ATTRIBUTE = "protected_attribute"
LABEL = "favorable_outcome"
PRIVILEGED_VALUE = 1.0
UNPRIVILEGED_VALUE = 0.0


@dataclass(frozen=True)
class AIF360FairnessResult:
    fairness_score: float
    risk_level: RiskLevel
    recommendations: list[str]
    statistical_parity_difference: float
    disparate_impact: float
    equal_opportunity_difference: float
    average_odds_difference: float


def evaluate_fairness_with_aif360(payload: BiasEvaluationRequest) -> AIF360FairnessResult:
    _ensure_aif360_available()
    group_rates = _selection_rates_by_group(payload)
    privileged_group = _resolve_privileged_group(payload, group_rates)
    unprivileged_group = _resolve_unprivileged_group(payload, group_rates)
    dataset = _build_binary_label_dataset(
        payload=payload,
        privileged_group=privileged_group,
        unprivileged_group=unprivileged_group,
    )
    privileged_groups = [{PROTECTED_ATTRIBUTE: PRIVILEGED_VALUE}]
    unprivileged_groups = [{PROTECTED_ATTRIBUTE: UNPRIVILEGED_VALUE}]

    dataset_metric = BinaryLabelDatasetMetric(
        dataset,
        unprivileged_groups=unprivileged_groups,
        privileged_groups=privileged_groups,
    )

    # Statistical Parity Difference is the unprivileged group's favorable
    # outcome rate minus the privileged group's favorable outcome rate.
    # A value near 0 means the groups receive favorable outcomes at similar rates.
    statistical_parity_difference = _safe_metric(
        dataset_metric.statistical_parity_difference()
    )

    # Disparate Impact is the unprivileged favorable outcome rate divided by
    # the privileged favorable outcome rate. The common 80 percent rule treats
    # values below 0.80 as potential adverse impact.
    disparate_impact = _safe_metric(dataset_metric.disparate_impact())

    # The current API has one observed decision field, not separate ground-truth
    # and prediction fields. To preserve endpoints, we compare the observed
    # decisions against themselves, while still using AIF360 ClassificationMetric.
    classified_dataset = dataset.copy(deepcopy=True)
    classification_metric = ClassificationMetric(
        dataset,
        classified_dataset,
        unprivileged_groups=unprivileged_groups,
        privileged_groups=privileged_groups,
    )

    # Equal Opportunity Difference compares true positive rates between
    # unprivileged and privileged groups. Values near 0 indicate similar
    # opportunity among records with favorable ground-truth labels.
    equal_opportunity_difference = _safe_metric(
        classification_metric.equal_opportunity_difference()
    )

    # Average Odds Difference averages the group gaps in false positive rate and
    # true positive rate. Values near 0 indicate similar error behavior.
    average_odds_difference = _safe_metric(
        classification_metric.average_odds_difference()
    )

    fairness_score = _score_fairness(
        statistical_parity_difference=statistical_parity_difference,
        disparate_impact=disparate_impact,
        equal_opportunity_difference=equal_opportunity_difference,
        average_odds_difference=average_odds_difference,
    )
    risk_level = _classify_fairness_risk(
        statistical_parity_difference=statistical_parity_difference,
        disparate_impact=disparate_impact,
    )

    return AIF360FairnessResult(
        fairness_score=fairness_score,
        risk_level=risk_level,
        recommendations=_recommendations(
            statistical_parity_difference=statistical_parity_difference,
            disparate_impact=disparate_impact,
            equal_opportunity_difference=equal_opportunity_difference,
            average_odds_difference=average_odds_difference,
        ),
        statistical_parity_difference=round(statistical_parity_difference, 4),
        disparate_impact=round(disparate_impact, 4),
        equal_opportunity_difference=round(equal_opportunity_difference, 4),
        average_odds_difference=round(average_odds_difference, 4),
    )


def _ensure_aif360_available() -> None:
    if BinaryLabelDataset is None:
        raise RuntimeError(
            "AIF360 is required for bias evaluation. Install it with `pip install aif360`."
        )


def _build_binary_label_dataset(
    payload: BiasEvaluationRequest,
    privileged_group: str,
    unprivileged_group: str,
) -> BinaryLabelDataset:
    rows = []

    for decision in payload.decisions:
        if decision.protected_group not in {privileged_group, unprivileged_group}:
            continue

        rows.append(
            {
                PROTECTED_ATTRIBUTE: (
                    PRIVILEGED_VALUE
                    if decision.protected_group == privileged_group
                    else UNPRIVILEGED_VALUE
                ),
                LABEL: 1.0 if decision.favorable_outcome else 0.0,
            }
        )

    if not rows:
        raise ValueError("Bias evaluation requires records for the selected protected groups.")

    protected_values = {row[PROTECTED_ATTRIBUTE] for row in rows}
    if protected_values != {PRIVILEGED_VALUE, UNPRIVILEGED_VALUE}:
        raise ValueError("Bias evaluation requires both privileged and unprivileged groups.")

    dataframe = pd.DataFrame(rows)
    return BinaryLabelDataset(
        df=dataframe,
        label_names=[LABEL],
        protected_attribute_names=[PROTECTED_ATTRIBUTE],
        favorable_label=1.0,
        unfavorable_label=0.0,
    )


def _selection_rates_by_group(payload: BiasEvaluationRequest) -> dict[str, float]:
    counts: dict[str, int] = {}
    favorable_counts: dict[str, int] = {}

    for decision in payload.decisions:
        counts[decision.protected_group] = counts.get(decision.protected_group, 0) + 1
        favorable_counts.setdefault(decision.protected_group, 0)
        if decision.favorable_outcome:
            favorable_counts[decision.protected_group] += 1

    if len(counts) < 2:
        raise ValueError("Bias evaluation requires at least two protected groups.")

    return {
        group: favorable_counts[group] / total
        for group, total in counts.items()
    }


def _resolve_privileged_group(
    payload: BiasEvaluationRequest,
    group_rates: dict[str, float],
) -> str:
    if payload.privileged_group:
        if payload.privileged_group not in group_rates:
            raise KeyError(payload.privileged_group)
        return payload.privileged_group
    return max(group_rates, key=group_rates.get)


def _resolve_unprivileged_group(
    payload: BiasEvaluationRequest,
    group_rates: dict[str, float],
) -> str:
    if payload.unprivileged_group:
        if payload.unprivileged_group not in group_rates:
            raise KeyError(payload.unprivileged_group)
        return payload.unprivileged_group
    return min(group_rates, key=group_rates.get)


def _safe_metric(value: float) -> float:
    if value is None or not isfinite(float(value)):
        return 0.0
    return float(value)


def _score_fairness(
    statistical_parity_difference: float,
    disparate_impact: float,
    equal_opportunity_difference: float,
    average_odds_difference: float,
) -> float:
    disparate_impact_penalty = (
        0.0
        if disparate_impact >= 0.8
        else ((0.8 - max(disparate_impact, 0.0)) / 0.8) * 40
    )
    statistical_parity_penalty = min(abs(statistical_parity_difference), 1.0) * 30
    equal_opportunity_penalty = min(abs(equal_opportunity_difference), 1.0) * 15
    average_odds_penalty = min(abs(average_odds_difference), 1.0) * 15

    return clamp_score(
        100
        - disparate_impact_penalty
        - statistical_parity_penalty
        - equal_opportunity_penalty
        - average_odds_penalty
    )


def _classify_fairness_risk(
    statistical_parity_difference: float,
    disparate_impact: float,
) -> RiskLevel:
    if disparate_impact >= 0.8 and abs(statistical_parity_difference) <= 0.1:
        return RiskLevel.LOW
    if disparate_impact >= 0.6:
        return RiskLevel.MEDIUM
    return RiskLevel.HIGH


def _recommendations(
    statistical_parity_difference: float,
    disparate_impact: float,
    equal_opportunity_difference: float,
    average_odds_difference: float,
) -> list[str]:
    recommendations: list[str] = []

    if disparate_impact < 0.8:
        recommendations.append(
            "Investigate adverse impact because the AIF360 disparate impact ratio is below the 80 percent threshold."
        )
    if abs(statistical_parity_difference) > 0.1:
        recommendations.append(
            "Reduce statistical parity differences through subgroup testing, representative data review, and threshold analysis."
        )
    if abs(equal_opportunity_difference) > 0.1:
        recommendations.append(
            "Review true positive rate gaps between protected groups to improve equal opportunity."
        )
    if abs(average_odds_difference) > 0.1:
        recommendations.append(
            "Review group-level error-rate differences to reduce average odds disparity."
        )

    return recommendations
