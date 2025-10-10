// src/components/notifications/InvitationNotification.js
'use client';

import { useState } from 'react';
import BaseNotification from './BaseNotification';
import { useRouter } from 'next/navigation';
import { FaCheck, FaTimes, FaArrowRight, FaSpinner } from 'react-icons/fa';

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
        
        if (data.vacationId) {
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
    if (notification.data?.status === 'accepted') {
      return (
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 px-3 py-2 border border-gray-300 rounded-md">
            <FaCheck className="w-3 h-3" />
            <span>Принято</span>
          </div>
          {notification.data?.vacationId && (
            <button
              onClick={handleGoToVacation}
              className="flex items-center space-x-2 text-sm bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors font-normal"
            >
              <span>Перейти к отпуску</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    }

    if (notification.data?.status === 'rejected') {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 px-3 py-2 border border-gray-300 rounded-md">
          <FaTimes className="w-3 h-3" />
          <span>Приглашение отклонено</span>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex items-center space-x-2 text-sm bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors font-normal disabled:opacity-50"
        >
          {isLoading ? (
            <FaSpinner className="w-3 h-3 animate-spin" />
          ) : (
            <FaCheck className="w-3 h-3" />
          )}
          <span>{isLoading ? 'Загрузка...' : 'Принять'}</span>
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex items-center space-x-2 text-sm bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors font-normal disabled:opacity-50"
        >
          {isLoading ? (
            <FaSpinner className="w-3 h-3 animate-spin" />
          ) : (
            <FaTimes className="w-3 h-3" />
          )}
          <span>{isLoading ? 'Загрузка...' : 'Отклонить'}</span>
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
