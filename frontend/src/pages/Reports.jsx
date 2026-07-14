import React, { useState } from 'react';
import { downloadReport } from '../utils/reportExport';

export default function Reports({ assessmentHistory = [], onDeleteAssessment, onNavigate }) {
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const reports = assessmentHistory.map(normalizeReport);
  const selectedReport = reports[0];

  const handleDownload = () => {
    if (!selectedReport) {
      return;
    }

    downloadReport(selectedReport, downloadFormat);
  };

  return (
    <div className="space-y-xl max-w-max_width mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
            Evaluation Reports
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Review completed procurement assessments, governance scores, and recommended mitigations.
          </p>
        </div>
        <div className="flex gap-md">
          <button
            onClick={() => onNavigate('assessment')}
            className="px-lg py-md rounded-lg border border-outline-variant font-body-md font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            New Assessment
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
              onClick={handleDownload}
              className="px-lg py-md bg-primary text-on-primary font-body-md font-bold hover:bg-primary-container transition-colors flex items-center gap-sm"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download
            </button>
          </div>
        </div>
      </div>

      {!selectedReport && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-md text-blue-800 font-body-md">
          No saved assessment reports yet. Run an assessment to generate a persistent report.
        </div>
      )}

      {selectedReport ? (
      <div className="grid grid-cols-12 gap-lg">
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-lg mb-xl">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
                Current Report
              </p>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {selectedReport.name}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {selectedReport.category} · {selectedReport.date}
              </p>
            </div>
            <RiskBadge riskLevel={selectedReport.riskLevel} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-xl">
            <ScoreCard label="Overall Trust Score" value={selectedReport.score} prominent />
            <ScoreCard label="Bias & Fairness" value={selectedReport.scores?.bias} />
            <ScoreCard label="Dataset Quality" value={selectedReport.scores?.datasetQuality} />
            <ScoreCard label="Model Architecture" value={selectedReport.scores?.modelArchitecture} />
            <ScoreCard label="Privacy & Security" value={selectedReport.scores?.privacy} />
            <ScoreCard label="Compliance" value={selectedReport.scores?.compliance} />
            <ScoreCard label="Transparency" value={selectedReport.scores?.transparency} />
            <ScoreCard label="Environmental Impact" value={selectedReport.scores?.environmentalImpact} />
            <ScoreCard label="Accountability" value={selectedReport.scores?.accountability} />
            <ScoreCard label="Performance" value={selectedReport.scores?.performance} />
            <ScoreCard label="Robustness" value={selectedReport.scores?.robustness} />
          </div>

          <div className="border-t border-outline-variant pt-lg">
            <h4 className="font-body-md font-bold text-on-surface mb-md">Recommendations</h4>
            {selectedReport.recommendations?.length ? (
              <ul className="space-y-sm text-body-md text-on-surface-variant">
                {selectedReport.recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex gap-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-[2px]">task_alt</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                No open recommendations recorded for this report.
              </p>
            )}
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-lg py-md border-b border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface">Report Library</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {reports.map((report) => (
              <div key={report.id} className="p-lg hover:bg-surface-container-low transition-colors">
                <div className="flex items-start justify-between gap-md">
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">{report.name}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant">{report.category}</p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-md text-label-md font-bold text-primary">{Math.round(report.score)}%</span>
                    <button
                      onClick={() => onDeleteAssessment?.(report.id)}
                      className="text-on-surface-variant hover:text-error transition-colors"
                      title="Delete report"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="mt-md flex items-center justify-between">
                  <RiskBadge riskLevel={report.riskLevel} compact />
                  <span className="font-label-md text-label-md text-on-surface-variant">{report.date}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
          <span className="material-symbols-outlined text-primary text-[40px]">assignment</span>
          <h3 className="mt-md font-headline-md text-headline-md font-bold text-on-surface">
            No Reports Available
          </h3>
          <p className="mt-sm text-on-surface-variant">
            Completed assessments will be saved here automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, prominent = false }) {
  const isNumber = typeof value === 'number';
  const displayValue = isNumber ? `${Math.round(value)}%` : value || 'Pending';
  const width = isNumber ? `${Math.max(0, Math.min(100, value))}%` : '0%';

  return (
    <div className="rounded-lg border border-outline-variant bg-surface p-lg">
      <div className="flex items-center justify-between gap-md mb-md">
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <span className={`${prominent ? 'text-headline-md' : 'text-body-md'} font-bold text-on-surface`}>
          {displayValue}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-container overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width }}></div>
      </div>
    </div>
  );
}

function RiskBadge({ riskLevel, compact = false }) {
  const className = riskLevel === 'Low'
    ? 'bg-green-100 text-green-800'
    : riskLevel === 'Medium'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';

  return (
    <span className={`inline-flex items-center rounded-full font-bold ${className} ${compact ? 'px-sm py-xs text-label-md' : 'px-md py-sm text-body-md'}`}>
      {riskLevel} Risk
    </span>
  );
}

function normalizeReport(assessment) {
  return {
    id: assessment.id,
    name: assessment.name || 'Unnamed AI Vendor',
    category: assessment.category || 'AI Procurement Assessment',
    score: assessment.score || 0,
    riskLevel: assessment.riskLevel || 'Medium',
    date: assessment.date || new Date().toLocaleDateString(),
    status: assessment.status || 'Completed',
    scores: assessment.scores || {},
    metrics: assessment.metrics || {},
    recommendations: assessment.recommendations || []
  };
}
