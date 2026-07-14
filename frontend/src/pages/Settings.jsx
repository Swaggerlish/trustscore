import React, { useState } from 'react';

const THRESHOLDS = [
  { id: 'low', label: 'Low Risk Minimum', valueLabel: '80+', min: 70, max: 95 },
  { id: 'medium', label: 'Medium Risk Minimum', valueLabel: '60+', min: 40, max: 79 },
  { id: 'high', label: 'High Risk Ceiling', valueLabel: '<60', min: 20, max: 65 }
];

const NOTIFICATION_OPTIONS = [
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'dashboard', label: 'Dashboard', icon: 'notifications' },
  { id: 'webhook', label: 'Webhook', icon: 'webhook' }
];

const PERMISSION_ROWS = [
  { id: 'owner', role: 'Workspace Owner', access: 'Full control', enabled: true },
  { id: 'reviewer', role: 'Risk Reviewer', access: 'Approve assessments', enabled: true },
  { id: 'auditor', role: 'External Auditor', access: 'Read reports', enabled: false }
];

export default function Settings({ savedAssessmentCount = 0 }) {
  const [thresholds, setThresholds] = useState({
    low: 80,
    medium: 60,
    high: 59
  });
  const [euAiActOverlays, setEuAiActOverlays] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    dashboard: true,
    webhook: false
  });
  const [notificationDestination, setNotificationDestination] = useState('procurement-risk@company.com');
  const [permissions, setPermissions] = useState(
    PERMISSION_ROWS.reduce((items, row) => ({ ...items, [row.id]: row.enabled }), {})
  );

  const updateThreshold = (id, value) => {
    setThresholds((current) => ({
      ...current,
      [id]: Number(value)
    }));
  };

  return (
    <div className="space-y-xl max-w-max_width mx-auto">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
          Settings
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Configure scoring behavior, validation overlays, notifications, and workspace access.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg lg:p-xl shadow-sm">
          <div className="flex items-start justify-between gap-md mb-lg">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Scoring Thresholds
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Adjust the active risk bands used to classify trust scores.
              </p>
            </div>
            <span className="material-symbols-outlined text-primary">tune</span>
          </div>

          <div className="space-y-lg">
            {THRESHOLDS.map((threshold) => (
              <label key={threshold.id} className="block">
                <div className="flex items-center justify-between gap-md mb-sm">
                  <span className="font-body-md font-bold text-on-surface">
                    {threshold.label}
                  </span>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {thresholds[threshold.id]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={threshold.min}
                  max={threshold.max}
                  value={thresholds[threshold.id]}
                  onChange={(event) => updateThreshold(threshold.id, event.target.value)}
                  className="w-full accent-primary"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg lg:p-xl shadow-sm">
          <div className="flex items-start justify-between gap-md mb-lg">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Assessment Store
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Saved locally in this browser.
              </p>
            </div>
            <span className="material-symbols-outlined text-tertiary">folder_managed</span>
          </div>
          <div className="rounded-lg bg-surface-container p-lg">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Saved Assessments
            </p>
            <p className="font-display-lg text-display-lg text-on-surface leading-none mt-sm">
              {savedAssessmentCount}
            </p>
          </div>
        </section>

        <section className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg lg:p-xl shadow-sm">
          <div className="flex items-start justify-between gap-md mb-lg">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                EU AI Act Overlays
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Show rule validation markers during assessment review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEuAiActOverlays((enabled) => !enabled)}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                euAiActOverlays ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-pressed={euAiActOverlays}
              aria-label="Toggle EU AI Act overlays"
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                  euAiActOverlays ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="space-y-sm">
            {['High-risk obligations', 'Transparency notices', 'Human oversight checks'].map((item) => (
              <div key={item} className="flex items-center gap-sm text-body-md text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {euAiActOverlays ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg lg:p-xl shadow-sm">
          <div className="mb-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Notifications
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Choose destinations for assessment results and high-risk alerts.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-sm mb-lg">
            {NOTIFICATION_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setNotifications((current) => ({
                  ...current,
                  [option.id]: !current[option.id]
                }))}
                className={`min-h-24 rounded-lg border p-sm flex flex-col items-center justify-center gap-xs transition-colors ${
                  notifications[option.id]
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">{option.icon}</span>
                <span className="font-label-md text-label-md font-bold">{option.label}</span>
              </button>
            ))}
          </div>
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Destination
            </span>
            <input
              value={notificationDestination}
              onChange={(event) => setNotificationDestination(event.target.value)}
              className="mt-xs w-full rounded-lg border border-outline-variant bg-surface p-md text-body-md text-on-surface outline-none focus:border-primary"
            />
          </label>
        </section>

        <section className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-lg lg:px-xl py-lg border-b border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Workspace Permissions
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage which workspace roles can review, approve, or read assessment records.
            </p>
          </div>
          <div className="divide-y divide-outline-variant">
            {PERMISSION_ROWS.map((row) => (
              <div key={row.id} className="px-lg lg:px-xl py-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
                <div className="flex items-center gap-md">
                  <div className="h-10 w-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">{row.role}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant">{row.access}</p>
                  </div>
                </div>
                <label className="flex items-center gap-sm font-label-md text-label-md font-bold text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={permissions[row.id]}
                    onChange={(event) => setPermissions((current) => ({
                      ...current,
                      [row.id]: event.target.checked
                    }))}
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  Enabled
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
