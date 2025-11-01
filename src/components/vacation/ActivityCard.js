// src/components/vacation/ActivityCard.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ActivityCard({ activity, vacationId }) {
  const { user } = useAuth();
  const [isGoing, setIsGoing] = useState(false);
  const [goingCount, setGoingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [participationLoading, setParticipationLoading] = useState(true);

  // Загружаем статус участия при монтировании
  useEffect(() => {
    fetchParticipationStatus();
  }, [activity.id, user?.id]);

  const fetchParticipationStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/activities/${activity.id}/participate`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsGoing(data.isGoing);
        setGoingCount(data.goingParticipantsCount);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса участия:', error);
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleParticipation = async (going) => {
    if (isLoading || !user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ going }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsGoing(going);
        setGoingCount(data.goingParticipantsCount);
      }
    } catch (error) {
      console.error('Ошибка участия:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      PLANNED: 'bg-blue-50 text-blue-700 border-blue-200',
      CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
      IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      COMPLETED: 'bg-gray-50 text-gray-700 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-gray-50 text-gray-700 border-gray-200',
      MEDIUM: 'bg-gray-50 text-gray-700 border-gray-200',
      HIGH: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Если еще загружается статус участия, показываем скелетон
  if (participationLoading) {
    return (
      <div className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <Link 
      href={`/vacations/${vacationId}/activities/${activity.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0">
            {getTypeEmoji(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
              {activity.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">
                {new Date(activity.date).toLocaleDateString('ru-RU')}
              </span>
              {activity.startTime && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {formatTime(activity.startTime)}
                    {activity.endTime && ` - ${formatTime(activity.endTime)}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activity.status)}`}>
            {activity.status === 'PLANNED' && 'Запланировано'}
            {activity.status === 'CONFIRMED' && 'Подтверждено'}
            {activity.status === 'IN_PROGRESS' && 'В процессе'}
            {activity.status === 'COMPLETED' && 'Завершено'}
            {activity.status === 'CANCELLED' && 'Отменено'}
          </span>
          
          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
            {activity.priority === 'LOW' && 'Низкий'}
            {activity.priority === 'MEDIUM' && 'Средний'}
            {activity.priority === 'HIGH' && 'Высокий'}
          </span>
        </div>
      </div>

      {activity.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {activity.description}
        </p>
      )}

      {/* Участники и стоимость */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1" title={`${goingCount} участников`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{goingCount}</span>
          </div>

          {activity.cost && (
            <div className="flex items-center space-x-1" title="Стоимость">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{parseFloat(activity.cost).toFixed(2)}</span>
            </div>
          )}

          {activity.memories && activity.memories.length > 0 && (
            <div className="flex items-center space-x-1" title="Фотографии">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{activity.memories.length}</span>
            </div>
          )}
        </div>

        {/* Спокойные кнопки участия */}
        <div className="flex items-center space-x-2">
          {isGoing ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleParticipation(false);
              }}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm min-w-[100px] justify-center"
              title="Отменить участие"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-t-2 border-gray-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-base">👤</span>
                  <span>Иду</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleParticipation(true);
              }}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm min-w-[100px] justify-center"
              title="Участвовать в активности"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-t-2 border-gray-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-base">➕</span>
                  <span>Участвовать</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Список участников (опционально) */}
      {activity.participants && activity.participants.filter(p => p.status === 'GOING').length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Идут:</span>
            <div className="flex -space-x-2">
              {activity.participants
                .filter(p => p.status === 'GOING')
                .slice(0, 5)
                .map((participant) => (
                  <div 
                    key={participant.user.id}
                    className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium"
                    title={participant.user.name}
                  >
                    {participant.user.avatar ? (
                      <img
                        src={participant.user.avatar}
                        alt={participant.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      participant.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
            </div>
            {activity.participants.filter(p => p.status === 'GOING').length > 5 && (
              <span className="text-xs text-gray-400">
                +{activity.participants.filter(p => p.status === 'GOING').length - 5}
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
