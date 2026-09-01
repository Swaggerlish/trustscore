export function downloadReport(report, format = 'json') {
  if (!report) {
    return;
  }

  if (format === 'pdf') {
    downloadPdfReport(report);
    return;
  }

  downloadJsonReport(report);
}

export function buildReportFromAssessment(formState, result, fallback = {}) {
  const score = Math.round(result?.overall_score ?? fallback.score ?? 0);
  return {
    id: fallback.id,
    name: formState?.documentation?.systemName || fallback.name || 'Unnamed AI Vendor',
    category: formState?.risk?.aiActTier || fallback.category || 'AI Procurement Assessment',
    score,
    riskLevel: result?.risk_level || fallback.riskLevel || 'Limited risk',
    date: fallback.date || new Date().toLocaleDateString(),
    status: fallback.status || 'Completed',
    scores: {
      bias: result?.bias_score,
      datasetQuality: result?.dataset_quality_score,
      modelArchitecture: result?.model_architecture_score,
      privacy: result?.privacy_score,
      compliance: result?.compliance_score,
      transparency: result?.transparency_score,
      environmentalImpact: result?.environmental_impact_score,
      accountability: result?.accountability_score,
      performance: result?.performance_score,
      robustness: result?.robustness_score,
      ...fallback.scores
    },
    metrics: {
      demographicParityDifference: result?.demographic_parity_difference,
      disparateImpactRatio: result?.disparate_impact_ratio,
      biasEvaluationMethod: result?.bias_evaluation_method,
      datasetQualityEvaluationMethod: result?.dataset_quality_evaluation_method,
      dataQualityMetrics: result?.data_quality_metrics
    },
    recommendations: result?.recommendations || fallback.recommendations || []
  };
}

function downloadJsonReport(report) {
  const reportBlob = new Blob(
    [JSON.stringify(report, null, 2)],
    { type: 'application/json' }
  );
  triggerDownload(reportBlob, `${fileSafeName(report.name)}-procurescore-report.json`);
}

function downloadPdfReport(report) {
  const pdfBlob = new Blob(
    [createVisualPdf(report)],
    { type: 'application/pdf' }
  );
  triggerDownload(pdfBlob, `${fileSafeName(report.name)}-procurescore-report.pdf`);
}

