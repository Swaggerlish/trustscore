import React from 'react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-low dark:bg-surface-container-lowest text-primary dark:text-primary-fixed-dim font-label-md text-label-md border-t border-outline-variant dark:border-outline shadow-sm z-40">
      <div className="flex justify-between items-center px-xl py-md opacity-85 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-md">
          <span className="font-bold text-on-surface">AI PROCUREMENT</span>
          <span className="text-on-surface-variant opacity-70">
            &copy; 2024 Enterprise AI Procurement. Trust Score: Verified.
          </span>
        </div>
        <div className="flex gap-xl text-on-surface-variant font-medium">
          <a className="hover:underline" href="#support">Support</a>
          <a className="hover:underline" href="#privacy">Privacy Policy</a>
          <a className="hover:underline" href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
