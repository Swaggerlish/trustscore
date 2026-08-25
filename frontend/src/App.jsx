import React, { useMemo, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('procurescore_assessments') ||
        localStorage.getItem('trustscore_assessments') ||
        '[]'
      );
    } catch {
      return [];
    }
  });
  const latestAssessment = assessmentHistory[0] || null;

  const saveAssessmentHistory = (nextHistory) => {
    setAssessmentHistory(nextHistory);
    localStorage.setItem('procurescore_assessments', JSON.stringify(nextHistory));
  };

  React.useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const navigateToPage = (page, reportId = null) => {
    if (page === 'reports' && reportId) {
      setSelectedReportId(reportId);
    }
    setActivePage(page);
  };

  const savedAssessmentCount = useMemo(
    () => assessmentHistory.length,
    [assessmentHistory]
  );

  if (pathname === '/') {
    return <LandingPage onGetStarted={() => navigateTo('/dashboard')} />;
  }

  return (
    <Layout activePage={activePage} latestAssessment={latestAssessment} onNavigate={navigateToPage}>
      {activePage === 'dashboard' && (
        <Dashboard
          assessmentHistory={assessmentHistory}
          onDeleteAssessment={handleDeleteAssessment}
          onNavigate={navigateToPage}
        />
      )}
      {activePage === 'assessment' && (
        <Assessment onAssessmentEvaluated={handleAssessmentEvaluated} />
      )}
      {activePage === 'reports' && (
        <Reports
          assessmentHistory={assessmentHistory}
          onDeleteAssessment={handleDeleteAssessment}
          onNavigate={navigateToPage}
          selectedReportId={selectedReportId}
        />
      )}
      {activePage === 'settings' && (
        <Settings savedAssessmentCount={savedAssessmentCount} />
      )}
    </Layout>
  );
}
