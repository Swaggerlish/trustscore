import React from 'react';

export default function Header({ activePage, onNavigate }) {
  const getTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Vendor Evaluation';
      case 'assessment':
        return 'Assessment Pipeline';
      case 'reports':
        return 'Evaluation Reports';
      case 'settings':
        return 'System Settings';
      default:
        return 'Vendor Evaluation';
    }
  };

  return (
    <header className="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed-dim border-b border-outline-variant dark:border-outline flat no shadows z-40 sticky top-0">
      <div className="flex justify-between items-center h-16 px-xl w-full max-w-max_width ml-auto transition-all duration-200">
        {/* Title and Search */}
        <div className="flex items-center gap-lg flex-1">
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim whitespace-nowrap">
            {getTitle()}
          </span>
          <div className="relative hidden lg:block w-full max-w-md ml-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="pl-10 pr-4 py-1.5 bg-surface-container border border-outline-variant rounded-full w-full focus:ring-2 focus:ring-primary focus:border-primary text-body-md outline-none transition-all text-on-surface"
              placeholder="Search parameters or assessments..."
              type="text"
            />
          </div>
        </div>

        {/* Action icons & User profile info */}
        <div className="flex items-center gap-md lg:gap-lg ml-xl">
          <button className="p-2 text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-all duration-200 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-all duration-200">
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {activePage === 'dashboard' && (
            <button
              onClick={() => onNavigate('assessment')}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>
                add
              </span>
              New Assessment
            </button>
          )}

          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high ml-sm border border-outline-variant">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9AzgKToU2wZn17KHryJ9eUQ9s551NS4bcZaS1pyV2PHLB__DcYo3gj9Cwc92JwI3j9RvRk7Vxr1l0d19I2XqjOeeJ7I7DLXZwADQtYLKCd_kFYVxxnc9EKo5kdwhMdzECIQ-Jta1-nI9vVxRRImo0eBuVL8qYDc6tSbatPT64xAfyFqEy0nadP13FzOW88ZEcUU0tY4sY6t5Sc_aUFsJo2q5LTXr5keQ50k0ZhjzfXuVOXLDaKY2HWmBrkXNam0c1wRPKMiyDVOk"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
