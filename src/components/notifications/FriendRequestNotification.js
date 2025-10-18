'use client';

import { useState } from 'react';
import BaseNotification from './BaseNotification';

export default function FriendRequestNotification({ notification, onMarkAsRead, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(notification.data?.status || 'pending');

  const handleAccept = async () => {
    if (!notification.data?.requestId) {
      console.error('❌ Нет requestId в данных уведомления');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📤 Отправляем запрос на принятие дружбы:', notification.data.requestId);

      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requestId: notification.data.requestId, 
          accept: true 
        }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📥 Ответ от сервера:', data);

      if (response.ok) {
        setStatus('accepted');
        // Помечаем уведомление как прочитанное
        await onMarkAsRead(notification.id);
        // Обновляем список уведомлений
        if (onUpdate) onUpdate();
        
        // Показываем сообщение об успехе
        console.log('✅ Запрос дружбы принят!');
      } else {
        console.error('❌ Ошибка принятия запроса:', data.message);
        alert(data.message || 'Ошибка принятия запроса');
      }
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!notification.data?.requestId) {
      console.error('❌ Нет requestId в данных уведомления');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📤 Отправляем запрос на отклонение дружбы:', notification.data.requestId);

      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requestId: notification.data.requestId, 
          accept: false 
        }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📥 Ответ от сервера:', data);

      if (response.ok) {
        setStatus('rejected');
        // Помечаем уведомление как прочитанное
        await onMarkAsRead(notification.id);
        // Обновляем список уведомлений
        if (onUpdate) onUpdate();
        
        console.log('❌ Запрос дружбы отклонен');
      } else {
        console.error('❌ Ошибка отклонения запроса:', data.message);
        alert(data.message || 'Ошибка отклонения запроса');
      }
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  // Если статус уже обработан, показываем соответствующий текст
  if (status === 'accepted') {
    return (
      <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
        <div className="flex items-center space-x-2 text-sm text-green-600 px-3 py-2 border border-green-300 rounded-md bg-green-50 mt-2">
          <span>✅ Запрос принят</span>
        </div>
      </BaseNotification>
    );
  }

  if (status === 'rejected') {
    return (
      <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
        <div className="flex items-center space-x-2 text-sm text-red-600 px-3 py-2 border border-red-300 rounded-md bg-red-50 mt-2">
          <span>❌ Запрос отклонен</span>
        </div>
      </BaseNotification>
    );
  }

  return (
    <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
      <div className="flex space-x-2 mt-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
          ) : null}
          {isLoading ? 'Принятие...' : 'Принять'}
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-t-2 border-gray-500 rounded-full animate-spin mr-2"></div>
          ) : null}
          {isLoading ? 'Отклонение...' : 'Отклонить'}
        </button>
      </div>
    </BaseNotification>
  );
}
