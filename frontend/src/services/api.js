const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function buildAssessmentPayload(formState) {
  const biasData = formState.bias || {};
  const hasBiasEvidence = Boolean(
    biasData.affirmed || biasData.details?.trim() || biasData.evidenceName
  );
  const aiActTier = formState.risk?.aiActTier || '';
  const datasetQualityPayload = buildDatasetQualityPayload(formState);
  const modelArchitecturePayload = buildModelArchitecturePayload(formState);
  const privacyPayload = buildPrivacyPayload(formState);
  const transparencyPayload = buildTransparencyPayload(formState);
  const environmentalImpactPayload = buildEnvironmentalImpactPayload(formState);
  const accountabilityPayload = buildAccountabilityPayload(formState);
  const performancePayload = buildPerformancePayload(formState);
  const robustnessPayload = buildRobustnessPayload(formState);

  return {
    vendor_name: formState.documentation?.systemName || null,
    bias: {
      decisions: buildBiasDecisionRecords(biasData),
      privileged_group: biasData.privilegedGroup || 'reference',
      unprivileged_group: biasData.unprivilegedGroup || 'comparison',
      assessment_text: biasData.details || '',
      evidence_provided: Boolean(biasData.evidenceName || biasData.affirmed)
    },
    dataset_quality: datasetQualityPayload,
    model_architecture: {
      ...modelArchitecturePayload
    },
    privacy: {
      ...privacyPayload
    },
    compliance: {
      gdpr: Boolean(formState.risk?.gdprCompliant),
      eu_ai_act: Boolean(aiActTier && !aiActTier.includes('Unacceptable')),
      hipaa: false
    },
    transparency: {
      ...transparencyPayload
    },
    environmental_impact: {
      ...environmentalImpactPayload
    },
    accountability: {
      ...accountabilityPayload
    },
    performance: {
      ...performancePayload
    },
    robustness: {
      ...robustnessPayload
    },
    capturedMetrics: {
      demographicParity: hasBiasEvidence ? 'Pending structured group data' : 'Pending',
      disparateImpact: hasBiasEvidence ? 'Pending structured group data' : 'Pending',
      hipaa: 'Pending'
    }
  };
}

function hasSectionSignal(section = {}, keywords = []) {
  if (section.affirmed || section.evidenceName) {
    return true;
  }

  const details = (section.details || '').toLowerCase();
  return keywords.some((keyword) => details.includes(keyword));
}

function buildDatasetQualityPayload(formState) {
  const datasets = formState.datasets || {};
  const jsonPayload = buildStructuredControlPayload(datasets, [
    {
      field: 'documented_sources',
      aliases: ['documented_sources', 'sources_documented', 'data_sources_documented']
    },
    {
      field: 'representative_samples',
      aliases: ['representative_samples', 'sample_representative', 'representativeness']
    },
    {
      field: 'data_lineage_available',
      aliases: ['data_lineage_available', 'data_lineage', 'lineage_available']
    },
    {
      field: 'quality_checks_performed',
      aliases: ['quality_checks_performed', 'quality_checks', 'data_quality_checks']
    },
    {
      field: 'licensing_verified',
      aliases: ['licensing_verified', 'license_verified', 'licensing']
    }
  ]);
  const controls = jsonPayload || {
    documented_sources: Boolean(datasets.documentedSources)
      || hasSectionSignal(datasets, ['source', 'sourcing', 'origin']),
    representative_samples: Boolean(datasets.representativeSamples)
      || hasSectionSignal(datasets, ['representative', 'coverage', 'population', 'sample']),
    data_lineage_available: Boolean(datasets.dataLineageAvailable)
      || hasSectionSignal(datasets, ['lineage', 'provenance', 'transform']),
    quality_checks_performed: Boolean(datasets.qualityChecksPerformed)
      || hasSectionSignal(datasets, ['quality', 'missing', 'duplicate', 'drift', 'validation']),
    licensing_verified: Boolean(datasets.licensingVerified)
      || hasSectionSignal(datasets, ['license', 'licensing', 'rights', 'consent'])
  };

  return {
    ...controls,
    records: parseDatasetRecords(datasets.recordsJson || (jsonPayload ? '' : datasets.details)),
    reference_records: parseDatasetRecords(datasets.referenceRecordsJson),
    csv_content: datasets.csvContent || null
  };
}

