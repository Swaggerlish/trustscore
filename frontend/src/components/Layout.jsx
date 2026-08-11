import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ activePage, latestAssessment, onNavigate, children }) {
  const isAssessmentPage = activePage === 'assessment';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = (page) => {
    onNavigate(page);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      {/* Fixed Sidebar */}
      <Sidebar activePage={activePage} onNavigate={navigate} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface relative h-screen">
        {/* Header */}
        <Header
          activePage={activePage}
          latestAssessment={latestAssessment}
          onNavigate={navigate}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Main Canvas Scroll Area */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-md sm:p-lg lg:p-xl space-y-lg ${isAssessmentPage ? 'pb-24 lg:pb-36' : 'pb-lg lg:pb-24'}`}>
          {children}
        </main>

        {/* Footer */}
        {!isAssessmentPage && <Footer />}
      </div>
    </div>
  );
}
