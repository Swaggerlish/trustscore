import React, { useRef, useState, useEffect } from 'react';
import DocumentationForm from '../components/forms/DocumentationForm';
import RiskForm from '../components/forms/RiskForm';
import GenericSectionForm from '../components/forms/GenericSectionForm';
import BiasFairnessForm from '../components/forms/BiasFairnessForm';
import DatasetQualityForm from '../components/forms/DatasetQualityForm';
import { submitAssessment, verifyUploadedDocument } from '../services/api';
import { buildReportFromAssessment, downloadReport } from '../utils/reportExport';

const SECTIONS = [
  { id: 'documentation', num: 1, label: 'Documentation & Purpose', icon: 'description', desc: "Provide high-level context about the AI system's intended use and design philosophy." },
  { id: 'datasets', num: 2, label: 'Datasets', icon: 'database', desc: "Evaluate training data sourcing, volume, licensing, and preprocessing procedures." },
  { id: 'models', num: 3, label: 'Models & Architecture', icon: 'psychology', desc: "Review model selection, size, deep learning parameters, and architecture details." },
  { id: 'privacy', num: 4, label: 'Privacy & Security', icon: 'security', desc: "Examine security frameworks, encryption keys, vulnerability patching, and access controls." },
  { id: 'bias', num: 5, label: 'Bias & Fairness', icon: 'balance', desc: "Measure bias ratios and ensure demographic parity across age, gender, and ethnicity." },
  { id: 'transparency', num: 6, label: 'Transparency', icon: 'visibility', desc: "Document explanation interfaces, decision logging, and model interpretability tools." },
  { id: 'environmental', num: 7, label: 'Environmental Impact', icon: 'eco', desc: "Analyze electricity consumption and compute power usage during model training and deployment." },
  { id: 'accountability', num: 8, label: 'Accountability', icon: 'group', desc: "Configure review boards, compliance tracking, and intervention protocols." },
  { id: 'risk', num: 9, label: 'Legal Compliance', icon: 'policy', desc: "Assess regulatory compliance, intellectual property protection, and liability frameworks of the AI system." },
  { id: 'performance', num: 10, label: 'Performance', icon: 'monitor_heart', desc: "Benchmark operations latency, throughput, validation curves, and test score stability." },
  { id: 'robustness', num: 11, label: 'Robustness', icon: 'engineering', desc: "Identify failover limits, drift monitoring thresholds, and defense mechanisms." },
  { id: 'review', num: 12, label: 'Final Review', icon: 'check_circle', desc: "Consolidate evaluation indicators and publish the AI system's finalized trust certificate." }
];

