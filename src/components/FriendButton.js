// src/components/FriendButton.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function FriendButton({ targetUserId }) {
  const { user } = useAuth();
  const [friendshipStatus, setFriendshipStatus] = useState('none'); // none, pending, friends
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFriendshipStatus();
  }, [targetUserId, user]);

  const checkFriendshipStatus = async () => {
    if (!user || !targetUserId) return;

    try {
      const response = await fetch(`/api/friends/status?targetUserId=${targetUserId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFriendshipStatus(data.status);
      }
    } catch (error) {
      console.error('Ошибка проверки статуса дружбы:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: targetUserId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setFriendshipStatus('pending');
      } else {
        alert(data.message || 'Ошибка отправки запроса');
      }
    } catch (error) {
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  // Не показывать кнопку если это свой профиль или пользователь не авторизован
  if (!user || user.id === targetUserId) {
    return null;
  }

  const getButtonConfig = () => {
    switch (friendshipStatus) {
      case 'friends':
        return {
          text: 'Друзья',
          className: 'bg-green-500 text-white',
          disabled: true
        };
      case 'pending':
        return {
          text: 'Запрос отправлен',
          className: 'bg-gray-500 text-white',
          disabled: true
        };
      default:
        return {
          text: 'Добавить в друзья',
          className: 'bg-blue-500 text-white hover:bg-blue-600',
          onClick: sendFriendRequest
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <button
      onClick={buttonConfig.onClick}
      disabled={isLoading || buttonConfig.disabled}
      className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
        buttonConfig.className
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Отправка...' : buttonConfig.text}
    </button>
  );
}
