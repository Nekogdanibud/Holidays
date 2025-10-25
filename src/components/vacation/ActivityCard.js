// src/components/vacation/ActivityCard.js
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ActivityCard({ activity, vacationId }) {
  const [participationStatus, setParticipationStatus] = useState(
    activity.participants?.[0]?.status || 'NOT_GOING'
  );

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
      PLANNED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleParticipation = async (status) => {
    try {
      const response = await fetch(`/api/activities/${activity.id}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });

      if (response.ok) {
        setParticipationStatus(status);
      }
    } catch (error) {
      console.error('Ошибка участия:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <Link 
      href={`/vacations/${vacationId}/activities/${activity.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0">
            {getTypeEmoji(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
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
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
            {activity.status === 'PLANNED' && 'Запланировано'}
            {activity.status === 'CONFIRMED' && 'Подтверждено'}
            {activity.status === 'IN_PROGRESS' && 'В процессе'}
            {activity.status === 'COMPLETED' && 'Завершено'}
            {activity.status === 'CANCELLED' && 'Отменено'}
          </span>
          
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(activity.priority)}`}>
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
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{activity.participants?.length || 0}</span>
          </div>

          {activity.cost && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{parseFloat(activity.cost).toFixed(2)}</span>
            </div>
          )}

          {activity.memories && activity.memories.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{activity.memories.length}</span>
            </div>
          )}
        </div>

        {/* Быстрое участие */}
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleParticipation('GOING');
            }}
            className={`p-1 rounded ${
              participationStatus === 'GOING' 
                ? 'bg-green-100 text-green-600' 
                : 'text-gray-400 hover:text-green-600'
            }`}
            title="Участвую"
          >
            ✅
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleParticipation('MAYBE');
            }}
            className={`p-1 rounded ${
              participationStatus === 'MAYBE' 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-600'
            }`}
            title="Возможно"
          >
            ❓
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleParticipation('NOT_GOING');
            }}
            className={`p-1 rounded ${
              participationStatus === 'NOT_GOING' 
                ? 'bg-red-100 text-red-600' 
                : 'text-gray-400 hover:text-red-600'
            }`}
            title="Не участвую"
          >
            ❌
          </button>
        </div>
      </div>
    </Link>
  );
}
