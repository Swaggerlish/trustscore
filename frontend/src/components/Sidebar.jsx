import React from 'react';

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'assessment', label: 'Assessments', icon: 'assignment_turned_in' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <>
    {isOpen && <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-outline-variant bg-surface-container px-md py-lg transition-transform duration-200 dark:border-outline dark:bg-surface-container-low lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="mb-xl flex items-start justify-between px-sm">
        <div>
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-inverse-on-surface">
          ProcureScore
        </h1>
        <p className="font-label-md text-label-md opacity-70">Enterprise Tier</p>
        </div>
        <button onClick={onClose} className="p-1 text-on-surface-variant lg:hidden" aria-label="Close navigation"><span className="material-symbols-outlined">close</span></button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-sm">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-md p-md transition-all rounded-lg text-left ${
                isActive
                  ? 'text-primary dark:text-primary-fixed-dim font-bold bg-secondary-container dark:bg-on-secondary-fixed-variant scale-[0.98]'
                  : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="mt-auto pt-lg border-t border-outline-variant flex items-center gap-md px-sm">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden">
          <img
            alt="User Avatar"
            className="w-full h-full object-cover"
            src="/avatar.jpg"
          />
        </div>
        <div className="overflow-hidden">
          <p className="font-body-md text-body-md font-bold truncate">Abiodun Akindipe</p>
          <p className="font-label-md text-label-md opacity-70 truncate">Procurement Officer</p>
        </div>
      </div>
    </aside>
    </>
  );
}
