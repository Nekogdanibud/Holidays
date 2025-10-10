// src/components/notifications/BaseNotification.js
'use client';

export default function BaseNotification({ notification, onMarkAsRead, children }) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'invitation':
        return {
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
          text: 'text-blue-700'
        };
      case 'activity_update':
        return {
          bg: 'bg-green-50 border-green-200',
          dot: 'bg-green-500',
          text: 'text-green-700'
        };
      case 'memory_comment':
        return {
          bg: 'bg-purple-50 border-purple-200',
          dot: 'bg-purple-500',
          text: 'text-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          dot: 'bg-gray-500',
          text: 'text-gray-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${styles.bg} ${!notification.isRead ? 'border-l-4' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${styles.dot} ${notification.isRead ? 'opacity-50' : ''}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-sm font-semibold ${styles.text}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {notification.message}
          </p>

          {/* Действия передаются как children */}
          {children}

          <p className="text-xs text-gray-400 mt-2">
            {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
