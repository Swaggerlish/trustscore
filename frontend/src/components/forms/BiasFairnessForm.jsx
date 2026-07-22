import React, { useRef } from 'react';

const COUNT_FIELDS = [
  {
    id: 'privilegedFavorable',
    label: 'Privileged Favorable Outcomes',
    helper: 'Approvals, passes, selections, or other positive outcomes.'
  },
  {
    id: 'privilegedUnfavorable',
    label: 'Privileged Unfavorable Outcomes',
    helper: 'Denials, failures, rejections, or other negative outcomes.'
  },
  {
    id: 'unprivilegedFavorable',
    label: 'Unprivileged Favorable Outcomes',
    helper: 'Positive outcomes for the comparison group.'
  },
  {
    id: 'unprivilegedUnfavorable',
    label: 'Unprivileged Unfavorable Outcomes',
    helper: 'Negative outcomes for the comparison group.'
  }
];

const SAMPLE_DECISIONS = `[
  { "protected_group": "reference", "favorable_outcome": true },
  { "protected_group": "reference", "favorable_outcome": true },
  { "protected_group": "comparison", "favorable_outcome": false }
]`;

export default function BiasFairnessForm({ sectionTitle, sectionDesc, data = {}, onChange }) {
  const fileInputRef = useRef(null);

  const updateCount = (field, value) => {
    const normalized = Math.max(0, Number.parseInt(value || '0', 10) || 0);
    onChange(field, normalized);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onChange('evidenceName', file ? file.name : '');
    onChange('evidenceFile', file || null);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg lg:p-xl shadow-sm transition-all">
      <div className="mb-xl">
        <h2 className="font-headline-md text-headline-md mb-xs text-on-surface">
          {sectionTitle}
        </h2>
        <p className="text-on-surface-variant font-body-md">
          {sectionDesc}
        </p>
      </div>

      <form className="space-y-xl">
        <div className="rounded-lg border border-outline-variant bg-surface p-md">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-primary text-[22px] mt-xxs">
              checklist
            </span>
            <div className="min-w-0 flex-1 space-y-sm">
              <p className="font-body-md font-bold text-on-surface">
                Bias & Fairness Scoring Inputs
              </p>
              <p className="text-label-md text-on-surface-variant">
                Provide privileged and unprivileged group outcomes using the count boxes or row-level JSON decisions.
              </p>
              <pre className="w-full max-w-full overflow-x-auto whitespace-pre rounded-lg bg-surface-container p-sm font-mono text-label-sm text-on-surface">
{`[
  { "protected_group": "reference", "favorable_outcome": true },
  { "protected_group": "comparison", "favorable_outcome": false }
]`}
              </pre>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Privileged Group
            </label>
            <input
              className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-body-md"
              value={data.privilegedGroup || ''}
              onChange={(e) => onChange('privilegedGroup', e.target.value)}
              placeholder="Example: reference"
            />
          </div>
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Unprivileged Group
            </label>
            <input
              className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-body-md"
              value={data.unprivilegedGroup || ''}
              onChange={(e) => onChange('unprivilegedGroup', e.target.value)}
              placeholder="Example: comparison"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {COUNT_FIELDS.map((field) => (
            <label
              key={field.id}
              className="block p-md bg-surface border border-outline-variant rounded-lg"
            >
              <span className="block font-body-md font-bold text-on-surface mb-xs">
                {field.label}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full p-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-body-md"
                value={data[field.id] ?? 0}
                onChange={(e) => updateCount(field.id, e.target.value)}
              />
              <span className="block mt-xs text-label-md text-on-surface-variant">
                {field.helper}
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Fairness Testing Notes
          </label>
          <textarea
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder="Describe protected attributes, test dataset period, and how outcomes were measured..."
            rows={4}
            value={data.details || ''}
            onChange={(e) => onChange('details', e.target.value)}
          />
        </div>

        <div className="space-y-md">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Decision Records JSON
            </label>
            <p className="mt-xs text-label-md text-on-surface-variant">
              Optional row-level outcomes. If supplied, these records are used for demographic parity and disparate impact.
            </p>
          </div>
          <textarea
            className="font-mono w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-label-md"
            placeholder={SAMPLE_DECISIONS}
            rows={6}
            value={data.decisionRecordsJson || ''}
            onChange={(e) => onChange('decisionRecordsJson', e.target.value)}
          />
        </div>

        <label className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
          <input
            type="checkbox"
            className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
            checked={data.affirmed || false}
            onChange={(e) => onChange('affirmed', e.target.checked)}
          />
          <div>
            <p className="font-body-md font-bold text-on-surface">Fairness Evidence Reviewed</p>
            <p className="text-label-md text-on-surface-variant">
              Counts represent observed outcomes for the selected protected groups.
            </p>
          </div>
        </label>

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
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Fairness Report / Evidence</p>
          <p className="text-label-md text-on-surface-variant">Attach vendor bias audits, model cards, CSV summaries, or fairness reports</p>
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
