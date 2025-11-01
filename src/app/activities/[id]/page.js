// src/app/activities/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ActivityDetails from '@/components/vacation/ActivityDetails';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchActivity();
    }
  }, [params.id]);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/activities/${params.id}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setActivity(data);
      } else if (response.status === 404) {
        setError('Активность не найдена');
      } else if (response.status === 401) {
        setError('Необходима авторизация');
      } else if (response.status === 403) {
        setError('У вас нет доступа к этой активности');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка загрузки активности');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки активности:', error);
      setError('Ошибка сети при загрузке активности');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityEmoji = (type) => {
    const emojis = {
      FLIGHT: '✈️',
      HOTEL: '🏨',
      RESTAURANT: '🍽️',
      ATTRACTION: '🏛️',
      TRANSPORTATION: '🚗',
      EVENT: '🎪',
      ACTIVITY: '🎯',
      SHOPPING: '🛍️',
      BEACH: '🏖️',
      HIKING: '🥾',
      MUSEUM: '🏛️',
      CONCERT: '🎵',
      SPORTS: '⚽'
    };
    return emojis[type] || '📅';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка активности...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
              >
                Назад
              </button>
            </div>
          </div>
        ) : !activity ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Активность не найдена</h2>
              <button 
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
              >
                Назад
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => router.back()}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Назад"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl font-bold text-gray-900 truncate flex items-center space-x-2">
                        <span className="text-2xl">{getActivityEmoji(activity.type)}</span>
                        <span>{activity.title}</span>
                      </h1>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <p className="text-gray-600 text-sm">
                          {new Date(activity.date).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} • {new Date(activity.date).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {activity.vacation?.title && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {activity.vacation.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - используем наш компонент ActivityDetails */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ActivityDetails 
                vacationId={activity.vacationId} 
                activityId={params.id} 
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
