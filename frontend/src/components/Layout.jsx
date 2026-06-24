import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ activePage, onNavigate, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      {/* Fixed Sidebar */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface relative h-screen">
        {/* Header */}
        <Header activePage={activePage} onNavigate={onNavigate} />

        {/* Main Canvas Scroll Area */}
        <main className="flex-1 overflow-y-auto p-lg lg:p-xl pb-24 space-y-lg">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
