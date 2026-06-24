import React from 'react';

export default function Dashboard({ onNavigate }) {
  const kpis = [
    {
      title: 'Active Evaluations',
      value: '24',
      trend: '+12% vs last month',
      icon: 'pending_actions',
      colorClass: 'text-primary bg-primary-container/10',
    },
    {
      title: 'Average Trust Score',
      value: '8.4',
      suffix: '/10',
      trend: 'Industry High',
      icon: 'verified_user',
      colorClass: 'text-tertiary bg-tertiary-container/10',
    },
    {
      title: 'Critical Risks',
      value: '03',
      trend: 'Needs Mitigation',
      icon: 'report_problem',
      colorClass: 'text-error bg-error-container/20',
      alertBadges: true,
    },
  ];

  const recentAssessments = [
    {
      name: 'Neural Vantage AI',
      category: 'LLM Specialized',
      status: 'Completed',
      statusClass: 'bg-green-100 text-green-800',
      dotClass: 'bg-green-600',
      score: 9.2,
      scoreText: 'High Trust',
      scoreColor: 'bg-primary',
      scorePercent: 'w-[92%]',
      date: 'Oct 24, 2024',
    },
    {
      name: 'Quantum Scale Systems',
      category: 'Data Infrastructure',
      status: 'In Progress',
      statusClass: 'bg-blue-100 text-blue-800',
      dotClass: 'bg-blue-600',
      score: 6.7,
      scoreText: 'Calculating...',
      scoreColor: 'bg-tertiary',
      scorePercent: 'w-[67%]',
      date: 'Oct 28, 2024',
      pulse: true,
    },
    {
      name: 'Titan Secure Core',
      category: 'Cybersecurity AI',
      status: 'Completed',
      statusClass: 'bg-green-100 text-green-800',
      dotClass: 'bg-green-600',
      score: 8.9,
      scoreText: 'High Trust',
      scoreColor: 'bg-primary',
      scorePercent: 'w-[89%]',
      date: 'Oct 22, 2024',
    },
  ];

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
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-xl shadow-sm">
        <div className="px-xl py-lg border-b border-outline-variant flex justify-between items-center flex-wrap gap-md">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Assessments</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Detailed view of latest vendor diagnostic pipelines. Click any vendor to evaluate.
            </p>
          </div>
          <div className="flex gap-md">
            <button className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md">
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md">
              <span className="material-symbols-outlined">download</span>
              Export
            </button>
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
              {recentAssessments.map((vendor, index) => (
                <tr
                  key={index}
                  onClick={() => onNavigate('assessment')}
                  className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
                >
                  <td className="px-xl py-lg">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          {index === 0 ? 'hub' : index === 1 ? 'model_training' : 'security'}
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
                        <div className={`h-full ${vendor.scoreColor} ${vendor.scorePercent} relative overflow-hidden`}>
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
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
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
            <div className="w-full h-48 flex items-end justify-between gap-md">
              <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[40%] transition-all hover:bg-primary-container/40 flex flex-col justify-end items-center pb-2">
                <span className="text-label-md font-bold text-on-surface-variant">4.0</span>
              </div>
              <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[65%] transition-all hover:bg-primary-container/40 flex flex-col justify-end items-center pb-2">
                <span className="text-label-md font-bold text-on-surface-variant">6.5</span>
              </div>
              <div className="flex-1 bg-primary rounded-t-lg h-[85%] transition-all hover:brightness-110 flex flex-col justify-end items-center pb-2 shadow-sm">
                <span className="text-label-md font-bold text-white">8.5</span>
              </div>
              <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[50%] transition-all hover:bg-primary-container/40 flex flex-col justify-end items-center pb-2">
                <span className="text-label-md font-bold text-on-surface-variant">5.0</span>
              </div>
              <div className="flex-1 bg-primary-container/20 rounded-t-lg h-[30%] transition-all hover:bg-primary-container/40 flex flex-col justify-end items-center pb-2">
                <span className="text-label-md font-bold text-on-surface-variant">3.0</span>
              </div>
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
