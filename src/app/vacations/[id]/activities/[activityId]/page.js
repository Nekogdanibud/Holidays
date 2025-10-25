// src/app/vacations/[id]/activities/[activityId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PhotoUpload from '@/components/vacation/PhotoUpload';
import MemoryGrid from '@/components/vacation/MemoryGrid';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (params.id && params.activityId) {
      fetchActivity();
    }
  }, [params.id, params.activityId]);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/activities/${params.activityId}`, {
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка активности...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !activity) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
            <p className="text-gray-600 mb-6">{error || 'Активность не найдена'}</p>
            <button 
              onClick={() => router.push(`/vacations/${params.id}`)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
            >
              Вернуться к отпуску
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push(`/vacations/${params.id}`)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Назад к отпуску"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{getTypeEmoji(activity.type)}</span>
                  <h1 className="text-xl font-bold text-gray-900 truncate">{activity.title}</h1>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                  <span>
                    {new Date(activity.date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                  {activity.startTime && (
                    <>
                      <span>•</span>
                      <span>
                        {activity.startTime.substring(0, 5)}
                        {activity.endTime && ` - ${activity.endTime.substring(0, 5)}`}
                      </span>
                    </>
                  )}
                  {activity.location && (
                    <>
                      <span>•</span>
                      <span>{activity.location.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 -mb-px overflow-x-auto">
                {[
                  { id: 'info', label: 'Информация', icon: 'ℹ️' },
                  { id: 'gallery', label: 'Фотографии', icon: '📸' },
                  { id: 'participants', label: 'Участники', icon: '👥' }
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
                    {tab.id === 'gallery' && activity.memories && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {activity.memories.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Основная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>
                  
                  {activity.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Описание</h4>
                      <p className="text-gray-600">{activity.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Статус</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        activity.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        activity.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status === 'PLANNED' && 'Запланировано'}
                        {activity.status === 'CONFIRMED' && 'Подтверждено'}
                        {activity.status === 'IN_PROGRESS' && 'В процессе'}
                        {activity.status === 'COMPLETED' && 'Завершено'}
                        {activity.status === 'CANCELLED' && 'Отменено'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Приоритет</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.priority === 'LOW' ? 'bg-red-100 text-red-800' :
                        activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activity.priority === 'LOW' && 'Низкий'}
                        {activity.priority === 'MEDIUM' && 'Средний'}
                        {activity.priority === 'HIGH' && 'Высокий'}
                      </span>
                    </div>
                  </div>

                  {activity.cost && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Стоимость</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(activity.cost).toFixed(2)} ₽
                      </p>
                    </div>
                  )}
                </div>

                {/* Дополнительная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Детали</h3>
                  
                  {activity.location && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Местоположение</h4>
                      <p className="text-gray-600">{activity.location.name}</p>
                      {activity.location.address && (
                        <p className="text-sm text-gray-500">{activity.location.address}</p>
                      )}
                    </div>
                  )}

                  {activity.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Заметки</h4>
                      <p className="text-gray-600">{activity.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Участники</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {activity.participants.slice(0, 3).map((participant, index) => (
                          <div
                            key={participant.user.id}
                            className={`w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white ${
                              index > 0 ? '-ml-2' : ''
                            }`}
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
                      {activity.participants.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{activity.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Фотографии активности ({activity.memories?.length || 0})
                  </h3>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowUpload(true)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 text-sm font-medium flex items-center space-x-2"
                    >
                      <span>📸</span>
                      <span>Добавить фото</span>
                    </button>
                    <button 
                      onClick={() => setShowUpload(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium flex items-center space-x-2"
                    >
                      <span>⭐</span>
                      <span>Яркий момент</span>
                    </button>
                  </div>
                </div>

                {activity.memories && activity.memories.length > 0 ? (
                  <MemoryGrid memories={activity.memories} showBadge={true} />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📸</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Пока нет фотографий
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Добавьте первые фотографии этой активности
                    </p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
                    >
                      + Добавить фото
                    </button>
                  </div>
                )}
              </div>

              {showUpload && (
                <PhotoUpload
                  vacationId={params.id}
                  activityId={params.activityId}
                  onUpload={() => {
                    setShowUpload(false);
                    fetchActivity(); // Обновляем данные
                  }}
                  onCancel={() => setShowUpload(false)}
                />
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Участники ({activity.participants?.length || 0})
              </h3>
              
              {activity.participants && activity.participants.length > 0 ? (
                <div className="space-y-3">
                  {activity.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
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
                        <div>
                          <div className="font-medium text-gray-900">{participant.user.name}</div>
                          <div className="text-sm text-gray-500">@{participant.user.usertag}</div>
                        </div>
                      </div>
                      
                      <div className={`text-sm px-3 py-1 rounded-full ${
                        participant.status === 'GOING' ? 'bg-green-100 text-green-800' :
                        participant.status === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {participant.status === 'GOING' && 'Участвует'}
                        {participant.status === 'MAYBE' && 'Возможно'}
                        {participant.status === 'NOT_GOING' && 'Не участвует'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Пока нет участников
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
