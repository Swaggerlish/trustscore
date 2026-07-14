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
    riskLevel: result?.risk_level || fallback.riskLevel || 'Medium',
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
  triggerDownload(reportBlob, `${fileSafeName(report.name)}-trustscore-report.json`);
}

function downloadPdfReport(report) {
  const lines = buildPdfLines(report);
  const pdfBlob = new Blob(
    [createSimplePdf(lines)],
    { type: 'application/pdf' }
  );
  triggerDownload(pdfBlob, `${fileSafeName(report.name)}-trustscore-report.pdf`);
}

function buildPdfLines(report) {
  const scoreLines = Object.entries(report.scores || {}).map(([label, value]) => (
    `${titleCase(label)}: ${formatPercent(value)}`
  ));
  const metricLines = Object.entries(report.metrics || {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) => `${titleCase(label)}: ${value}`);
  const recommendationLines = (report.recommendations || []).length
    ? report.recommendations.map((item) => `- ${item}`)
    : ['No open recommendations recorded.'];

  return [
    'TrustScore Assessment Report',
    '',
    `Vendor: ${report.name || 'Unnamed AI Vendor'}`,
    `Category: ${report.category || 'AI Procurement Assessment'}`,
    `Date: ${report.date || new Date().toLocaleDateString()}`,
    `Status: ${report.status || 'Completed'}`,
    `Overall Trust Score: ${formatPercent(report.score)}`,
    `Risk Level: ${report.riskLevel || 'Medium'}`,
    '',
    'Score Breakdown',
    ...scoreLines,
    '',
    'Bias and Fairness Metrics',
    ...(metricLines.length ? metricLines : ['No detailed bias metrics available.']),
    '',
    'Recommendations',
    ...recommendationLines
  ];
}

function createSimplePdf(lines) {
  const wrappedLines = lines.flatMap((line) => wrapLine(String(line), 90));
  const pageLines = chunk(wrappedLines, 42);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  const pageObjectNumbers = [];

  pageLines.forEach((linesForPage, index) => {
    const pageObjectNumber = 4 + (index * 2);
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(createPageContent(linesForPage));
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

function createPageContent(lines) {
  const text = lines.map((line, index) => {
    const y = 742 - (index * 16);
    const fontSize = index === 0 ? 18 : 10;
    return `BT /F1 ${fontSize} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join('\n');

  return `stream\n${text}\nendstream`;
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
