import React, { useRef } from 'react';

const CONTROL_FIELDS = [
  {
    id: 'documentedSources',
    label: 'Documented Sources',
    helper: 'Dataset origin, collection method, and vendor ownership are recorded.'
  },
  {
    id: 'representativeSamples',
    label: 'Representative Samples',
    helper: 'Coverage across intended users, regions, demographics, or operating contexts is assessed.'
  },
  {
    id: 'dataLineageAvailable',
    label: 'Data Lineage Available',
    helper: 'Transformations, joins, filtering, and preprocessing steps are traceable.'
  },
  {
    id: 'qualityChecksPerformed',
    label: 'Quality Checks Performed',
    helper: 'Missing values, duplicates, drift, and invalid values have been reviewed.'
  },
  {
    id: 'licensingVerified',
    label: 'Licensing Verified',
    helper: 'Usage rights, consent, and procurement licensing constraints are documented.'
  }
];

const SAMPLE_RECORDS = `[
  { "age": 31, "income": 1000, "label": 1 },
  { "age": null, "income": 900, "label": 0 },
  { "age": 44, "income": 1200, "label": 1 }
]`;

export default function DatasetQualityForm({ sectionTitle, sectionDesc, data = {}, onChange }) {
  const fileInputRef = useRef(null);
  const currentParseState = getJsonParseState(data.recordsJson);
  const referenceParseState = getJsonParseState(data.referenceRecordsJson);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onChange('evidenceName', file ? file.name : '');
    onChange('evidenceFile', file || null);
    onChange('csvContent', '');

    if (!file || !isCsvFile(file)) {
      return;
    }

    file.text()
      .then((content) => onChange('csvContent', content))
      .catch(() => onChange('csvContent', ''));
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
            <div className="space-y-sm">
              <p className="font-body-md font-bold text-on-surface">
                Dataset Quality Scoring Inputs
              </p>
              <p className="text-label-md text-on-surface-variant">
                Rule-based scoring uses the five governance controls below. Evidently scoring can also use JSON row records or an uploaded CSV sample.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-surface-container p-sm font-mono text-label-sm text-on-surface">
{`{
  "documented_sources": true,
  "representative_samples": true,
  "data_lineage_available": true,
  "quality_checks_performed": true,
  "licensing_verified": true
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-md">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Dataset Governance Controls
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {CONTROL_FIELDS.map((field) => (
              <label
                key={field.id}
                className="flex items-start gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors"
              >
                <input
                  type="checkbox"
                  className="mt-xs w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
                  checked={data[field.id] || false}
                  onChange={(event) => onChange(field.id, event.target.checked)}
                />
                <span>
                  <span className="block font-body-md font-bold text-on-surface">
                    {field.label}
                  </span>
                  <span className="block text-label-md text-on-surface-variant">
                    {field.helper}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Data Sourcing & Curation Notes
          </label>
          <textarea
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder="Describe data sources, licensing, population coverage, preprocessing, and quality checks..."
            rows={4}
            value={data.details || ''}
            onChange={(event) => onChange('details', event.target.value)}
          />
        </div>

        <div className="space-y-md">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Current Dataset Records for Evidently
            </label>
            <p className="mt-xs text-label-md text-on-surface-variant">
              Paste a JSON array of row objects. Evidently evaluates this as the current dataset sample.
            </p>
          </div>
          <textarea
            className="font-mono w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-label-md"
            placeholder={SAMPLE_RECORDS}
            rows={7}
            value={data.recordsJson || ''}
            onChange={(event) => onChange('recordsJson', event.target.value)}
          />
          <JsonStatus state={currentParseState} emptyLabel="No current records supplied" />
        </div>

        <div className="space-y-md">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Reference Dataset Records
            </label>
            <p className="mt-xs text-label-md text-on-surface-variant">
              Optional baseline records let Evidently compare current data against an expected distribution.
            </p>
          </div>
          <textarea
            className="font-mono w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-label-md"
            placeholder={SAMPLE_RECORDS}
            rows={5}
            value={data.referenceRecordsJson || ''}
            onChange={(event) => onChange('referenceRecordsJson', event.target.value)}
          />
          <JsonStatus state={referenceParseState} emptyLabel="No reference records supplied" />
        </div>

        <label className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
          <input
            type="checkbox"
            className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary cursor-pointer"
            checked={data.affirmed || false}
            onChange={(event) => onChange('affirmed', event.target.checked)}
          />
          <div>
            <p className="font-body-md font-bold text-on-surface">Dataset Evidence Reviewed</p>
            <p className="text-label-md text-on-surface-variant">
              Vendor documentation and supplied records are suitable for assessment.
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
            accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.json"
            onChange={handleFileChange}
          />
          <span className="material-symbols-outlined text-outline group-hover:text-primary text-[32px] mb-sm">
            cloud_upload
          </span>
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Dataset Evidence</p>
          <p className="text-label-md text-on-surface-variant">Attach datasheets, CSV samples, profiling reports, or licensing evidence</p>
          {data.evidenceName && (
            <div className="mt-md max-w-full space-y-xs">
              <div className="px-md py-xs bg-primary-container/20 text-primary rounded-full text-label-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                <span className="min-w-0 truncate" title={data.evidenceName}>
                  {data.evidenceName}
                </span>
              </div>
              {data.csvContent && (
                <div className="px-md py-xs bg-green-50 text-green-700 border border-green-200 rounded-full text-label-md font-semibold">
                  CSV will be sent to Dataset Quality scoring
                </div>
              )}
            </div>
          )}
        </button>
      </form>
    </div>
  );
}

function isCsvFile(file) {
  return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
}

function JsonStatus({ state, emptyLabel }) {
  const className = state.status === 'valid'
    ? 'text-green-700 bg-green-50 border-green-200'
    : state.status === 'invalid'
    ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-on-surface-variant bg-surface border-outline-variant';

  return (
    <div className={`rounded-lg border px-md py-sm text-label-md font-semibold ${className}`}>
      {state.message || emptyLabel}
    </div>
  );
}

function getJsonParseState(value = '') {
  const trimmed = value.trim();
  if (!trimmed) {
    return { status: 'empty', message: '' };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return { status: 'invalid', message: 'JSON must be an array of row objects.' };
    }
    const validRows = parsed.filter((row) => row && typeof row === 'object' && !Array.isArray(row));
    return {
      status: 'valid',
      message: `${validRows.length} valid row${validRows.length === 1 ? '' : 's'} ready for Evidently.`
    };
  } catch {
    return { status: 'invalid', message: 'Invalid JSON. Use an array like [{ "column": "value" }].' };
  }
}
