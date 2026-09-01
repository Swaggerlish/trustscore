import React, { useMemo, useState } from 'react';

export default function Header({ activePage, latestAssessment, onNavigate, onMenuClick }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const notifications = useMemo(
    () => buildNotifications(latestAssessment),
    [latestAssessment]
  );
  const unreadCount = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id)
  ).length;

  const toggleNotifications = () => {
    setIsNotificationsOpen((isOpen) => !isOpen);
  };

  const markAllRead = () => {
    setReadNotificationIds(notifications.map((notification) => notification.id));
  };
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
      <div className="flex h-16 w-full items-center justify-between px-md sm:px-lg lg:px-xl transition-all duration-200">
        {/* Title and Search */}
        <div className="flex min-w-0 flex-1 items-center gap-sm sm:gap-lg">
          <button onClick={onMenuClick} className="shrink-0 p-2 text-on-surface-variant lg:hidden" aria-label="Open navigation"><span className="material-symbols-outlined">menu</span></button>
          <span className="truncate font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
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
        <div className="ml-sm flex shrink-0 items-center gap-xs sm:ml-lg sm:gap-md lg:gap-lg">
          <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-all duration-200 relative"
            aria-expanded={isNotificationsOpen}
            aria-label="Open notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="fixed inset-x-md top-16 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
              <div className="flex items-center justify-between gap-md border-b border-outline-variant px-lg py-md">
                <div>
                  <h3 className="font-body-md font-bold text-on-surface">Notifications</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    {unreadCount ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                <button
                  onClick={markAllRead}
                  className="font-label-md text-label-md font-bold text-primary hover:underline"
                >
                  Mark read
                </button>
              </div>
              <div className="divide-y divide-outline-variant">
                {notifications.map((notification) => {
                  const isUnread = !readNotificationIds.includes(notification.id);
                  return (
                    <button
                      key={notification.id}
                      onClick={() => {
                        setReadNotificationIds((ids) => [...new Set([...ids, notification.id])]);
                        if (notification.target) {
                          onNavigate(notification.target);
                          setIsNotificationsOpen(false);
                        }
                      }}
                      className="w-full p-lg text-left hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-start gap-md">
                        <span className={`material-symbols-outlined mt-xs ${notification.colorClass}`}>
                          {notification.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-md">
                            <p className="font-body-md text-body-md font-bold text-on-surface">
                              {notification.title}
                            </p>
                            {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-error"></span>}
                          </div>
                          <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
                            {notification.body}
                          </p>
                          <p className="mt-sm font-label-md text-label-md text-outline">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </div>
          <button className="hidden p-2 text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-all duration-200 sm:block">
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {activePage === 'dashboard' && (
            <button
              onClick={() => onNavigate('assessment')}
              className="hidden bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all items-center gap-sm md:flex"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>
                add
              </span>
              New Assessment
            </button>
          )}

          <div className="hidden w-8 h-8 rounded-full overflow-hidden bg-primary ml-sm border border-outline-variant sm:flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function buildNotifications(latestAssessment) {
  const notifications = [
    {
      id: 'system-ready',
      title: 'ProcureScore workspace ready',
      body: 'Run an assessment to generate live dashboard and report updates.',
      time: 'Now',
      icon: 'rocket_launch',
      colorClass: 'text-primary',
      target: 'assessment'
    }
  ];

  if (latestAssessment) {
    const risk = latestAssessment.riskLevel || 'Limited risk';
    notifications.unshift({
      id: `assessment-${latestAssessment.name}-${latestAssessment.date}`,
      title: 'Assessment evaluated',
      body: `${latestAssessment.name} returned ${latestAssessment.score}% with ${risk}.`,
      time: latestAssessment.date || 'Just now',
      icon: risk === 'High risk' || risk === 'Unacceptable risk' ? 'warning' : 'verified',
      colorClass: risk === 'High risk' || risk === 'Unacceptable risk' ? 'text-error' : 'text-primary',
      target: 'reports'
    });
  }

  return notifications;
}