function buildModelArchitecturePayload(formState) {
  const models = formState.models || {};
  return buildStructuredControlPayload(models, [
    {
      field: 'architecture_documented',
      aliases: ['architecture_documented', 'architecture', 'model_architecture_documented']
    },
    {
      field: 'training_methodology_documented',
      aliases: [
        'training_methodology_documented',
        'training_methodology',
        'training_documented',
        'validation_strategy_defined',
        'validation_strategy',
        'validation_defined'
      ]
    },
    {
      field: 'version_control',
      aliases: ['version_control', 'model_versioning_enabled', 'model_versioning', 'versioning_enabled']
    },
    {
      field: 'deployment_architecture_provided',
      aliases: [
        'deployment_architecture_provided',
        'deployment_architecture',
        'deployment_documented',
        'dependency_inventory_available',
        'dependency_inventory',
        'dependencies_documented'
      ]
    },
    {
      field: 'explainability_mechanism',
      aliases: [
        'explainability_mechanism',
        'explainability_mechanism_documented',
        'explainability',
        'limitations_documented',
        'limitations',
        'model_limitations_documented'
      ]
    }
  ]) || {
    architecture_documented: hasSectionSignal(models, ['architecture', 'model', 'parameter']),
    training_methodology_documented: hasSectionSignal(models, ['training', 'methodology', 'validation', 'test', 'holdout', 'evaluation']),
    version_control: hasSectionSignal(models, ['version', 'release', 'registry']),
    deployment_architecture_provided: hasSectionSignal(models, ['deployment', 'dependency', 'library', 'component', 'inventory']),
    explainability_mechanism: hasSectionSignal(models, ['explainability', 'explainable', 'limitation', 'failure', 'constraint'])
  };
}

function buildPrivacyPayload(formState) {
  const privacy = formState.privacy || {};
  const hasPrivacyEvidence = Boolean(
    privacy.affirmed || privacy.details?.trim() || privacy.evidenceName
  );

  return buildStructuredControlPayload(privacy, [
    { field: 'encryption', aliases: ['encryption', 'encrypted', 'data_encryption'] },
    { field: 'anonymization', aliases: ['anonymization', 'anonymisation', 'deidentification'] },
    { field: 'access_controls', aliases: ['access_controls', 'access_control', 'role_based_access'] },
    { field: 'data_minimization', aliases: ['data_minimization', 'data_minimisation', 'minimal_data_collection'] }
  ]) || {
    encryption: hasPrivacyEvidence,
    anonymization: Boolean(formState.risk?.optOutOptions),
    access_controls: hasPrivacyEvidence,
    data_minimization: Boolean(formState.risk?.optOutOptions)
  };
}

function buildTransparencyPayload(formState) {
  const transparency = formState.transparency || {};
  return buildStructuredControlPayload(transparency, [
    { field: 'model_card_available', aliases: ['model_card_available', 'model_card', 'factsheet_available'] },
    { field: 'explainability_documented', aliases: ['explainability_documented', 'explainability', 'explanations_documented'] },
    { field: 'decision_logging_enabled', aliases: ['decision_logging_enabled', 'decision_logging', 'audit_trail_enabled'] },
    { field: 'user_disclosures_provided', aliases: ['user_disclosures_provided', 'user_disclosures', 'user_notice'] },
    { field: 'limitations_disclosed', aliases: ['limitations_disclosed', 'limitations', 'limitations_documented'] }
  ]) || {
    model_card_available: hasSectionSignal(transparency, ['model card', 'factsheet', 'datasheet']),
    explainability_documented: hasSectionSignal(transparency, ['explain', 'interpret', 'attribution']),
    decision_logging_enabled: hasSectionSignal(transparency, ['log', 'trace', 'audit trail']),
    user_disclosures_provided: hasSectionSignal(transparency, ['disclosure', 'notice', 'user']),
    limitations_disclosed: hasSectionSignal(transparency, ['limitation', 'boundary', 'appropriate use'])
  };
}

