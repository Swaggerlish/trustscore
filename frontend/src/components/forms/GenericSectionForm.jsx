import React, { useRef, useState } from 'react';

const SECTION_REQUIREMENTS = {
  models: {
    title: 'Model Architecture Scoring Inputs',
    items: [
      'Architecture documentation',
      'Training methodology documentation',
      'Version control evidence',
      'Deployment architecture',
      'Explainability mechanism'
    ],
    json: `{
  "architecture_documented": true,
  "training_methodology_documented": true,
  "version_control": true,
  "deployment_architecture_provided": true,
  "explainability_mechanism": true
}`
  },
  privacy: {
    title: 'Privacy & Security Scoring Inputs',
    items: [
      'Encryption controls',
      'Anonymization or de-identification',
      'Access controls',
      'Data minimization'
    ],
    json: `{
  "encryption": true,
  "anonymization": true,
  "access_controls": true,
  "data_minimization": true
}`
  },
  transparency: {
    title: 'Transparency Scoring Inputs',
    items: [
      'Model card or factsheet',
      'Explainability documentation',
      'Decision logging',
      'User disclosures',
      'Limitations disclosed'
    ],
    json: `{
  "model_card_available": true,
  "explainability_documented": true,
  "decision_logging_enabled": true,
  "user_disclosures_provided": true,
  "limitations_disclosed": true
}`
  },
  environmental: {
    title: 'Environmental Impact Scoring Inputs',
    items: [
      'Energy usage tracking',
      'Carbon impact estimate',
      'Efficient training practices',
      'Compute resource reporting',
      'Lifecycle optimization plan'
    ],
    json: `{
  "energy_usage_tracked": true,
  "carbon_impact_estimated": true,
  "efficient_training_practices": true,
  "resource_reporting_available": true,
  "lifecycle_optimization_plan": true
}`
  },
  accountability: {
    title: 'Accountability Scoring Inputs',
    items: [
      'Responsible owner',
      'Audit logs',
      'Human oversight',
      'Incident response plan',
      'Governance board'
    ],
    json: `{
  "responsible_owner": true,
  "audit_logs": true,
  "human_oversight": true,
  "incident_response_plan": true,
  "governance_board": true
}`
  },
  performance: {
    title: 'Performance Scoring Inputs',
    items: [
      'Latency SLA',
      'Throughput testing',
      'Accuracy validation',
      'Monitoring',
      'Benchmark documentation'
    ],
    json: `{
  "latency_sla_defined": true,
  "throughput_tested": true,
  "accuracy_validated": true,
  "monitoring_enabled": true,
  "benchmark_documented": true
}`
  },
  robustness: {
    title: 'Robustness Scoring Inputs',
    items: [
      'Adversarial or misuse testing',
      'Drift monitoring',
      'Fallback controls',
      'Stress testing',
      'Incident playbooks'
    ],
    json: `{
  "adversarial_testing": true,
  "drift_monitoring": true,
  "fallback_controls": true,
  "stress_testing": true,
  "incident_playbooks": true
}`
  }
};

export default function GenericSectionForm({ sectionId, sectionTitle, sectionDesc, data = {}, onChange }) {
  const [activeField, setActiveField] = useState(null);
  const fileInputRef = useRef(null);
  const requirements = SECTION_REQUIREMENTS[sectionId];

  const handleFocus = (field) => setActiveField(field);
  const handleBlur = () => setActiveField(null);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onChange('evidenceName', file ? file.name : '');
    onChange('evidenceFile', file || null);
  };

  // Derive dynamic labels based on the section
  const getTextLabel = () => {
    switch (sectionId) {
      case 'datasets':
        return 'Data Sourcing & Curation Details';
      case 'models':
        return 'Model Architecture & Core Parameters';
      case 'privacy':
        return 'Encryption & Data-at-Rest Protection Methods';
      case 'bias':
        return 'Demographic Parity & Fairness Testing Methods';
      case 'transparency':
        return 'Explainability Interface & Feature Attribution';
      case 'environmental':
        return 'Compute Resource Usage & Carbon Footprint Estimations';
      case 'accountability':
        return 'Human-in-the-loop Safeguards & Escalation Routes';
      case 'performance':
        return 'Accuracy, F1-Scores, and Hardware Benchmarks';
      case 'robustness':
        return 'Adversarial Defense & Failure-Mode Handling Procedures';
      default:
        return 'Section Details & Specifications';
    }
  };

  const getPlaceholder = () => {
    return `Provide diagnostic specifications and descriptive answers for the ${sectionTitle} parameters...`;
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg lg:p-xl shadow-sm transition-all">
      <div className="mb-xl">
        <h2 className="font-headline-md text-headline-md mb-xs text-on-surface">
          {sectionTitle}
        </h2>
        <p className="text-on-surface-variant font-body-md">
          {sectionDesc || 'Complete the evaluation guidelines to establish the trust coefficient for this quadrant.'}
        </p>
      </div>

      <form className="space-y-xl">
        {requirements && (
          <div className="rounded-lg border border-outline-variant bg-surface p-md">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary text-[22px] mt-xxs">
                checklist
              </span>
              <div className="min-w-0 flex-1 space-y-sm">
                <div>
                  <p className="font-body-md font-bold text-on-surface">
                    {requirements.title}
                  </p>
                  <p className="text-label-md text-on-surface-variant">
                    Score is based on these controls. Paste JSON when vendor answers are structured.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                  <ul className="space-y-xs text-label-md text-on-surface-variant">
                    {requirements.items.map((item) => (
                      <li key={item} className="flex items-start gap-sm">
                        <span className="material-symbols-outlined text-primary text-[16px] mt-xxs">
                          check
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <pre className="min-w-0 overflow-x-auto rounded-lg bg-surface-container p-sm font-mono text-label-sm text-on-surface">
                    {requirements.json}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Core details textarea */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'details' ? 'translateX(4px)' : 'none' }}
        >
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {getTextLabel()}
          </label>
          <textarea
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder={getPlaceholder()}
            rows={4}
            value={data.details || ''}
            onFocus={() => handleFocus('details')}
            onBlur={handleBlur}
            onChange={(e) => onChange('details', e.target.value)}
          />
        </div>

        {/* Section affirmations */}
        <div className="space-y-md">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Vendor Affirmations
          </label>
          <div className="space-y-sm">
            <label className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
                checked={data.affirmed || false}
                onChange={(e) => onChange('affirmed', e.target.checked)}
              />
              <div>
                <p className="font-body-md font-bold text-on-surface">Verified System Documentation</p>
                <p className="text-label-md text-on-surface-variant">We certify that all inputs correspond to active engineering parameters.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Supporting Docs */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-40 w-full overflow-hidden p-lg bg-surface border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.csv,.json,.xlsx"
            onChange={handleFileChange}
          />
          <span className="material-symbols-outlined text-outline group-hover:text-primary text-[32px] mb-sm">
            cloud_upload
          </span>
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Supporting Proof / Evidence</p>
          <p className="text-label-md text-on-surface-variant">Upload any diagnostics or test reports up to 15MB</p>
          {data.evidenceName && (
            <div className="mt-md max-w-full px-md py-xs bg-primary-container/20 text-primary rounded-full text-label-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span className="min-w-0 truncate" title={data.evidenceName}>
                {data.evidenceName}
              </span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
