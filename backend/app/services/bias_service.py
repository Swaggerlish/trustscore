from __future__ import annotations

from app.schemas.bias import BiasEvaluationRequest, BiasEvaluationResponse
from app.core.scoring import classify_risk, clamp_score
from app.services.fairness_service import evaluate_fairness_with_aif360


def evaluate_bias(payload: BiasEvaluationRequest) -> BiasEvaluationResponse:
    if _has_useful_aif360_data(payload):
        try:
            fairness_result = evaluate_fairness_with_aif360(payload)
        except RuntimeError:
            return _evaluate_bias_with_rules(
                payload,
                fallback_note=(
                    "AIF360 outcome data was supplied, but the AIF360 package is not installed. "
                    "The bias score is using the rule-based fallback until dependencies are installed."
                ),
            )

        return BiasEvaluationResponse(
            score=fairness_result.fairness_score,
            risk_level=fairness_result.risk_level,
            recommendations=fairness_result.recommendations,
            demographic_parity_difference=abs(
                fairness_result.statistical_parity_difference
            ),
            disparate_impact_ratio=fairness_result.disparate_impact,
            fairness_score=fairness_result.fairness_score,
            evaluation_method="aif360",
        )

    return _evaluate_bias_with_rules(payload)


def _has_useful_aif360_data(payload: BiasEvaluationRequest) -> bool:
    if not payload.decisions:
        return False

    selected_groups = {
        group
        for group in (payload.privileged_group, payload.unprivileged_group)
        if group
    }
    observed_groups = {decision.protected_group for decision in payload.decisions}
    groups_to_check = selected_groups or observed_groups

    if len(groups_to_check) < 2 or not groups_to_check.issubset(observed_groups):
        return False

    group_totals = {
        group: sum(1 for decision in payload.decisions if decision.protected_group == group)
        for group in groups_to_check
    }

    return all(total > 0 for total in group_totals.values())


def _evaluate_bias_with_rules(
    payload: BiasEvaluationRequest,
    fallback_note: str | None = None,
) -> BiasEvaluationResponse:
    text = (payload.assessment_text or "").lower()
    recommendations: list[str] = []
    score = 35.0

    if payload.assessment_text and len(payload.assessment_text.strip()) >= 80:
        score += 20
    elif payload.assessment_text and len(payload.assessment_text.strip()) >= 25:
        score += 10
    else:
        recommendations.append(
            "Provide a fuller fairness testing summary, including protected groups, test period, sample size, and measured outcomes."
        )

    if payload.evidence_provided:
        score += 15
    else:
        recommendations.append(
            "Upload the vendor fairness report or testing evidence so it can be reviewed later."
        )

    keyword_groups = [
        ("protected", "protected attribute", "demographic", "subgroup"),
        ("disparate impact", "demographic parity", "statistical parity"),
        ("equal opportunity", "equalized odds", "false positive", "true positive"),
        ("threshold", "80 percent", "four-fifths", "selection rate"),
        ("mitigation", "remediation", "monitoring", "bias audit"),
    ]
    matched_groups = sum(
        1 for keywords in keyword_groups if any(keyword in text for keyword in keywords)
    )
    score += matched_groups * 5

    negative_signals = [
        "not tested",
        "no bias test",
        "no fairness test",
        "not available",
        "unknown",
    ]
    if any(signal in text for signal in negative_signals):
        score -= 20
        recommendations.append(
            "Run formal bias testing because the supplied narrative indicates missing or unavailable fairness evidence."
        )

    if matched_groups < 3:
        recommendations.append(
            "Include concrete fairness methods such as disparate impact, demographic parity, subgroup testing, and mitigation thresholds."
        )

    recommendations.append(
        "Provide group-level favorable and unfavorable outcome counts to enable AIF360 metric calculation."
    )

    if fallback_note:
        recommendations.insert(0, fallback_note)

    fairness_metrics = _compute_group_fairness_metrics(payload)
    fairness_score = clamp_score(score)
    return BiasEvaluationResponse(
        score=fairness_score,
        risk_level=classify_risk(fairness_score),
        recommendations=recommendations,
        demographic_parity_difference=fairness_metrics["demographic_parity_difference"],
        disparate_impact_ratio=fairness_metrics["disparate_impact_ratio"],
        fairness_score=fairness_score,
        evaluation_method="rule_based",
    )


def _compute_group_fairness_metrics(payload: BiasEvaluationRequest) -> dict[str, float]:
    if not _has_useful_aif360_data(payload):
        return {
            "demographic_parity_difference": 0.0,
            "disparate_impact_ratio": 0.0,
        }

    group_counts: dict[str, int] = {}
    favorable_counts: dict[str, int] = {}
    for decision in payload.decisions:
        group_counts[decision.protected_group] = group_counts.get(decision.protected_group, 0) + 1
        favorable_counts.setdefault(decision.protected_group, 0)
        if decision.favorable_outcome:
            favorable_counts[decision.protected_group] += 1

    privileged_group = payload.privileged_group or max(
        group_counts,
        key=lambda group: favorable_counts[group] / group_counts[group],
    )
    unprivileged_group = payload.unprivileged_group or min(
        group_counts,
        key=lambda group: favorable_counts[group] / group_counts[group],
    )

    privileged_rate = favorable_counts[privileged_group] / group_counts[privileged_group]
    unprivileged_rate = favorable_counts[unprivileged_group] / group_counts[unprivileged_group]
    demographic_parity_difference = abs(unprivileged_rate - privileged_rate)
    disparate_impact_ratio = (
        unprivileged_rate / privileged_rate
        if privileged_rate > 0
        else 0.0
    )

    return {
        "demographic_parity_difference": round(demographic_parity_difference, 4),
        "disparate_impact_ratio": round(disparate_impact_ratio, 4),
    }