function buildEnvironmentalImpactPayload(formState) {
  const environmental = formState.environmental || {};
  return buildStructuredControlPayload(environmental, [
    { field: 'energy_usage_tracked', aliases: ['energy_usage_tracked', 'energy_usage', 'energy_tracking'] },
    { field: 'carbon_impact_estimated', aliases: ['carbon_impact_estimated', 'carbon_impact', 'carbon_estimated'] },
    { field: 'efficient_training_practices', aliases: ['efficient_training_practices', 'efficient_training', 'training_efficiency'] },
    { field: 'resource_reporting_available', aliases: ['resource_reporting_available', 'resource_reporting', 'compute_reporting'] },
    { field: 'lifecycle_optimization_plan', aliases: ['lifecycle_optimization_plan', 'lifecycle_plan', 'optimization_plan'] }
  ]) || {
    energy_usage_tracked: hasSectionSignal(environmental, ['energy', 'electricity', 'power']),
    carbon_impact_estimated: hasSectionSignal(environmental, ['carbon', 'emission', 'co2']),
    efficient_training_practices: hasSectionSignal(environmental, ['efficient', 'optimization', 'quantization']),
    resource_reporting_available: hasSectionSignal(environmental, ['compute', 'gpu', 'resource', 'utilization']),
    lifecycle_optimization_plan: hasSectionSignal(environmental, ['lifecycle', 'retirement', 'decommission'])
  };
}

function buildAccountabilityPayload(formState) {
  const accountability = formState.accountability || {};

  const hasAccountabilityEvidence = Boolean(
    accountability.affirmed
      || accountability.details?.trim()
      || accountability.evidenceName
  );

  return buildStructuredControlPayload(accountability, [
    { field: 'responsible_owner_defined', aliases: ['responsible_owner_defined', 'responsible_owner'] },
    { field: 'audit_logs_available', aliases: ['audit_logs_available', 'audit_logs'] },
    { field: 'human_oversight_present', aliases: ['human_oversight_present', 'human_oversight'] },
    {
      field: 'incident_response_process',
      aliases: ['incident_response_process', 'incident_response_plan', 'incident_response']
    },
    { field: 'governance_board_defined', aliases: ['governance_board_defined', 'governance_board'] }
  ]) || {
    responsible_owner_defined: hasAccountabilityEvidence,
    audit_logs_available: Boolean(formState.risk?.auditName),
    human_oversight_present: hasAccountabilityEvidence,
    incident_response_process: hasAccountabilityEvidence,
    governance_board_defined: hasAccountabilityEvidence
  };
}

function buildPerformancePayload(formState) {
  const performance = formState.performance || {};
  return buildStructuredControlPayload(performance, [
    { field: 'latency_sla_defined', aliases: ['latency_sla_defined', 'latency_sla', 'latency_defined'] },
    { field: 'throughput_tested', aliases: ['throughput_tested', 'throughput', 'load_tested'] },
    { field: 'accuracy_validated', aliases: ['accuracy_validated', 'accuracy_validation', 'accuracy'] },
    { field: 'monitoring_enabled', aliases: ['monitoring_enabled', 'monitoring', 'observability_enabled'] },
    { field: 'benchmark_documented', aliases: ['benchmark_documented', 'benchmark', 'benchmarking_documented'] }
  ]) || {
    latency_sla_defined: hasSectionSignal(performance, ['latency', 'sla', 'response time']),
    throughput_tested: hasSectionSignal(performance, ['throughput', 'concurrency', 'load']),
    accuracy_validated: hasSectionSignal(performance, ['accuracy', 'f1', 'precision', 'recall']),
    monitoring_enabled: hasSectionSignal(performance, ['monitor', 'observability', 'alert']),
    benchmark_documented: hasSectionSignal(performance, ['benchmark', 'baseline', 'test result'])
  };
}

function buildRobustnessPayload(formState) {
  const robustness = formState.robustness || {};
  return buildStructuredControlPayload(robustness, [
    {
      field: 'adversarial_testing_performed',
      aliases: ['adversarial_testing_performed', 'adversarial_testing', 'misuse_testing', 'red_team_testing']
    },
    {
      field: 'drift_monitoring_enabled',
      aliases: ['drift_monitoring_enabled', 'drift_monitoring', 'model_drift_monitoring', 'data_drift_monitoring']
    },
    { field: 'fallback_controls_defined', aliases: ['fallback_controls_defined', 'fallback_controls', 'failover_controls'] },
    { field: 'stress_testing_completed', aliases: ['stress_testing_completed', 'stress_testing', 'edge_case_testing'] },
    {
      field: 'incident_playbooks_available',
      aliases: ['incident_playbooks_available', 'incident_playbooks', 'incident_response_playbooks']
    }
  ]) || {
    adversarial_testing_performed: hasSectionSignal(robustness, ['adversarial', 'misuse', 'red team']),
    drift_monitoring_enabled: hasSectionSignal(robustness, ['drift', 'shift', 'monitor']),
    fallback_controls_defined: hasSectionSignal(robustness, ['fallback', 'failover', 'degraded']),
    stress_testing_completed: hasSectionSignal(robustness, ['stress', 'edge case', 'load']),
    incident_playbooks_available: hasSectionSignal(robustness, ['incident', 'playbook', 'response'])
  };
}

