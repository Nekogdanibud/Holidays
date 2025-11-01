'use client';

export default function ActivityTabs({ activeTab, onTabChange, activity, canEdit }) {
  const tabs = [
    { 
      id: 'info', 
      label: 'Информация', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'gallery', 
      label: 'Фотографии', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'participants', 
      label: 'Участники', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H9a2 2 0 01-2-2v-1a6 6 0 1112 0v1a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  // ВКЛАДКА "РЕДАКТИРОВАТЬ" — ВСЕГДА, ЕСЛИ canEdit === true
  if (canEdit) {
    tabs.push({
      id: 'edit',
      label: 'Редактировать',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    });
  }

  const getParticipantCount = () => activity?.participants?.filter(p => p.status === 'GOING').length || 0;
  const getPhotoCount = () => activity?.memories?.length || 0;

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 -mb-px overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-t-md
                ${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'gallery' && getPhotoCount() > 0 && (
                <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {getPhotoCount()}
                </span>
              )}
              {tab.id === 'participants' && getParticipantCount() > 0 && (
                <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {getParticipantCount()}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
