// src/components/vacation/ActivityDetails.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ActivityDetails({ vacationId, activityId }) {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [isGoing, setIsGoing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityDetails();
  }, [vacationId, activityId]);

  const fetchActivityDetails = async () => {
    try {
      setLoading(true);
      console.log('🔄 Загрузка деталей активности:', activityId);
      
      const response = await fetch(`/api/activities/${activityId}`, { 
        credentials: 'include' 
      });

      if (response.ok) {
        const activityData = await response.json();
        console.log('📦 Данные активности:', {
          title: activityData.title,
          participants: activityData.participants,
          goingCount: activityData.goingCount,
          goingParticipants: activityData.goingParticipants
        });
        
        setActivity(activityData);
        
        // Проверяем участие текущего пользователя
        const userParticipation = activityData.participants?.find(
          p => p.user.id === user?.id
        );
        const userIsGoing = userParticipation?.status === 'GOING';
        setIsGoing(userIsGoing);
        
        console.log('👤 Статус участия пользователя:', {
          userId: user?.id,
          isGoing: userIsGoing,
          participation: userParticipation
        });
      } else {
        console.error('❌ Ошибка загрузки активности:', response.status);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки активности:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipation = async (going) => {
    if (isLoading || !user) return;
    
    console.log('🎯 Изменение участия:', { going, userId: user.id });
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/activities/${activityId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ going }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Участие обновлено:', result);
        setIsGoing(going);
        // Обновляем данные активности
        fetchActivityDetails();
      } else {
        const error = await response.json();
        console.error('❌ Ошибка обновления участия:', error);
      }
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-32 mb-6"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="text-gray-500">Активность не найдена</div>
      </div>
    );
  }

  // Разделяем участников
  const goingParticipants = activity.participants?.filter(p => p.status === 'GOING') || [];
  const notGoingParticipants = activity.participants?.filter(p => p.status === 'NOT_GOING') || [];

  console.log('📊 Рендеринг компонента:', {
    goingParticipants,
    notGoingParticipants,
    isGoing,
    user: user?.id
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Заголовок и кнопка участия */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getTypeEmoji(activity.type)}</span>
            <h1 className="text-2xl font-bold">{activity.title}</h1>
          </div>
          <p className="text-gray-600">
            {new Date(activity.date).toLocaleDateString('ru-RU')} 
            {activity.location?.name && ` • ${activity.location.name}`}
          </p>
        </div>
        
        {/* Кнопка участия - ВСЕГДА показываем */}
        <div className="flex items-center space-x-2">
          {isGoing ? (
            <button
              onClick={() => handleParticipation(false)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm min-w-[100px] justify-center"
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
              onClick={() => handleParticipation(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm min-w-[100px] justify-center"
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

      {/* Информация об участниках */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Участники: {activity.goingCount || 0}
            </h3>
            <p className="text-sm text-gray-600">
              {goingParticipants.length > 0 
                ? `${goingParticipants.length} человек идут` 
                : 'Пока никто не участвует'
              }
            </p>
          </div>
          
          {/* Дублирующая кнопка участия */}
          <div className="flex items-center space-x-2">
            {isGoing ? (
              <button
                onClick={() => handleParticipation(false)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
              >
                <span className="text-base">👤</span>
                <span>Иду</span>
              </button>
            ) : (
              <button
                onClick={() => handleParticipation(true)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
              >
                <span className="text-base">➕</span>
                <span>Участвовать</span>
              </button>
            )}
          </div>
        </div>

        {/* Аватары участников (только тех, кто идет) */}
        {goingParticipants.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Идут:</span>
              <div className="flex -space-x-2">
                {goingParticipants.slice(0, 5).map((participant) => (
                  <div 
                    key={participant.user.id}
                    className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium"
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
              {goingParticipants.length > 5 && (
                <span className="text-xs text-gray-400">
                  +{goingParticipants.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Детальная информация об участниках */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Все участники</h3>
        
        {/* Участники, которые идут */}
        {goingParticipants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Идут ({goingParticipants.length})
            </h4>
            <div className="space-y-2">
              {goingParticipants.map((participant) => (
                <div key={participant.user.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium">
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
                    <span className="font-medium">{participant.user.name}</span>
                  </div>
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                    Идет
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Участники, которые не идут */}
        {notGoingParticipants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Не идут ({notGoingParticipants.length})
            </h4>
            <div className="space-y-2">
              {notGoingParticipants.map((participant) => (
                <div key={participant.user.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
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
                    <span className="font-medium">{participant.user.name}</span>
                  </div>
                  <span className="text-gray-600 bg-gray-200 px-2 py-1 rounded-full text-xs">
                    Не идет
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Если нет участников вообще */}
        {activity.participants?.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm mb-3">Пока никто не участвует в активности</p>
            <button
              onClick={() => handleParticipation(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 text-sm font-medium mx-auto"
            >
              <span className="text-base">➕</span>
              <span>Стать первым участником</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