function buildStructuredControlPayload(section = {}, controls = []) {
  const jsonPayload = buildJsonControlPayload(section, controls);
  if (jsonPayload) {
    return jsonPayload;
  }

  return buildTextControlPayload(section.details, controls);
}

function buildJsonControlPayload(section = {}, controls = []) {
  const parsedDetails = parseJsonObject(section.details);
  if (!parsedDetails) {
    return null;
  }

  return Object.fromEntries(
    controls.map(({ field, aliases }) => [field, readBooleanAlias(parsedDetails, aliases)])
  );
}

function buildTextControlPayload(value = '', controls = []) {
  const text = value.trim();
  if (!text) {
    return null;
  }

  const resolved = {};
  let matched = false;

  controls.forEach(({ field, aliases }) => {
    const parsedValue = readPlainTextBoolean(text, aliases);
    if (typeof parsedValue === 'boolean') {
      matched = true;
      resolved[field] = parsedValue;
      return;
    }
    resolved[field] = false;
  });

  return matched ? resolved : null;
}

function readPlainTextBoolean(value = '', aliases = []) {
  const normalizedAliases = aliases.flatMap((alias) => [
    normalizePlainText(alias),
    normalizePlainText(alias).replaceAll('_', ' '),
    normalizePlainText(alias).replaceAll(' ', '_')
  ]);
  const segments = normalizePlainText(value)
    .split(/[\n\r.;,|]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const matchedAlias = normalizedAliases.find((alias) => alias && segment.includes(alias));
    if (!matchedAlias) {
      continue;
    }

    if (hasNegativeSignal(segment)) {
      return false;
    }
    if (hasPositiveSignal(segment)) {
      return true;
    }

    return true;
  }

  return null;
}

function normalizePlainText(value = '') {
  return String(value)
    .toLowerCase()
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function hasNegativeSignal(segment = '') {
  return /\b(no|not|none|false|missing|absent|unavailable|disabled|without|lacks?|lack of|not available|not provided|not enabled|not documented|does not|doesn't)\b/.test(segment);
}

function hasPositiveSignal(segment = '') {
  return /\b(yes|true|available|enabled|provided|documented|performed|completed|defined|tracked|estimated|verified|validated|present|implemented|supports?|includes?|uses?|maintains?)\b/.test(segment);
}

function parseJsonObject(value = '') {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readBooleanAlias(source, aliases) {
  const key = aliases.find((alias) => Object.prototype.hasOwnProperty.call(source, alias));
  return key ? Boolean(source[key]) : false;
}

function parseDatasetRecords(details = '') {
  const trimmed = details.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
    }
    if (parsed && typeof parsed === 'object') {
      return [parsed];
    }
  } catch {
    return [];
  }

  return [];
}

function buildBiasDecisionRecords(biasData) {
  const parsedRecords = parseBiasDecisionRecords(biasData.decisionRecordsJson);
  if (parsedRecords.length) {
    return parsedRecords;
  }

  const privilegedGroup = biasData.privilegedGroup || 'reference';
  const unprivilegedGroup = biasData.unprivilegedGroup || 'comparison';
  const records = [
    ...repeatDecision(privilegedGroup, true, biasData.privilegedFavorable),
    ...repeatDecision(privilegedGroup, false, biasData.privilegedUnfavorable),
    ...repeatDecision(unprivilegedGroup, true, biasData.unprivilegedFavorable),
    ...repeatDecision(unprivilegedGroup, false, biasData.unprivilegedUnfavorable)
  ];

  if (records.length >= 2 && records.some((record) => record.protected_group === privilegedGroup)
    && records.some((record) => record.protected_group === unprivilegedGroup)) {
    return records;
  }

  return [];
}

function parseBiasDecisionRecords(value = '') {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .filter((item) => typeof item.protected_group === 'string' && item.protected_group.trim())
      .filter((item) => typeof item.favorable_outcome === 'boolean')
      .map((item) => ({
        protected_group: item.protected_group,
        favorable_outcome: item.favorable_outcome
      }));
  } catch {
    return [];
  }
}

