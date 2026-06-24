from auditai.misc import compare_groups


def calculate_score(data):
    """
    Calculate a baseline trust score and run bias/fairness checks when
    `labels` and `results` are provided in the input `data`.

    Expected input keys for bias check:
    - labels: array-like of group labels (e.g. ['M','F','M',...])
    - results: array-like of numeric or boolean decisions/scores

    Returns a dict with `score` and optional `bias` summary.
    """
    score = 100
    if not data.get('risk'):
        score -= 30

    labels = data.get('labels')
    results = data.get('results')
    bias_summary = None

    if labels is not None and results is not None:
        try:
            min_props, z_ps, fisher_ps, chi_ps, bayes_facts = compare_groups(
                labels, results, num=100
            )

            # Compute minimum bias ratio across thresholds
            min_bias_ratio = None
            if min_props:
                min_bias_ratio = min(float(v) for v in min_props.values())

            # Check statistical significance across thresholds
            sig = {
                'chi2': any(float(v) < 0.05 for v in chi_ps.values()) if chi_ps else False,
                'fisher': any(float(v) < 0.05 for v in fisher_ps.values()) if fisher_ps else False,
                'z': any(float(v) < 0.05 for v in z_ps.values()) if z_ps else False,
            }

            biased = (min_bias_ratio is not None and min_bias_ratio < 0.8) or any(sig.values())
            if biased:
                # Penalize the baseline score when bias is detected
                score = max(0, score - 40)

            bias_summary = {
                'min_bias_ratio': min_bias_ratio,
                'stat_significant': sig,
                'min_props_sample': {str(k): float(v) for k, v in min_props.items()},
            }
        except Exception as e:
            bias_summary = {'error': str(e)}

    return {'score': score, 'bias': bias_summary}
