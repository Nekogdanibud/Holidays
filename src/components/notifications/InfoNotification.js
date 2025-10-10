// src/components/notifications/InfoNotification.js
'use client';

import BaseNotification from './BaseNotification';
import { FaCheck } from 'react-icons/fa';

export default function InfoNotification({ notification, onMarkAsRead }) {
  return (
    <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
      {!notification.isRead && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="flex items-center space-x-2 text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-normal"
        >
          <FaCheck className="w-3 h-3" />
          <span>Прочитано</span>
        </button>
      )}
    </BaseNotification>
  );
}
