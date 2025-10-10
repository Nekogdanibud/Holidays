// src/components/notifications/BaseNotification.js
'use client';

import { FaBell, FaEnvelope, FaComments, FaInfoCircle } from 'react-icons/fa';

export default function BaseNotification({ notification, onMarkAsRead, children }) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'invitation':
        return {
          bg: 'bg-gray-25 border-gray-200',
          icon: <FaEnvelope className="w-4 h-4 text-gray-600" />,
          text: 'text-gray-900'
        };
      case 'activity_update':
        return {
          bg: 'bg-gray-25 border-gray-200',
          icon: <FaBell className="w-4 h-4 text-gray-600" />,
          text: 'text-gray-900'
        };
      case 'memory_comment':
        return {
          bg: 'bg-gray-25 border-gray-200',
          icon: <FaComments className="w-4 h-4 text-gray-600" />,
          text: 'text-gray-900'
        };
      default:
        return {
          bg: 'bg-gray-25 border-gray-200',
          icon: <FaInfoCircle className="w-4 h-4 text-gray-600" />,
          text: 'text-gray-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${styles.bg} ${!notification.isRead ? 'border-l-2 border-l-gray-400' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className={`mt-1 flex-shrink-0 ${notification.isRead ? 'opacity-50' : 'opacity-100'}`}>
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-sm font-medium ${styles.text}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">
            {notification.message}
          </p>

          {children}

          <p className="text-xs text-gray-500 mt-2">
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
