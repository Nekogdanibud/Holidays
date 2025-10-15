// src/components/notifications/BaseNotification.js
'use client';

import { FaBell, FaEnvelope, FaComments, FaInfoCircle } from 'react-icons/fa';

export default function BaseNotification({ notification, onMarkAsRead, children }) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'invitation':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <FaEnvelope className="w-4 h-4 text-blue-600" />,
          text: 'text-blue-900'
        };
      case 'activity_update':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <FaBell className="w-4 h-4 text-green-600" />,
          text: 'text-green-900'
        };
      case 'memory_comment':
        return {
          bg: 'bg-purple-50 border-purple-200',
          icon: <FaComments className="w-4 h-4 text-purple-600" />,
          text: 'text-purple-900'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: <FaInfoCircle className="w-4 h-4 text-gray-600" />,
          text: 'text-gray-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ${styles.bg} ${
      !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 mt-0.5 ${notification.isRead ? 'opacity-60' : 'opacity-100'}`}>
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className={`text-sm font-semibold ${styles.text} line-clamp-1`}>
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
              {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {notification.message}
          </p>

          {children}

          <p className="text-xs text-gray-400 mt-1">
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
