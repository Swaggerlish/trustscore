export const ASSESSMENT_METRICS = [
  { id: 'risk', label: 'Risk Assessment', icon: 'policy' },
  { id: 'robustness', label: 'Robustness', icon: 'engineering' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'security' },
  { id: 'bias', label: 'Bias & Fairness', icon: 'balance' },
  { id: 'accountability', label: 'Accountability', icon: 'group' },
  { id: 'models', label: 'Models & Architecture', icon: 'psychology' },
  { id: 'performance', label: 'Performance', icon: 'monitor_heart' },
  { id: 'transparency', label: 'Transparency', icon: 'visibility' },
  { id: 'environmental', label: 'Environmental Impact', icon: 'eco' },
  { id: 'datasets', label: 'Datasets', icon: 'database' }
];

export const DEFAULT_ASSESSMENT_METRICS = ASSESSMENT_METRICS.map(({ id }) => id);
