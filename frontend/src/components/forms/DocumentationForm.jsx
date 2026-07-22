import React, { useRef, useState } from 'react';

export default function DocumentationForm({ data = {}, onChange }) {
  const [activeField, setActiveField] = useState(null);
  const fileInputRef = useRef(null);

  const handleFocus = (field) => setActiveField(field);
  const handleBlur = () => setActiveField(null);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onChange('whitepaperName', file ? file.name : '');
    onChange('whitepaperFile', file || null);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg lg:p-xl shadow-sm transition-all">
      <div className="mb-xl">
        <h2 className="font-headline-md text-headline-md mb-xs text-on-surface">
          Documentation &amp; Purpose
        </h2>
        <p className="text-on-surface-variant font-body-md">
          Provide high-level context about the AI system's intended use and design philosophy.
        </p>
      </div>

      <form className="space-y-xl">
        {/* System Name */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'systemName' ? 'translateX(4px)' : 'none' }}
        >
          <div className="flex items-center gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              System Name
            </label>
            <span
              className="material-symbols-outlined text-outline text-[16px] cursor-help"
              title="The formal marketing or technical name of the AI service."
            >
              info
            </span>
          </div>
          <input
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder="e.g. CognitiveFlow v2.1"
            type="text"
            value={data.systemName || ''}
            onFocus={() => handleFocus('systemName')}
            onBlur={handleBlur}
            onChange={(e) => onChange('systemName', e.target.value)}
          />
        </div>

        {/* Intended Use Case & Scope */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'intendedUse' ? 'translateX(4px)' : 'none' }}
        >
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Intended Use Case &amp; Scope
          </label>
          <textarea
            className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-body-md"
            placeholder="Describe the specific business problem this AI system is designed to solve..."
            rows={4}
            value={data.intendedUse || ''}
            onFocus={() => handleFocus('intendedUse')}
            onBlur={handleBlur}
            onChange={(e) => onChange('intendedUse', e.target.value)}
          />
        </div>

        {/* Deployment Environment */}
        <div
          className="space-y-sm transition-transform duration-200"
          style={{ transform: activeField === 'deploymentEnv' ? 'translateX(4px)' : 'none' }}
        >
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Deployment Environment
          </label>
          <div className="relative">
            <select
              className="w-full p-md bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer text-on-surface text-body-md"
              value={data.deploymentEnv || 'Cloud-based (Public)'}
              onFocus={() => handleFocus('deploymentEnv')}
              onBlur={handleBlur}
              onChange={(e) => onChange('deploymentEnv', e.target.value)}
            >
              <option>Cloud-based (Public)</option>
              <option>On-premises / Private Cloud</option>
              <option>Edge Device / Mobile</option>
              <option>Hybrid Environment</option>
            </select>
            <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Technical Whitepaper File Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-40 w-full overflow-hidden p-lg bg-surface border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
          />
          <span className="material-symbols-outlined text-outline group-hover:text-primary text-[32px] mb-sm">
            upload_file
          </span>
          <p className="font-body-md font-bold mb-xs text-on-surface">Upload Technical Whitepaper</p>
          <p className="text-label-md text-on-surface-variant">PDF, DOCX up to 10MB</p>
          {data.whitepaperName && (
            <div className="mt-md max-w-full px-md py-xs bg-primary-container/20 text-primary rounded-full text-label-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span className="min-w-0 truncate" title={data.whitepaperName}>
                {data.whitepaperName}
              </span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
