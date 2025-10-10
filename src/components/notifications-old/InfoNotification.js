// src/components/notifications/InfoNotification.js
'use client';

import BaseNotification from './BaseNotification';

export default function InfoNotification({ notification, onMarkAsRead }) {
  return (
    <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
      {!notification.isRead && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Прочитано
        </button>
      )}
    </BaseNotification>
  );
}
