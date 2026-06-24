import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && <Dashboard onNavigate={setActivePage} />}
      {activePage === 'assessment' && <Assessment />}
      {activePage === 'reports' && (
        <div className="p-xl text-center max-w-2xl mx-auto space-y-md">
          <h2 className="text-headline-md font-bold text-on-surface">Evaluation Reports</h2>
          <p className="text-on-surface-variant">
            Historical diagnostic pipeline runs, exported whitepapers, and regulatory compliance reports are cached and presented here.
          </p>
        </div>
      )}
      {activePage === 'settings' && (
        <div className="p-xl text-center max-w-2xl mx-auto space-y-md">
          <h2 className="text-headline-md font-bold text-on-surface">Settings</h2>
          <p className="text-on-surface-variant">
            Adjust active scoring thresholds, toggle EU AI Act rule validation overlays, configure notification destinations, and manage workspace permissions.
          </p>
        </div>
      )}
    </Layout>
  );
}
