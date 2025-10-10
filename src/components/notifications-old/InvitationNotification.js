// src/components/notifications/InvitationNotification.js
'use client';

import { useState } from 'react';
import BaseNotification from './BaseNotification';
import { useRouter } from 'next/navigation';

export default function InvitationNotification({ notification, onMarkAsRead, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!notification.data?.invitationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invitations/${notification.data.invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accept: true }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        await onMarkAsRead(notification.id);
        if (onUpdate) onUpdate();
        
        // Если есть vacationId, предлагаем перейти
        if (data.vacationId) {
          // Можно показать сообщение или автоматически перейти
          console.log('Приглашение принято! Vacation ID:', data.vacationId);
        }
      } else {
        alert(data.message || 'Ошибка принятия приглашения');
      }
    } catch (error) {
      console.error('Ошибка принятия приглашения:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!notification.data?.invitationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invitations/${notification.data.invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accept: false }),
        credentials: 'include'
      });

      if (response.ok) {
        await onMarkAsRead(notification.id);
        if (onUpdate) onUpdate();
      } else {
        const data = await response.json();
        alert(data.message || 'Ошибка отклонения приглашения');
      }
    } catch (error) {
      console.error('Ошибка отклонения приглашения:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVacation = () => {
    if (notification.data?.vacationId) {
      router.push(`/vacations/${notification.data.vacationId}`);
      onMarkAsRead(notification.id);
    }
  };

  const getActions = () => {
    // Если приглашение уже обработано
    if (notification.data?.status === 'accepted') {
      return (
        <div className="flex space-x-2">
          <span className="text-sm text-green-600 px-3 py-2">Принято</span>
          {notification.data?.vacationId && (
            <button
              onClick={handleGoToVacation}
              className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Перейти к отпуску
            </button>
          )}
        </div>
      );
    }

    if (notification.data?.status === 'rejected') {
      return (
        <span className="text-sm text-red-600 px-3 py-2">
          Приглашение отклонено
        </span>
      );
    }

    // Если приглашение еще не обработано
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? 'Загрузка...' : 'Принять'}
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="text-sm bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? 'Загрузка...' : 'Отклонить'}
        </button>
      </div>
    );
  };

  return (
    <BaseNotification notification={notification} onMarkAsRead={onMarkAsRead}>
      {getActions()}
    </BaseNotification>
  );
}
