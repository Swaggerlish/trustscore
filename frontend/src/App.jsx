import React, { useMemo, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [assessmentHistory, setAssessmentHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trustscore_assessments') || '[]');
    } catch {
      return [];
    }
  });
  const latestAssessment = assessmentHistory[0] || null;

  const saveAssessmentHistory = (nextHistory) => {
    setAssessmentHistory(nextHistory);
    localStorage.setItem('trustscore_assessments', JSON.stringify(nextHistory));
  };

  const handleAssessmentEvaluated = (assessment) => {
    const existingAssessment = assessmentHistory.find((item) => item.id === assessment.id);
    const savedAssessment = {
      ...assessment,
      id: assessment.id || crypto.randomUUID(),
      createdAt: existingAssessment?.createdAt || assessment.createdAt || new Date().toISOString()
    };

    saveAssessmentHistory([
      savedAssessment,
      ...assessmentHistory.filter((item) => item.id !== savedAssessment.id)
    ]);
  };

  const handleDeleteAssessment = (assessmentId) => {
    saveAssessmentHistory(assessmentHistory.filter((item) => item.id !== assessmentId));
  };

  const savedAssessmentCount = useMemo(
    () => assessmentHistory.length,
    [assessmentHistory]
  );

  return (
    <Layout activePage={activePage} latestAssessment={latestAssessment} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <Dashboard
          assessmentHistory={assessmentHistory}
          onDeleteAssessment={handleDeleteAssessment}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'assessment' && (
        <Assessment onAssessmentEvaluated={handleAssessmentEvaluated} />
      )}
      {activePage === 'reports' && (
        <Reports
          assessmentHistory={assessmentHistory}
          onDeleteAssessment={handleDeleteAssessment}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'settings' && (
        <Settings savedAssessmentCount={savedAssessmentCount} />
      )}
    </Layout>
  );
}