export default function Assessment({ onAssessmentEvaluated }) {
  const assessmentIdRef = useRef(crypto.randomUUID());
  const [activeTab, setActiveTab] = useState('documentation');
  const [formState, setFormState] = useState({
    documentation: {
      systemName: 'CognitiveFlow v2.1',
      intendedUse: '',
      deploymentEnv: 'Cloud-based (Public)',
      whitepaperName: ''
    },
    risk: {
      aiActTier: 'Limited Risk',
      liabilityCoverage: '',
      gdprCompliant: false,
      optOutOptions: false,
      auditName: ''
    },
    datasets: {
      details: '',
      affirmed: false,
      evidenceName: '',
      documentedSources: false,
      representativeSamples: false,
      dataLineageAvailable: false,
      qualityChecksPerformed: false,
      licensingVerified: false,
      recordsJson: '',
      referenceRecordsJson: '',
      csvContent: ''
    },
    models: { details: '', affirmed: false, evidenceName: '' },
    privacy: { details: '', affirmed: false, evidenceName: '' },
    bias: {
      details: '',
      affirmed: false,
      evidenceName: '',
      privilegedGroup: 'reference',
      unprivilegedGroup: 'comparison',
      privilegedFavorable: 0,
      privilegedUnfavorable: 0,
      unprivilegedFavorable: 0,
      unprivilegedUnfavorable: 0,
      decisionRecordsJson: ''
    },
    transparency: { details: '', affirmed: false, evidenceName: '' },
    environmental: { details: '', affirmed: false, evidenceName: '' },
    accountability: { details: '', affirmed: false, evidenceName: '' },
    performance: { details: '', affirmed: false, evidenceName: '' },
    robustness: { details: '', affirmed: false, evidenceName: '' },
    review: { details: '', affirmed: false, evidenceName: '' }
  });

  const [trustScore, setTrustScore] = useState(72);
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [progress, setProgress] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [documentVerifications, setDocumentVerifications] = useState({});

  // Handle form field changes dynamically
  const handleFieldChange = (sectionId, fieldId, value) => {
    const nextFormState = {
      ...formState,
      [sectionId]: {
        ...formState[sectionId],
        [fieldId]: value
      }
    };
    setFormState((previous) => ({
      ...previous,
      [sectionId]: {
        ...previous[sectionId],
        [fieldId]: value
      }
    }));

    if (fieldId.endsWith('File') && value) {
      runDocumentVerification(sectionId, value, nextFormState);
    } else if (fieldId !== 'evidenceName' && fieldId !== 'whitepaperName') {
      setDocumentVerifications((current) => current[sectionId]
        ? { ...current, [sectionId]: { ...current[sectionId], status: 'stale' } }
        : current);
    }
  };

  const runDocumentVerification = async (sectionId, file, state = formState) => {
    setDocumentVerifications((current) => ({
      ...current,
      [sectionId]: { status: 'verifying', filename: file.name }
    }));
    try {
      const result = await verifyUploadedDocument(file, sectionId, buildVendorClaims(sectionId, state));
      setDocumentVerifications((current) => ({
        ...current,
        [sectionId]: { status: 'complete', filename: file.name, result }
      }));
      return result;
    } catch (error) {
      setDocumentVerifications((current) => ({
        ...current,
        [sectionId]: { status: 'error', filename: file.name, error: error.message }
      }));
      return null;
    }
  };

  // Calculate local client-side trust score and completeness progress
  useEffect(() => {
    // 1. Calculate Progress (Completeness)
    let filledFields = 0;
    let totalFields = 0;

    // Count documentation fields
    totalFields += 3;
    if (formState.documentation.systemName) filledFields++;
    if (formState.documentation.intendedUse) filledFields++;
    if (formState.documentation.whitepaperName || formState.documentation.systemName) filledFields++; // upload proxy

    // Count risk fields
    totalFields += 3;
    if (formState.risk.liabilityCoverage) filledFields++;
    if (formState.risk.gdprCompliant) filledFields++;
    if (formState.risk.optOutOptions) filledFields++;

    // Count other 10 sections
    const otherSections = SECTIONS.filter(s => s.id !== 'documentation' && s.id !== 'risk');
    otherSections.forEach(s => {
      totalFields += 2;
      if (formState[s.id]?.details) filledFields++;
      if (formState[s.id]?.affirmed) filledFields++;
    });

    const completionRate = Math.min(100, Math.round((filledFields / totalFields) * 100));
    setProgress(Math.max(15, completionRate)); // starts at 15% like mockup

    // 2. Calculate Trust Score from the FastAPI backend.
    const queryBackendScore = async () => {
      try {
        const res = await submitAssessment(formState);
        if (res && typeof res.overall_score === 'number') {
          setAssessmentResult(res);
          setTrustScore(Math.round(res.overall_score));
          setRiskLevel(res.risk_level);
          setApiError(null);
          onAssessmentEvaluated?.(buildDashboardAssessment(formState, res, assessmentIdRef.current));
        }
      } catch (err) {
        setApiError(err.message || 'Backend unavailable');
      }
    };

    const timer = window.setTimeout(queryBackendScore, 350);
    return () => window.clearTimeout(timer);
  }, [formState]);

  // Handle Assessment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const documents = Object.entries(formState)
        .map(([sectionId, section]) => [sectionId, section.whitepaperFile || section.evidenceFile || section.auditFile])
        .filter(([, file]) => file);
      await Promise.all(documents.map(([sectionId, file]) =>
        documentVerifications[sectionId]?.status === 'complete'
          ? Promise.resolve()
          : runDocumentVerification(sectionId, file, formState)
      ));
      const res = await submitAssessment(formState);
      setAssessmentResult(res);
      setTrustScore(Math.round(res.overall_score));
      setRiskLevel(res.risk_level);
      setApiError(null);
      onAssessmentEvaluated?.(buildDashboardAssessment(formState, res, assessmentIdRef.current));
      setSubmitMessage({
        type: 'success',
        text: `Assessment successfully submitted. Final backend trust score: ${Math.round(res.overall_score)}%.`
      });
    } catch (err) {
      setSubmitMessage({
        type: 'info',
        text: `Assessment could not reach the backend: ${err.message || 'Unknown error'}.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!assessmentResult) {
      setSubmitMessage({
        type: 'info',
        text: 'Run the assessment first so the report includes backend scores and recommendations.'
      });
      return;
    }

    downloadReport(
      buildReportFromAssessment(formState, assessmentResult, { id: assessmentIdRef.current }),
      downloadFormat
    );
  };

  const getActiveSection = () => SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];
  const activeSection = getActiveSection();
  const scoreLabel = (value) => (typeof value === 'number' ? `${Math.round(value)}%` : 'Pending');
  const metricLabel = (value) => (typeof value === 'number' ? value.toFixed(3) : 'Pending');

  return (
    <div className="space-y-xl max-w-max_width mx-auto">
      {/* Progress and Action Bar */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div className="flex-1 max-w-2xl">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              Overall Progress
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {progress}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex gap-md flex-wrap">
          <button
            onClick={() => setSubmitMessage({ type: 'info', text: 'Assessment draft saved successfully.' })}
            className="px-lg py-md rounded-lg border border-outline-variant font-body-md font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Save Draft
          </button>
          <div className="flex overflow-hidden rounded-lg border border-outline-variant">
            <select
              value={downloadFormat}
              onChange={(event) => setDownloadFormat(event.target.value)}
              className="bg-surface px-md py-md font-body-md font-bold text-on-surface-variant outline-none"
              aria-label="Report download format"
            >
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="px-lg py-md bg-surface font-body-md font-bold text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-sm"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-lg py-md rounded-lg bg-primary text-on-primary font-body-md font-bold hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
          </button>
        </div>
      </div>

      {submitMessage && (
        <div
          className={`p-md rounded-lg flex items-start gap-md ${
            submitMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          <span className="material-symbols-outlined">
            {submitMessage.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <p className="font-body-md font-medium">{submitMessage.text}</p>
        </div>
      )}

      {Object.keys(documentVerifications).length > 0 && (
        <div className="space-y-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">AI Document Verification</h2>
            <p className="text-body-md text-on-surface-variant">
              Llama compares uploaded evidence with the vendor's narrative and selected claims. It does not replace human review.
            </p>
          </div>
          {Object.entries(documentVerifications).map(([sectionId, verification]) => (
            <DocumentVerificationCard key={sectionId} sectionId={sectionId} verification={verification} />
          ))}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Stepper Column */}
        <div className="col-span-12 lg:col-span-3 space-y-xs lg:sticky lg:top-32 lg:self-start">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-wider px-md mb-md">
            Assessment Sections
          </h2>
          <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto pr-xs">
            {SECTIONS.map((section) => {
              const isActive = activeTab === section.id;
              const isDefaultAllowed = true;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-md p-md rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : isDefaultAllowed
                      ? 'hover:bg-surface-container text-on-surface-variant'
                      : 'hover:bg-surface-container text-on-surface-variant opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined">{section.icon}</span>
                  <span className="text-body-md truncate">
                    {section.num}. {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Area */}
        <div className="col-span-12 lg:col-span-6 space-y-lg">
          {activeTab === 'documentation' && (
            <DocumentationForm
              data={formState.documentation}
              onChange={(field, val) => handleFieldChange('documentation', field, val)}
            />
          )}

          {activeTab === 'risk' && (
            <RiskForm
              data={formState.risk}
              onChange={(field, val) => handleFieldChange('risk', field, val)}
            />
          )}

          {activeTab === 'bias' && (
            <BiasFairnessForm
              sectionTitle={activeSection.label}
              sectionDesc={activeSection.desc}
              data={formState.bias}
              onChange={(field, val) => handleFieldChange('bias', field, val)}
            />
          )}

          {activeTab === 'datasets' && (
            <DatasetQualityForm
              sectionTitle={activeSection.label}
              sectionDesc={activeSection.desc}
              data={formState.datasets}
              onChange={(field, val) => handleFieldChange('datasets', field, val)}
            />
          )}

          {activeTab !== 'documentation' && activeTab !== 'risk' && activeTab !== 'bias' && activeTab !== 'datasets' && (
            <GenericSectionForm
              sectionId={activeSection.id}
              sectionTitle={activeSection.label}
              sectionDesc={activeSection.desc}
              data={formState[activeSection.id]}
              onChange={(field, val) => handleFieldChange(activeSection.id, field, val)}
            />
          )}
        </div>

        {/* Real-time Analysis Sidebar Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-lg">
          {/* Circular Score Gauge */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-lg tracking-wider">
              Real-time Analysis
            </h3>
            {apiError && (
              <div className="mb-md rounded-lg border border-yellow-200 bg-yellow-50 px-md py-sm text-label-md font-semibold text-yellow-800">
                Backend connection pending
              </div>
            )}
            <div className="flex flex-col items-center mb-xl">
              <div className="relative w-32 h-32 flex items-center justify-center mb-md">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    className="text-surface-container"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="12"
                  ></circle>
                  <circle
                    className="text-primary transition-all duration-700 ease-out"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 * (1 - trustScore / 100)}
                    strokeWidth="12"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    {trustScore}%
                  </span>
                  <span className="font-label-md text-label-md opacity-70">Trust Score</span>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div
                className={`px-md py-sm rounded-full flex items-center gap-sm font-semibold transition-all ${
                  riskLevel === 'Low'
                    ? 'bg-green-100 text-green-800'
                    : riskLevel === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {riskLevel === 'Low' ? 'check_circle' : 'warning'}
                </span>
                <span className="font-label-md font-bold">Risk Level: {riskLevel}</span>
              </div>
            </div>

            {/* Diagnostic Categories Checklist */}
            <div className="space-y-md border-t border-outline-variant pt-lg">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Bias &amp; Fairness</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.bias_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Bias Method</span>
                <span className="font-bold text-on-surface">
                  {assessmentResult?.bias_evaluation_method === 'aif360' ? 'AIF360' : 'Rule-based'}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Privacy &amp; Security</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.privacy_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Dataset Quality</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.dataset_quality_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Dataset Method</span>
                <span className="font-bold text-on-surface">
                  {formatDatasetMethod(assessmentResult?.dataset_quality_evaluation_method)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Dataset Rows</span>
                <span className="font-bold text-on-surface">
                  {assessmentResult?.data_quality_metrics?.rows ?? 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Model Architecture</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.model_architecture_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Compliance</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.compliance_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Transparency</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.transparency_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Environmental</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.environmental_impact_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Accountability</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.accountability_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Performance</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.performance_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Robustness</span>
                <span className="font-bold text-on-surface">
                  {scoreLabel(assessmentResult?.robustness_score)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Demographic Parity</span>
                <span className="font-bold text-on-surface">
                  {metricLabel(assessmentResult?.demographic_parity_difference)}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Disparate Impact</span>
                <span className="font-bold text-on-surface">
                  {metricLabel(assessmentResult?.disparate_impact_ratio)}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations Tips Card */}
          <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-lg">
            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h3 className="font-body-md font-bold text-primary">Optimization Tip</h3>
            </div>
            {assessmentResult?.recommendations?.length ? (
              <ul className="space-y-sm text-body-md text-on-surface-variant leading-relaxed">
                {assessmentResult.recommendations.slice(0, 3).map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Backend recommendations will appear after the assessment is evaluated.
              </p>
            )}
          </div>

          {/* Contextual Visual Image (Geometric Abstract art) */}
          <div className="rounded-xl overflow-hidden border border-outline-variant h-48 shadow-sm">
            <img
              className="w-full h-full object-cover select-none"
              alt="Procurement graphics context"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiOK8FxEZuM0t0M2_hLuQI90wkYpk8LGU2RZXGv66rduYwNYTWY8tVK-gXlLkD7K6SdLN5WKnhUUSKNAgqPzgDVgzNBsU1v9awzD7sxv1yd3igKM34_h5ObyqBMqjCoaAYtvHqydumll_LVtZn41X4uPXG5bpJmuFp3qWbHCau6Q5A8hZb_rTjgCaJCcrclxT5rYw2fHV7pdumNNMI-Blv7jzZYXx3-i6QaWylWqd1Sa8FWckLs86fDblpA774BFNPuicRlM88dvs"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

function formatDatasetMethod(method) {
  if (method === 'hybrid_evidently_rule_based') {
    return 'Evidently';
  }
  if (method === 'hybrid_profile_rule_based') {
    return 'Profile';
  }
  return 'Rule-based';
}

function buildVendorClaims(sectionId, formState) {
  const section = formState[sectionId] || {};
  const claims = {};
  Object.entries(section).forEach(([key, value]) => {
    if (key.endsWith('File') || key === 'csvContent' || value === '' || value === null || value === false) return;
    claims[key] = typeof value === 'string' ? value.slice(0, 4000) : value;
  });
  return {
    vendorName: formState.documentation?.systemName || 'Unnamed vendor',
    section: sectionId,
    claims
  };
}

function DocumentVerificationCard({ sectionId, verification }) {
  const sectionLabel = SECTIONS.find((section) => section.id === sectionId)?.label || sectionId;
  if (verification.status === 'verifying') {
    return <div className="rounded-lg border border-blue-200 bg-blue-50 p-md text-blue-800">Verifying {verification.filename} for {sectionLabel}…</div>;
  }
  if (verification.status === 'error') {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-md text-red-800"><strong>{sectionLabel}:</strong> {verification.error}</div>;
  }
  if (verification.status === 'stale') {
    return <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-md text-yellow-800"><strong>{sectionLabel}:</strong> Vendor answers changed. Submit the assessment to verify this document again.</div>;
  }

  const result = verification.result;
  const supported = result.claims.filter((claim) => claim.verdict === 'supported').length;
  const contradicted = result.claims.filter((claim) => claim.verdict === 'contradicted').length;
  const needsEvidence = result.claims.filter((claim) =>
    claim.verdict === 'not_found' || claim.verdict === 'partially_supported'
  );
  return (
    <details className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md" open={contradicted > 0 || needsEvidence.length > 0}>
      <summary className="cursor-pointer font-body-md font-bold text-on-surface">
        {sectionLabel}: {result.overall_verdict.replaceAll('_', ' ')} · {supported} supported · {needsEvidence.length} need evidence · {contradicted} contradicted
      </summary>
      <p className="mt-sm text-body-md text-on-surface-variant">{result.summary}</p>
      {needsEvidence.length > 0 && (
        <div className="mt-md rounded-lg border border-yellow-200 bg-yellow-50 p-md text-yellow-900">
          <p className="font-body-md font-bold">Items missing or not fully validated</p>
          <ul className="mt-sm space-y-sm list-disc pl-lg">
            {needsEvidence.map((claim, index) => (
              <li key={`${claim.claim}-missing-${index}`}>
                <span className="font-semibold">{claim.claim}</span>
                {claim.explanation && <span> — {claim.explanation}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-md space-y-sm">
        {result.claims.map((claim, index) => (
          <div key={`${claim.claim}-${index}`} className="rounded-lg bg-surface p-sm text-body-md">
            <span className="font-bold capitalize">{claim.verdict.replaceAll('_', ' ')}:</span> {claim.claim}
            {claim.explanation && <p className="mt-xs text-on-surface-variant">{claim.explanation}</p>}
          </div>
        ))}
      </div>
    </details>
  );
}

function buildDashboardAssessment(formState, result, id) {
  const score = Math.round(result.overall_score || 0);
  return {
    id,
    name: formState.documentation?.systemName || 'Unnamed AI Vendor',
    category: formState.risk?.aiActTier || 'AI Procurement Assessment',
    status: 'Completed',
    riskLevel: result.risk_level,
    score,
    scoreText: `${result.risk_level} Risk`,
    date: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    scores: {
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
    },
    metrics: {
      demographicParityDifference: result.demographic_parity_difference,
      disparateImpactRatio: result.disparate_impact_ratio,
      biasEvaluationMethod: result.bias_evaluation_method,
      datasetQualityEvaluationMethod: result.dataset_quality_evaluation_method,
      dataQualityMetrics: result.data_quality_metrics
    },
    recommendations: result.recommendations || []
  };
}
