import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ activePage, latestAssessment, onNavigate, children }) {
  const isAssessmentPage = activePage === 'assessment';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      {/* Fixed Sidebar */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface relative h-screen">
        {/* Header */}
        <Header
          activePage={activePage}
          latestAssessment={latestAssessment}
          onNavigate={onNavigate}
        />

        {/* Main Canvas Scroll Area */}
        <main className={`flex-1 overflow-y-auto p-lg lg:p-xl space-y-lg ${isAssessmentPage ? 'pb-36' : 'pb-24'}`}>
          {children}
        </main>

        {/* Footer */}
        {!isAssessmentPage && <Footer />}
      </div>
    </div>
  );
}
