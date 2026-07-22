import React, { useRef, useState } from 'react';

export default function RiskForm({ data = {}, onChange }) {
  const [activeField, setActiveField] = useState(null);
  const fileInputRef = useRef(null);

  const handleFocus = (field) => setActiveField(field);
  const handleBlur = () => setActiveField(null);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onChange('auditName', file ? file.name : '');
    onChange('auditFile', file || null);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg lg:p-xl shadow-sm transition-all">
      <div className="mb-xl">
        <h2 className="font-headline-md text-headline-md mb-xs text-on-surface">
          Legal Compliance &amp; Risk Assessment
        </h2>
        <p className="text-on-surface-variant font-body-md">
          Assess regulatory compliance, intellectual property protection, and liability frameworks of the AI system.
        </p>
      </div>

      <form className="space-y-xl">
        <div className="rounded-lg border border-outline-variant bg-surface p-md">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-primary text-[22px] mt-xxs">
              checklist
            </span>
            <div className="space-y-sm">
              <p className="font-body-md font-bold text-on-surface">
                Compliance Scoring Inputs
              </p>
              <p className="text-label-md text-on-surface-variant">
                Compliance score uses GDPR/CCPA status, EU AI Act classification, and HIPAA status where applicable.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-surface-container p-sm font-mono text-label-sm text-on-surface">
{`{
  "gdpr": true,
  "eu_ai_act": true,
  "hipaa": false
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* EU AI Act Risk Tier */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'aiActTier' ? 'translateX(4px)' : 'none' }}
        >
          <div className="flex items-center gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              EU AI Act Classification
            </label>
            <span
              className="material-symbols-outlined text-outline text-[16px] cursor-help"
              title="Select the regulatory compliance tier based on the EU Artificial Intelligence Act framework."
            >
              info
            </span>
          </div>
          <div className="relative">
            <select
              className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer text-on-surface text-body-md"
              value={data.aiActTier || 'Limited Risk'}
              onFocus={() => handleFocus('aiActTier')}
              onBlur={handleBlur}
              onChange={(e) => onChange('aiActTier', e.target.value)}
            >
              <option>Minimal / No Risk (e.g. spam filters)</option>
              <option>Limited Risk (e.g. chatbots, generative models)</option>
              <option>High Risk (e.g. recruiting, credit scoring, biometrics)</option>
              <option>Unacceptable / Prohibited (e.g. social scoring)</option>
            </select>
            <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Liability Coverage */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'liabilityCoverage' ? 'translateX(4px)' : 'none' }}
        >
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Indemnity &amp; Liability Clauses
          </label>
          <textarea
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder="Specify vendor indemnity terms in the event of IP infringement or decision bias lawsuits..."
            rows={3}
            value={data.liabilityCoverage || ''}
            onFocus={() => handleFocus('liabilityCoverage')}
            onBlur={handleBlur}
            onChange={(e) => onChange('liabilityCoverage', e.target.value)}
          />
        </div>

        {/* GDPR Compliance & Data Controls */}
        <div className="space-y-md">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Privacy &amp; Data Rights Checkpoints
          </label>
          <div className="space-y-sm">
            <label className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
                checked={data.gdprCompliant || false}
                onChange={(e) => onChange('gdprCompliant', e.target.checked)}
              />
              <div>
                <p className="font-body-md font-bold text-on-surface">GDPR &amp; CCPA Compliant</p>
                <p className="text-label-md text-on-surface-variant">System supports "Right to be Forgotten" and data exports.</p>
              </div>
            </label>

            <label className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
                checked={data.optOutOptions || false}
                onChange={(e) => onChange('optOutOptions', e.target.checked)}
              />
              <div>
                <p className="font-body-md font-bold text-on-surface">Data Training Opt-out</p>
                <p className="text-label-md text-on-surface-variant">Enterprise customer data is excluded from vendor's model retraining.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Audit Upload */}
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
            verified
          </span>
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Third-party Compliance Audit</p>
          <p className="text-label-md text-on-surface-variant">SOC 2 Type II, ISO 27001, or legal audits</p>
          {data.auditName && (
            <div className="mt-md max-w-full px-md py-xs bg-primary-container/20 text-primary rounded-full text-label-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span className="min-w-0 truncate" title={data.auditName}>
                {data.auditName}
              </span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
