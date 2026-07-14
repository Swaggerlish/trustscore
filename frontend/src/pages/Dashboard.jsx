import React, { useMemo, useState } from 'react';

export default function Dashboard({ assessmentHistory = [], onDeleteAssessment, onNavigate }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    risk: 'All',
    minScore: 'All'
  });
  const savedAssessments = assessmentHistory.map(formatLiveAssessment);
  const averageScore = savedAssessments.length
    ? savedAssessments.reduce((total, item) => total + normalizeScore(item), 0) / savedAssessments.length
    : 0;
  const highRiskCount = savedAssessments.filter((item) => item.riskLevel === 'High').length;
  const kpis = [
    {
      title: 'Active Evaluations',
      value: String(savedAssessments.length).padStart(2, '0'),
      trend: savedAssessments.length ? 'Saved locally' : 'No saved records',
      icon: 'pending_actions',
      colorClass: 'text-primary bg-primary-container/10',
    },
    {
      title: 'Average Trust Score',
      value: savedAssessments.length ? (averageScore / 10).toFixed(1) : '0.0',
      suffix: '/10',
      trend: savedAssessments.length ? 'Based on saved assessments' : 'Awaiting assessment',
      icon: 'verified_user',
      colorClass: 'text-tertiary bg-tertiary-container/10',
    },
    {
      title: 'Critical Risks',
      value: String(highRiskCount).padStart(2, '0'),
      trend: highRiskCount ? 'Needs mitigation' : 'No high risk saved',
      icon: 'report_problem',
      colorClass: 'text-error bg-error-container/20',
      alertBadges: true,
    },
  ];

  const recentAssessments = savedAssessments;
  const trustDistribution = buildTrustDistribution(recentAssessments);
  const filteredAssessments = useMemo(
    () => recentAssessments.filter((vendor) => matchesFilters(vendor, filters)),
    [recentAssessments, filters]
  );
  const activeFilterCount = Object.values(filters).filter((value) => value !== 'All').length;
  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };
  const resetFilters = () => setFilters({ status: 'All', risk: 'All', minScore: 'All' });

  return (
    <div className="space-y-xl max-w-max_width mx-auto">
      {/* Welcome Header */}
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
          Procurement Dashboard
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Real-time oversight of enterprise AI vendor integrity and compliance.
        </p>
      </div>

      {/* KPI Cards: Bento Grid */}
      <div className="bento-grid mb-xl">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-md">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.colorClass}`}>
                <span className="material-symbols-outlined text-[28px]">{kpi.icon}</span>
              </div>
              {kpi.alertBadges ? (
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-error">priority_high</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-error">priority_high</span>
                  </div>
                </div>
              ) : (
                <span className="font-bold font-label-md text-primary">{kpi.trend}</span>
              )}
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
                {kpi.title}
              </p>
              <div className="flex items-end gap-xs">
                <h3 className="font-display-lg text-display-lg text-on-surface leading-none">{kpi.value}</h3>
                {kpi.suffix && (
                  <span className="font-headline-md text-headline-md text-on-surface-variant mb-[2px]">{kpi.suffix}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-visible mb-xl shadow-sm">
        <div className="px-xl py-lg border-b border-outline-variant flex justify-between items-center flex-wrap gap-md">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Assessments</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Saved assessment results persist in this browser until you delete them.
            </p>
          </div>
          <div className="flex gap-md relative">
            <button
              onClick={() => setShowFilters((isOpen) => !isOpen)}
              className={`flex items-center gap-sm px-md py-sm border rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md ${
                activeFilterCount
                  ? 'border-primary text-primary bg-primary-container/10'
                  : 'border-outline-variant text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined">filter_list</span>
              Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined">download</span>
              Export
            </button>
            {showFilters && (
              <div className="absolute right-0 top-12 z-50 w-80 max-h-[calc(100vh-12rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-xl">
                <div className="flex items-center justify-between mb-md">
                  <h4 className="font-body-md font-bold text-on-surface">Filter Assessments</h4>
                  <button
                    onClick={resetFilters}
                    className="font-label-md text-label-md font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-md">
                  <label className="block">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Status
                    </span>
                    <select
                      value={filters.status}
                      onChange={(event) => updateFilter('status', event.target.value)}
                      className="mt-xs w-full rounded-lg border border-outline-variant bg-surface p-sm text-body-md text-on-surface outline-none focus:border-primary"
                    >
                      <option>All</option>
                      <option>Completed</option>
                      <option>In Progress</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Risk Level
                    </span>
                    <select
                      value={filters.risk}
                      onChange={(event) => updateFilter('risk', event.target.value)}
                      className="mt-xs w-full rounded-lg border border-outline-variant bg-surface p-sm text-body-md text-on-surface outline-none focus:border-primary"
                    >
                      <option>All</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Minimum Score
                    </span>
                    <select
                      value={filters.minScore}
                      onChange={(event) => updateFilter('minScore', event.target.value)}
                      className="mt-xs w-full rounded-lg border border-outline-variant bg-surface p-sm text-body-md text-on-surface outline-none focus:border-primary"
                    >
                      <option>All</option>
                      <option value="80">80% and above</option>
                      <option value="60">60% and above</option>
                      <option value="below60">Below 60%</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-xl py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-xl py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-xl py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Trust Score
                </th>
                <th className="px-xl py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Creation Date
                </th>
                <th className="px-xl py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredAssessments.map((vendor, index) => (
                <tr
                  key={`${vendor.name}-${vendor.date}`}
                  onClick={() => onNavigate('assessment')}
                  className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
                >
                  <td className="px-xl py-lg">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          {vendor.icon || 'assignment_turned_in'}
                        </span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-bold text-on-surface group-hover:text-primary transition-colors">
                          {vendor.name}
                        </p>
                        <p className="font-label-md text-label-md text-on-surface-variant">{vendor.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-xl py-lg">
                    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-md text-label-md font-bold ${vendor.statusClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-sm ${vendor.dotClass}`}></span>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-xl py-lg">
                    <div className="w-48">
                      <div className="flex justify-between items-center mb-xs">
                        <span className="font-label-md text-label-md font-bold text-on-surface">{vendor.score}</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">{vendor.scoreText}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden relative">
                        <div
                          className={`h-full ${vendor.scoreColor} relative overflow-hidden`}
                          style={{ width: vendor.scorePercent }}
                        >
                          {vendor.pulse && (
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-xl py-lg font-body-md text-body-md text-on-surface-variant">
                    {vendor.date}
                  </td>
                  <td className="px-xl py-lg text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteAssessment?.(vendor.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Delete assessment"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredAssessments.length && (
                <tr>
                  <td colSpan={5} className="px-xl py-xl text-center text-on-surface-variant">
                    {recentAssessments.length
                      ? 'No assessments match the selected filters.'
                      : 'No saved assessments yet. Run an assessment to populate the dashboard.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Bento Items */}
      <div className="bento-grid">
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden min-h-[300px] flex flex-col shadow-sm">
          <div className="p-lg border-b border-outline-variant">
            <h4 className="font-headline-md text-headline-md text-on-surface">Trust Matrix Distribution</h4>
          </div>
          <div className="flex-1 relative p-xl flex items-center justify-center">
            {/* Visual Chart Representation */}
            <div className="w-full h-56 flex items-end justify-between gap-md">
              {trustDistribution.map((bucket) => (
                <div key={bucket.label} className="flex-1 flex flex-col items-center gap-sm">
                  <div
                    className={`w-full rounded-t-lg transition-all flex flex-col justify-end items-center pb-2 ${
                      bucket.count
                        ? bucket.colorClass
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    style={{ height: `${Math.max(12, bucket.height)}%` }}
                    title={`${bucket.count} assessment${bucket.count === 1 ? '' : 's'}`}
                  >
                    <span className="text-label-md font-bold">
                      {bucket.count}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-label-md text-label-md font-bold text-on-surface">
                      {bucket.label}
                    </p>
                    <p className="font-label-md text-label-md text-on-surface-variant">
                      {bucket.range}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-primary text-on-primary rounded-xl p-xl flex flex-col justify-between relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/50 to-primary pointer-events-none"></div>
          <div className="relative z-10 space-y-md">
            <h4 className="font-headline-md text-headline-md font-bold">Audit Ready?</h4>
            <p className="font-body-md text-body-md opacity-90 leading-relaxed">
              Your current trust compliance average is 8.4/10. Review recommended mitigations to reach the Elite tier.
            </p>
          </div>
          <button
            onClick={() => onNavigate('assessment')}
            className="bg-white text-primary mt-lg px-lg py-sm rounded-lg font-label-md text-label-md font-bold transition-all hover:bg-surface-container-low active:scale-95 z-10 w-full"
          >
            Run Full Audit
          </button>
        </div>
      </div>
    </div>
  );
}

function formatLiveAssessment(assessment) {
  const score = Number(assessment.score || 0);
  const riskLevel = assessment.riskLevel || 'Medium';
  const isLow = riskLevel === 'Low';
  const isMedium = riskLevel === 'Medium';

  return {
    name: assessment.name,
    id: assessment.id,
    category: assessment.category,
    status: assessment.status || 'Completed',
    statusClass: isLow
      ? 'bg-green-100 text-green-800'
      : isMedium
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800',
    dotClass: isLow ? 'bg-green-600' : isMedium ? 'bg-yellow-600' : 'bg-red-600',
    score: (score / 10).toFixed(1),
    rawScore: score,
    scoreText: assessment.scoreText,
    scoreColor: isLow ? 'bg-primary' : isMedium ? 'bg-tertiary' : 'bg-error',
    scorePercent: `${Math.max(0, Math.min(100, score))}%`,
    date: assessment.date,
    riskLevel,
    icon: 'assignment_turned_in',
    scores: assessment.scores
  };
}

function matchesFilters(vendor, filters) {
  const score = normalizeScore(vendor);
  const riskLevel = vendor.riskLevel || classifyScore(score);

  if (filters.status !== 'All' && vendor.status !== filters.status) {
    return false;
  }

  if (filters.risk !== 'All' && riskLevel !== filters.risk) {
    return false;
  }

  if (filters.minScore === 'below60') {
    return score < 60;
  }

  if (filters.minScore !== 'All') {
    return score >= Number(filters.minScore);
  }

  return true;
}

function normalizeScore(vendor) {
  if (typeof vendor.rawScore === 'number') {
    return vendor.rawScore;
  }

  const score = Number(vendor.score || 0);
  return score <= 10 ? score * 10 : score;
}

function classifyScore(score) {
  if (score >= 80) {
    return 'Low';
  }
  if (score >= 60) {
    return 'Medium';
  }
  return 'High';
}

function buildTrustDistribution(assessments) {
  const buckets = [
    { label: 'Critical', range: '0-39%', min: 0, max: 39, count: 0, colorClass: 'bg-error text-white' },
    { label: 'High Risk', range: '40-59%', min: 40, max: 59, count: 0, colorClass: 'bg-error/80 text-white' },
    { label: 'Medium', range: '60-79%', min: 60, max: 79, count: 0, colorClass: 'bg-tertiary text-on-primary' },
    { label: 'Trusted', range: '80-89%', min: 80, max: 89, count: 0, colorClass: 'bg-primary-container text-on-primary-container' },
    { label: 'Elite', range: '90-100%', min: 90, max: 100, count: 0, colorClass: 'bg-primary text-on-primary' }
  ];

  assessments.forEach((assessment) => {
    const score = normalizeScore(assessment);
    const bucket = buckets.find((item) => score >= item.min && score <= item.max);
    if (bucket) {
      bucket.count += 1;
    }
  });

  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return buckets.map((bucket) => ({
    ...bucket,
    height: bucket.count ? (bucket.count / maxCount) * 100 : 12
  }));
}
