// src/app/activities/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const getActivityTypeLabel = (type) => {
    const labels = {
      FLIGHT: 'Перелет',
      HOTEL: 'Отель',
      RESTAURANT: 'Ресторан',
      ATTRACTION: 'Достопримечательность',
      TRANSPORTATION: 'Транспорт',
      EVENT: 'Мероприятие',
      ACTIVITY: 'Активность',
      SHOPPING: 'Шоппинг',
      BEACH: 'Пляж',
      HIKING: 'Поход',
      MUSEUM: 'Музей',
      CONCERT: 'Концерт',
      SPORTS: 'Спорт'
    };
    return labels[type] || 'Активность';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PLANNED: 'Запланировано',
      CONFIRMED: 'Подтверждено',
      IN_PROGRESS: 'В процессе',
      COMPLETED: 'Завершено',
      CANCELLED: 'Отменено'
    };
    return labels[status] || status;
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
                          {formatDate(activity.date)} • {formatTime(activity.date)}
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

                {/* Navigation Tabs */}
                <div className="border-t border-gray-100">
                  <div className="px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 -mb-px overflow-x-auto">
                      {[
                        { id: 'info', label: 'Информация', icon: 'ℹ️' },
                        { id: 'gallery', label: 'Галерея', icon: '📸' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === tab.id
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-base">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {activeTab === 'info' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Основная информация */}
                    <div className="lg:col-span-2 space-y-6">
                      {activity.description && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                          <p className="text-gray-700 whitespace-pre-line">{activity.description}</p>
                        </div>
                      )}

                      {activity.location && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Место</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">{activity.location.name}</h4>
                            {activity.location.address && (
                              <p className="text-gray-600 text-sm mt-1">{activity.location.address}</p>
                            )}
                            {activity.location.description && (
                              <p className="text-gray-600 text-sm mt-2">{activity.location.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {activity.location.rating && (
                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  ⭐ {activity.location.rating}
                                </span>
                              )}
                              {activity.location.priceLevel && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  💰 {activity.location.priceLevel}
                                </span>
                              )}
                              {activity.location.type && (
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {activity.location.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {activity.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Заметки</h3>
                          <p className="text-gray-700 whitespace-pre-line">{activity.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Боковая панель с деталями */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Детали</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Тип</span>
                            <p className="text-gray-900 font-medium">{getActivityTypeLabel(activity.type)}</p>
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">Статус</span>
                            <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                              activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              activity.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              activity.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(activity.status)}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">Приоритет</span>
                            <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                              activity.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {activity.priority === 'HIGH' && '🔴 Высокий'}
                              {activity.priority === 'MEDIUM' && '🟡 Средний'}
                              {activity.priority === 'LOW' && '🟢 Низкий'}
                            </div>
                          </div>

                          {activity.cost && (
                            <div>
                              <span className="text-sm text-gray-500">Стоимость</span>
                              <p className="text-gray-900 font-medium">{parseFloat(activity.cost).toLocaleString('ru-RU')} ₽</p>
                            </div>
                          )}

                          {activity.startTime && (
                            <div>
                              <span className="text-sm text-gray-500">Время</span>
                              <p className="text-gray-900 font-medium">
                                {activity.startTime}
                                {activity.endTime && ` - ${activity.endTime}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Участники */}
                      {activity.participants && activity.participants.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Участники</h4>
                          <div className="space-y-2">
                            {activity.participants.map((participant) => (
                              <div key={participant.id} className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {participant.user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    @{participant.user.usertag}
                                  </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  participant.status === 'GOING' ? 'bg-green-100 text-green-800' :
                                  participant.status === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {participant.status === 'GOING' && 'Идет'}
                                  {participant.status === 'MAYBE' && 'Возможно'}
                                  {participant.status === 'NOT_GOING' && 'Не идет'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Фотографии с мероприятия</h3>
                  
                  {activity.memories && activity.memories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {activity.memories.map((memory) => (
                        <div key={memory.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 group relative">
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                            <div className="p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full bg-gradient-to-t from-black/60 to-transparent">
                              <div className="truncate">{memory.title}</div>
                              <div className="text-xs opacity-80">
                                {new Date(memory.createdAt).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-gray-600">Пока нет фотографий с этого мероприятия</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Фотографии, сделанные в этот день, появятся здесь автоматически
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