function repeatDecision(protectedGroup, favorableOutcome, count) {
  const normalizedCount = Math.max(0, Number.parseInt(count || '0', 10) || 0);
  return Array.from({ length: normalizedCount }, () => ({
    protected_group: protectedGroup,
    favorable_outcome: favorableOutcome
  }));
}

export async function submitAssessment(formState) {
  const payload = buildAssessmentPayload(formState);
  const response = await fetch(`${API_BASE_URL}/assessment/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Assessment evaluation failed.');
  }

  const result = await response.json();
  return normalizeAssessmentResponse(result, payload);
}

function normalizeAssessmentResponse(result, payload) {
  const normalized = { ...result };

  normalized.bias_score = numberOrDefault(
    normalized.bias_score,
    normalized.fairness_score,
    normalized.score,
    0
  );
  normalized.dataset_quality_score = numberOrDefault(
    normalized.dataset_quality_score,
    scoreControls(payload.dataset_quality, [
      'documented_sources',
      'representative_samples',
      'data_lineage_available',
      'quality_checks_performed',
      'licensing_verified'
    ])
  );
  normalized.model_architecture_score = numberOrDefault(
    normalized.model_architecture_score,
    scoreControls(payload.model_architecture, [
      'architecture_documented',
      'training_methodology_documented',
      'version_control',
      'deployment_architecture_provided',
      'explainability_mechanism'
    ])
  );
  normalized.privacy_score = numberOrDefault(
    normalized.privacy_score,
    scoreControls(payload.privacy, [
      'encryption',
      'anonymization',
      'access_controls',
      'data_minimization'
    ])
  );
  normalized.compliance_score = numberOrDefault(
    normalized.compliance_score,
    scoreControls(payload.compliance, ['gdpr', 'eu_ai_act', 'hipaa'])
  );
  normalized.transparency_score = numberOrDefault(
    normalized.transparency_score,
    scoreControls(payload.transparency, [
      'model_card_available',
      'explainability_documented',
      'decision_logging_enabled',
      'user_disclosures_provided',
      'limitations_disclosed'
    ])
  );
  normalized.environmental_impact_score = numberOrDefault(
    normalized.environmental_impact_score,
    scoreControls(payload.environmental_impact, [
      'energy_usage_tracked',
      'carbon_impact_estimated',
      'efficient_training_practices',
      'resource_reporting_available',
      'lifecycle_optimization_plan'
    ])
  );
  normalized.accountability_score = numberOrDefault(
    normalized.accountability_score,
    scoreControls(payload.accountability, [
      'responsible_owner_defined',
      'audit_logs_available',
      'human_oversight_present',
      'incident_response_process',
      'governance_board_defined'
    ])
  );
  normalized.performance_score = numberOrDefault(
    normalized.performance_score,
    scoreControls(payload.performance, [
      'latency_sla_defined',
      'throughput_tested',
      'accuracy_validated',
      'monitoring_enabled',
      'benchmark_documented'
    ])
  );
  normalized.robustness_score = numberOrDefault(
    normalized.robustness_score,
    scoreControls(payload.robustness, [
      'adversarial_testing_performed',
      'drift_monitoring_enabled',
      'fallback_controls_defined',
      'stress_testing_completed',
      'incident_playbooks_available'
    ])
  );

  normalized.dataset_quality_evaluation_method ||= payload.dataset_quality?.records?.length || payload.dataset_quality?.csv_content
    ? 'hybrid_profile_rule_based'
    : 'rule_based';
  normalized.data_quality_metrics ||= {};
  const computedBiasMetrics = computeBiasMetrics(payload.bias);
  normalized.demographic_parity_difference = preferComputedMetric(
    normalized.demographic_parity_difference,
    computedBiasMetrics.demographicParityDifference
  );
  normalized.disparate_impact_ratio = preferComputedMetric(
    normalized.disparate_impact_ratio,
    computedBiasMetrics.disparateImpactRatio
  );
  normalized.bias_evaluation_method ||= 'rule_based';

  normalized.overall_score = computeOverallScore(normalized);
  normalized.risk_level = classifyRisk(normalized.overall_score);

  return normalized;
}

function numberOrDefault(...values) {
  const value = values.find((item) => typeof item === 'number' && Number.isFinite(item));
  return value ?? 0;
}

function scoreControls(payload = {}, fields = []) {
  if (!fields.length) {
    return 0;
  }

  const passed = fields.filter((field) => Boolean(payload?.[field])).length;
  return Math.round((passed / fields.length) * 10000) / 100;
}

function computeOverallScore(result) {
  const metricScores = {
    bias: result.bias_score,
    datasetQuality: result.dataset_quality_score,
    modelArchitecture: result.model_architecture_score,
    privacy: result.privacy_score,
    compliance: result.compliance_score,
    transparency: result.transparency_score,
    environmentalImpact: result.environmental_impact_score,
    accountability: result.accountability_score,
    performance: result.performance_score,
    robustness: result.robustness_score
  };
  const weightedScore =
    (metricScores.bias * 0.15)
    + (metricScores.datasetQuality * 0.12)
    + (metricScores.modelArchitecture * 0.10)
    + (metricScores.privacy * 0.12)
    + (metricScores.compliance * 0.12)
    + (metricScores.transparency * 0.10)
    + (metricScores.environmentalImpact * 0.07)
    + (metricScores.accountability * 0.10)
    + (metricScores.performance * 0.07)
    + (metricScores.robustness * 0.05);
  const weakestMetric = Math.min(...Object.values(metricScores));
  let penaltyAwareScore = (weightedScore * 0.70) + (weakestMetric * 0.30);

  if (weakestMetric < 25) {
    penaltyAwareScore = Math.min(penaltyAwareScore, 49);
  } else if (Math.min(metricScores.bias, metricScores.privacy, metricScores.compliance) < 40) {
    penaltyAwareScore = Math.min(penaltyAwareScore, 59);
  }

  return Math.round(Math.max(0, Math.min(100, penaltyAwareScore)) * 100) / 100;
}

function classifyRisk(score) {
  if (score >= 80) {
    return 'Low';
  }
  if (score >= 60) {
    return 'Medium';
  }
  return 'High';
}

function preferComputedMetric(responseValue, computedValue) {
  if (typeof computedValue === 'number' && computedValue > 0) {
    return computedValue;
  }
  return numberOrDefault(responseValue, computedValue, 0);
}

function computeBiasMetrics(biasPayload = {}) {
  const decisions = biasPayload.decisions || [];
  if (!decisions.length) {
    return {
      demographicParityDifference: 0,
      disparateImpactRatio: 0
    };
  }

  const groups = {};
  decisions.forEach((decision) => {
    if (!groups[decision.protected_group]) {
      groups[decision.protected_group] = { total: 0, favorable: 0 };
    }
    groups[decision.protected_group].total += 1;
    if (decision.favorable_outcome) {
      groups[decision.protected_group].favorable += 1;
    }
  });

  const groupNames = Object.keys(groups).filter((group) => groups[group].total > 0);
  if (groupNames.length < 2) {
    return {
      demographicParityDifference: 0,
      disparateImpactRatio: 0
    };
  }

  const privilegedGroup = groups[biasPayload.privileged_group]
    ? biasPayload.privileged_group
    : groupNames.slice().sort((left, right) => selectionRate(groups[right]) - selectionRate(groups[left]))[0];
  const unprivilegedGroup = groups[biasPayload.unprivileged_group]
    ? biasPayload.unprivileged_group
    : groupNames.slice().sort((left, right) => selectionRate(groups[left]) - selectionRate(groups[right]))[0];

  const privilegedRate = selectionRate(groups[privilegedGroup]);
  const unprivilegedRate = selectionRate(groups[unprivilegedGroup]);

  return {
    demographicParityDifference: roundMetric(Math.abs(unprivilegedRate - privilegedRate)),
    disparateImpactRatio: roundMetric(privilegedRate > 0 ? unprivilegedRate / privilegedRate : 0)
  };
}

function selectionRate(group) {
  return group.total > 0 ? group.favorable / group.total : 0;
}

function roundMetric(value) {
  return Math.round(value * 10000) / 10000;
}
