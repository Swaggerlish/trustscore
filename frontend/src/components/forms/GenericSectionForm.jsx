import React, { useState } from 'react';

export default function GenericSectionForm({ sectionId, sectionTitle, sectionDesc, data = {}, onChange }) {
  const [activeField, setActiveField] = useState(null);

  const handleFocus = (field) => setActiveField(field);
  const handleBlur = () => setActiveField(null);

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
        <div className="p-lg bg-surface border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined text-outline group-hover:text-primary text-[32px] mb-sm">
            cloud_upload
          </span>
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Supporting Proof / Evidence</p>
          <p className="text-label-md text-on-surface-variant">Upload any diagnostics or test reports up to 15MB</p>
        </div>
      </form>
    </div>
  );
}