function createVisualPdf(report) {
  const pages = [createOverviewPage(report), ...createDetailPages(report)];
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];
  const pageObjectNumbers = [];

  pages.forEach((pageContent, index) => {
    const pageObjectNumber = 5 + (index * 2);
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`stream\n${pageContent}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((page) => `${page} 0 R`).join(' ')}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    const objectNumber = index + 1;
    const body = object.startsWith('stream')
      ? `<< /Length ${byteLength(object.replace(/^stream\n|\nendstream$/g, ''))} >>\n${object}`
      : object;
    pdf += `${objectNumber} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function createOverviewPage(report) {
  const score = clampScore(report.score);
  const risk = String(report.riskLevel || 'Limited risk');
  const riskColor = risk.toLowerCase().includes('low risk') ? [0.04, 0.55, 0.34] : risk.toLowerCase().includes('high risk') ? [0.97, 0.6, 0.2] : risk.toLowerCase().includes('unacceptable') ? [0.76, 0.12, 0.16] : [0.9, 0.55, 0.06];
  const commands = [
    fill(0.97, 0.98, 0.99), rect(0, 0, 612, 792, 'f'),
    fill(0.02, 0.12, 0.27), rect(0, 650, 612, 142, 'f'),
    fill(0, 0.35, 0.75), rect(40, 738, 30, 30, 'f'),
    text('PS', 47, 748, 12, true, [1, 1, 1]),
    text('PROCURESCORE', 80, 754, 10, true, [0.45, 0.72, 1]),
    text('AI Trustworthiness Assessment', 40, 708, 25, true, [1, 1, 1]),
    text(safeText(report.name || 'Unnamed AI Vendor'), 40, 679, 14, false, [0.82, 0.87, 0.94]),
    card(40, 525, 170, 98),
    text('OVERALL TRUST SCORE', 55, 596, 8, true, [0.38, 0.44, 0.53]),
    text(String(Math.round(score)), 55, 548, 38, true, [0, 0.35, 0.75]),
    text('/ 100', 105, 552, 11, true, [0.38, 0.44, 0.53]),
    fill(0.88, 0.91, 0.95), rect(55, 535, 140, 7, 'f'),
    fill(...scoreColor(score)), rect(55, 535, 1.4 * score, 7, 'f'),
    card(225, 525, 160, 98),
    text('RISK CLASSIFICATION', 240, 596, 8, true, [0.38, 0.44, 0.53]),
    fill(...riskColor), rect(240, 548, 130, 29, 'f'),
    text(`${safeText(risk).toUpperCase()} RISK`, 252, 558, 12, true, [1, 1, 1]),
    text('Risk-aware weighted result', 240, 535, 8, false, [0.38, 0.44, 0.53]),
    card(400, 525, 172, 98),
    text('ASSESSMENT DETAILS', 415, 596, 8, true, [0.38, 0.44, 0.53]),
    text(`Date  ${safeText(report.date || new Date().toLocaleDateString())}`, 415, 574, 9, false, [0.12, 0.16, 0.22]),
    text(`Status  ${safeText(report.status || 'Completed')}`, 415, 556, 9, false, [0.12, 0.16, 0.22]),
    text(safeText(report.category || 'AI Procurement Assessment', 27), 415, 538, 8, false, [0.38, 0.44, 0.53]),
    text('TRUSTWORTHINESS SCORECARD', 40, 494, 10, true, [0.08, 0.12, 0.19])
  ];

  const scoreEntries = Object.entries(report.scores || {});
  const labels = {
    bias: 'Bias & Fairness', datasetQuality: 'Dataset Quality', modelArchitecture: 'Model Architecture',
    privacy: 'Privacy & Security', compliance: 'Compliance', transparency: 'Transparency',
    environmentalImpact: 'Environmental Impact', accountability: 'Accountability',
    performance: 'Performance', robustness: 'Robustness'
  };
  scoreEntries.slice(0, 10).forEach(([key, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    metricCard(commands, 40 + (col * 273), 421 - (row * 72), 259, 58, labels[key] || titleCase(key), value);
  });
  commands.push(...footer(1));
  return commands.join('\n');
}

function createDetailPages(report) {
  const recommendations = report.recommendations?.length
    ? report.recommendations
    : ['No open recommendations recorded. Continue routine monitoring and evidence review.'];
  const recommendationGroups = chunk(recommendations, 5);
  const usedMetrics = new Set();

  return recommendationGroups.map((group, pageIndex) => {
    const commands = [
      fill(0.97, 0.98, 0.99), rect(0, 0, 612, 792, 'f'),
      fill(0.02, 0.12, 0.27), rect(0, 712, 612, 80, 'f'),
      text('PROCURESCORE', 40, 755, 10, true, [0.45, 0.72, 1]),
      text('Evidence & Recommendations', 40, 729, 19, true, [1, 1, 1]),
      text('ASSESSMENT EVIDENCE', 40, 676, 10, true, [0.08, 0.12, 0.19])
    ];
    const evidence = getEvidenceForRecommendations(report, group, pageIndex, usedMetrics);
    evidence.forEach(([label, value], index) => {
      const x = 40 + ((index % 2) * 273);
      const y = 611 - (Math.floor(index / 2) * 77);
      commands.push(card(x, y, 259, 62), text(titleCase(label).toUpperCase(), x + 14, y + 39, 7, true, [0.38, 0.44, 0.53]), text(safeMetricValue(value), x + 14, y + 18, 10, true, [0.08, 0.12, 0.19]));
    });
    if (!evidence.length) {
      commands.push(card(40, 602, 532, 60), text('Detailed evidence metrics were not supplied for this assessment.', 55, 628, 10, false, [0.38, 0.44, 0.53]));
    }
    commands.push(text('RECOMMENDED ACTIONS', 40, 485, 10, true, [0.08, 0.12, 0.19]));
    let y = 440;
    group.forEach((item, index) => {
      const lines = wrapLine(safeText(item), 72).slice(0, 3);
      const height = 45 + ((lines.length - 1) * 12);
      commands.push(card(40, y - height + 16, 532, height), fill(0, 0.35, 0.75), rect(54, y - 3, 22, 22, 'f'), text(String((pageIndex * 5) + index + 1), 61, y + 4, 9, true, [1, 1, 1]));
      lines.forEach((line, lineIndex) => commands.push(text(line, 89, y + 5 - (lineIndex * 13), 9, lineIndex === 0, [0.12, 0.16, 0.22])));
      y -= height + 10;
    });
    commands.push(...footer(pageIndex + 2));
    return commands.join('\n');
  });
}

function getEvidenceForRecommendations(report, recommendations, pageIndex, usedMetrics = new Set()) {
  const evidenceCatalog = [
    { key: 'bias', label: 'Bias & Fairness Score', value: report.scores?.bias, terms: ['fairness', 'bias', 'demographic', 'disparate', 'subgroup', 'protected', 'equal opportunity', 'aif360'] },
    { key: 'demographicParityDifference', label: 'Demographic Parity Difference', value: report.metrics?.demographicParityDifference, terms: ['demographic parity', 'statistical parity', 'fairness'] },
    { key: 'disparateImpactRatio', label: 'Disparate Impact Ratio', value: report.metrics?.disparateImpactRatio, terms: ['disparate impact', 'four-fifths', 'selection rate'] },
    { key: 'biasEvaluationMethod', label: 'Bias Evaluation Method', value: report.metrics?.biasEvaluationMethod, terms: ['bias', 'fairness', 'demographic', 'disparate'] },
    { key: 'datasetQuality', label: 'Dataset Quality Score', value: report.scores?.datasetQuality, terms: ['dataset', 'data quality', 'records', 'lineage', 'licens', 'representative', 'sample'] },
    { key: 'datasetQualityEvaluationMethod', label: 'Dataset Quality Evaluation Method', value: report.metrics?.datasetQualityEvaluationMethod, terms: ['dataset', 'data quality', 'evidently', 'profil'] },
    { key: 'dataQualityMetrics', label: 'Data Quality Metrics', value: report.metrics?.dataQualityMetrics, terms: ['dataset', 'data quality', 'records', 'missing', 'duplicate', 'drift'] },
    { key: 'modelArchitecture', label: 'Model Architecture Score', value: report.scores?.modelArchitecture, terms: ['architecture', 'model', 'training', 'version', 'deployment', 'explainability'] },
    { key: 'privacy', label: 'Privacy & Security Score', value: report.scores?.privacy, terms: ['privacy', 'encryption', 'anonym', 'access control', 'data minim'] },
    { key: 'compliance', label: 'Compliance Score', value: report.scores?.compliance, terms: ['compliance', 'gdpr', 'hipaa', 'eu ai act', 'regulatory'] },
    { key: 'transparency', label: 'Transparency Score', value: report.scores?.transparency, terms: ['transparency', 'disclosure', 'logging', 'limitation', 'model card'] },
    { key: 'environmentalImpact', label: 'Environmental Impact Score', value: report.scores?.environmentalImpact, terms: ['environment', 'carbon', 'energy', 'emission', 'lifecycle', 'compute'] },
    { key: 'accountability', label: 'Accountability Score', value: report.scores?.accountability, terms: ['accountability', 'owner', 'oversight', 'incident', 'governance board', 'audit log'] },
    { key: 'performance', label: 'Performance Score', value: report.scores?.performance, terms: ['performance', 'latency', 'throughput', 'accuracy', 'benchmark', 'monitoring'] },
    { key: 'robustness', label: 'Robustness Score', value: report.scores?.robustness, terms: ['robustness', 'failure', 'resilien', 'stress', 'adversarial'] }
  ];
  const pageText = recommendations.join(' ').toLowerCase();
  const matchingEvidence = evidenceCatalog.filter((metric) => (
    !usedMetrics.has(metric.key)
      && metric.value !== undefined
      && metric.value !== null
      && metric.terms.some((term) => pageText.includes(term))
  ));
  const availableEvidence = evidenceCatalog.filter((metric) => (
    !usedMetrics.has(metric.key)
      && metric.value !== undefined
      && metric.value !== null
  ));
  const fallbackEvidence = availableEvidence.filter((metric) => !matchingEvidence.includes(metric));
  const remainingSlots = Math.max(0, 4 - matchingEvidence.length);
  const evidence = [...matchingEvidence, ...fallbackEvidence.slice(pageIndex * 2, pageIndex * 2 + remainingSlots)];
  const uniqueEvidence = evidence.slice(0, 4).filter(({ key }) => !usedMetrics.has(key));

  uniqueEvidence.forEach((metric) => usedMetrics.add(metric.key));

  return uniqueEvidence.map(({ label, value }) => [label, value]);
}

function metricCard(commands, x, y, width, height, label, value) {
  const score = typeof value === 'number' ? clampScore(value) : null;
  commands.push(card(x, y, width, height));
  commands.push(text(safeText(label).toUpperCase(), x + 13, y + 36, 7, true, [0.38, 0.44, 0.53]));
  commands.push(text(score === null ? 'Pending' : `${Math.round(score)}%`, x + width - 48, y + 34, 10, true, score === null ? [0.38, 0.44, 0.53] : scoreColor(score)));
  commands.push(fill(0.88, 0.91, 0.95), rect(x + 13, y + 14, width - 26, 6, 'f'));
  if (score !== null) commands.push(fill(...scoreColor(score)), rect(x + 13, y + 14, (width - 26) * score / 100, 6, 'f'));
}

function card(x, y, width, height) {
  return `${fill(1, 1, 1)}\n${stroke(0.86, 0.89, 0.93)}\n${rect(x, y, width, height, 'B')}`;
}

function footer(page) {
  return [stroke(0.86, 0.89, 0.93), '40 31 m 572 31 l S', text('ProcureScore - Evidence-based AI procurement', 40, 16, 7, false, [0.38, 0.44, 0.53]), text(`Page ${page}`, 540, 16, 7, true, [0.38, 0.44, 0.53])];
}

function text(value, x, y, size = 10, bold = false, color = [0, 0, 0]) {
  return `${fill(...color)}\nBT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdfText(safeText(value))}) Tj ET`;
}

function rect(x, y, width, height, operation = 'f') {
  return `${x} ${y} ${width} ${height} re ${operation}`;
}

function fill(r, g, b) { return `${r} ${g} ${b} rg`; }
function stroke(r, g, b) { return `${r} ${g} ${b} RG`; }

function scoreColor(score) {
  return score < 40 ? [0.76, 0.12, 0.16] : score < 60 ? [0.9, 0.55, 0.06] : [0, 0.35, 0.75];
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function safeMetricValue(value) {
  if (typeof value === 'number') return String(Math.round(value * 1000) / 1000);
  if (typeof value === 'object') return safeText(JSON.stringify(value), 38);
  return safeText(String(value), 38);
}

function safeText(value, maxLength = 120) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, maxLength);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function wrapLine(line, width) {
  if (!line) {
    return [''];
  }

  const words = line.split(/\s+/);
  const wrapped = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
}

function escapePdfText(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function byteLength(value) {
  return new Blob([value]).size;
}

function formatPercent(value) {
  return typeof value === 'number' ? `${Math.round(value)}%` : 'Pending';
}

function fileSafeName(value) {
  return (value || 'assessment')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'assessment';
}

function titleCase(value) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}
