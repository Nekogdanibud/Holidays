export default function ActivityHeader({ activity, onBack, canEdit }) {
  const getTypeEmoji = (type) => {
    const emojis = {
      FLIGHT: '✈️',
      HOTEL: '🏨',
      RESTAURANT: '🍽️',
      ATTRACTION: '🏛️',
      TRANSPORTATION: '🚗',
      EVENT: '🎭',
      ACTIVITY: '🎯',
      SHOPPING: '🛍️',
      BEACH: '🏖️',
      HIKING: '🥾',
      MUSEUM: '🖼️',
      CONCERT: '🎵',
      SPORTS: '⚽'
    };
    return emojis[type] || '📅';
  };

  return (
    <>
      {activity.bannerImage && (
        <div className="h-64 w-full bg-gray-200 overflow-hidden">
          <img
            src={activity.bannerImage}
            alt={`Баннер активности ${activity.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`bg-white border-b border-gray-200 ${!activity.bannerImage ? 'pt-4' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Назад к отпуску"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{getTypeEmoji(activity.type)}</span>
                  <h1 className="text-xl font-bold text-gray-900 truncate">{activity.title}</h1>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                  <span>
                    {new Date(activity.date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                  {activity.startTime && (
                    <>
                      <span>•</span>
                      <span>
                        {activity.startTime.substring(0, 5)}
                        {activity.endTime && ` - ${activity.endTime.substring(0, 5)}`}
                      </span>
                    </>
                  )}
                  {activity.location && (
                    <>
                      <span>•</span>
                      <span className="text-gray-600">
                        {activity.location.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
