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
  const [isParticipationLoading, setIsParticipationLoading] = useState(false);
  const [userParticipation, setUserParticipation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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
        setEditForm({
          title: data.title,
          description: data.description || '',
          date: data.date.split('T')[0],
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          type: data.type,
          status: data.status,
          priority: data.priority,
          cost: data.cost || '',
          notes: data.notes || '',
          locationName: data.location?.name || '',
          locationAddress: data.location?.address || '',
          bannerImage: data.bannerImage || ''
        });
        
        if (user && data.participants) {
          const userPart = data.participants.find(p => p.user.id === user.id);
          setUserParticipation(userPart);
        }
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
      setError('Ошибка сети при загрузки активности');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipation = async (going) => {
    if (isParticipationLoading || !user) return;
    
    setIsParticipationLoading(true);
    try {
      const response = await fetch(`/api/activities/${params.activityId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ going }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setUserParticipation(result.participation);
        await fetchActivity();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка участия в активности');
      }
    } catch (error) {
      console.error('❌ Ошибка участия:', error);
      alert('Ошибка сети при участии в активности');
    } finally {
      setIsParticipationLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editForm.title.trim()) {
      errors.title = 'Название активности обязательно';
    }
    
    const hasLocationName = editForm.locationName.trim();
    const hasLocationAddress = editForm.locationAddress.trim();
    
    if (hasLocationName && !hasLocationAddress) {
      errors.locationAddress = 'Если указано название места, адрес также обязателен';
    }
    
    if (!hasLocationName && hasLocationAddress) {
      errors.locationName = 'Если указан адрес, название места также обязательно';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (isSaving) return;
    
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('date', editForm.date);
      formData.append('type', editForm.type);
      formData.append('status', editForm.status);
      formData.append('priority', editForm.priority);
      formData.append('startTime', editForm.startTime);
      formData.append('endTime', editForm.endTime);
      formData.append('cost', editForm.cost);
      formData.append('notes', editForm.notes);
      formData.append('locationName', editForm.locationName);
      formData.append('locationAddress', editForm.locationAddress);

      if (editForm.bannerImage instanceof File) {
        formData.append('bannerImage', editForm.bannerImage);
      } else if (editForm.bannerImage === '') {
        formData.append('bannerImage', 'remove');
      }

      const response = await fetch(`/api/activities/${params.activityId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const updatedActivity = await response.json();
        setActivity(updatedActivity);
        setIsEditing(false);
        setBannerPreview(null);
        setFormErrors({});
        
        if (user && updatedActivity.participants) {
          const userPart = updatedActivity.participants.find(p => p.user.id === user.id);
          setUserParticipation(userPart);
        }
        
        alert('Активность успешно обновлена!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка обновления активности');
      }
    } catch (error) {
      console.error('❌ Ошибка обновления активности:', error);
      alert('Ошибка сети при обновлении активности');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (name === 'locationName' && formErrors.locationAddress) {
      setFormErrors(prev => ({
        ...prev,
        locationAddress: ''
      }));
    }
    
    if (name === 'locationAddress' && formErrors.locationName) {
      setFormErrors(prev => ({
        ...prev,
        locationName: ''
      }));
    }
    
    if (name === 'bannerImage' && files && files[0]) {
      const file = files[0];
      setEditForm(prev => ({
        ...prev,
        bannerImage: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveBanner = () => {
    setEditForm(prev => ({
      ...prev,
      bannerImage: ''
    }));
    setBannerPreview(null);
  };

  const openInYandexMaps = (address) => {
    if (!address) return;
    
    const query = encodeURIComponent(address);
    const url = `https://yandex.ru/maps/?text=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const goingParticipants = activity?.participants?.filter(p => p.status === 'GOING') || [];
  const notGoingParticipants = activity?.participants?.filter(p => p.status === 'NOT_GOING') || [];

  const canEdit = activity && user && (
    activity.vacation?.userId === user.id || 
    activity.vacation?.members?.some(m => m.userId === user.id && m.role === 'CO_ORGANIZER')
  );

  const getUserParticipationStatus = () => {
    if (!user || !activity?.participants) return null;
    return activity.participants.find(p => p.user.id === user.id);
  };

  const currentUserParticipation = getUserParticipationStatus();

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
        {activity.bannerImage && (
          <div className="h-64 w-full bg-gray-200 overflow-hidden">
            <img
              src={activity.bannerImage}
              alt={`Баннер активности ${activity.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`bg-white border-b border-gray-200 ${!activity.bannerImage ? 'pt-4' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
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
                        <span className="text-gray-600">
                          {activity.location.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 -mb-px overflow-x-auto">
                {[
                  { id: 'info', label: 'Информация', icon: 'ℹ️' },
                  { id: 'gallery', label: 'Фотографии', icon: '📸' },
                  { id: 'participants', label: 'Участники', icon: '👥' },
                  ...(canEdit ? [{ id: 'edit', label: 'Редактировать', icon: '✏️' }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== 'edit' && isEditing) {
                        setIsEditing(false);
                        setBannerPreview(null);
                        setFormErrors({});
                      }
                    }}
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
                    {tab.id === 'participants' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {goingParticipants.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Участие в активности
                    </h3>
                    <p className="text-gray-600">
                      {goingParticipants.length > 0 
                        ? `${goingParticipants.length} человек участвуют` 
                        : 'Пока никто не участвует'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {currentUserParticipation?.status === 'GOING' ? (
                      <button
                        onClick={() => handleParticipation(false)}
                        disabled={isParticipationLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm"
                      >
                        {isParticipationLoading ? (
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span className="text-base">✅</span>
                            <span>Я участвую</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleParticipation(true)}
                        disabled={isParticipationLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm"
                      >
                        {isParticipationLoading ? (
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

                {goingParticipants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Участвуют:</span>
                      <div className="flex -space-x-2">
                        {goingParticipants.slice(0, 5).map((participant) => (
                          <div 
                            key={participant.user.id}
                            className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
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

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Детали</h3>
                    
                    {activity.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Местоположение</h4>
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-medium text-sm">{activity.location.name}</p>
                              {activity.location.address && (
                                <div className="mt-1">
                                  <p className="text-gray-600 text-sm mb-2">{activity.location.address}</p>
                                  <button
                                    onClick={() => openInYandexMaps(activity.location.address)}
                                    className="inline-flex items-center space-x-1.5 text-emerald-600 hover:text-emerald-700 transition-colors text-xs font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200"
                                    title="Открыть в Яндекс Картах"
                                  >
                                    <span>Открыть в Яндекс Картах</span>
                                    <svg 
                                      className="w-3.5 h-3.5" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Заметки</h4>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-600 text-sm">{activity.notes}</p>
                        </div>
                      </div>
                    )}
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
                    fetchActivity();
                  }}
                  onCancel={() => setShowUpload(false)}
                />
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Участники ({activity.participants?.length || 0})
                </h3>
                
                <div className="flex items-center space-x-3">
                  {currentUserParticipation?.status === 'GOING' ? (
                    <button
                      onClick={() => handleParticipation(false)}
                      disabled={isParticipationLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm"
                    >
                      {isParticipationLoading ? (
                        <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="text-base">✅</span>
                          <span>Я участвую</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleParticipation(true)}
                      disabled={isParticipationLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm"
                    >
                      {isParticipationLoading ? (
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
              
              {activity.participants && activity.participants.length > 0 ? (
                <div className="space-y-4">
                  {goingParticipants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Участвуют ({goingParticipants.length})
                      </h4>
                      <div className="space-y-2">
                        {goingParticipants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
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
                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                              Участвует
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {notGoingParticipants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Не участвуют ({notGoingParticipants.length})
                      </h4>
                      <div className="space-y-2">
                        {notGoingParticipants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
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
                            <span className="text-gray-600 bg-gray-200 px-2 py-1 rounded-full text-xs">
                              Не участвует
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="mb-4">Пока нет участников</p>
                  <button
                    onClick={() => handleParticipation(true)}
                    disabled={isParticipationLoading}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
                  >
                    Стать первым участником
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && canEdit && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Редактировать активность</h3>
                {isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setBannerPreview(null);
                      setFormErrors({});
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-sm font-medium"
                  >
                    Отменить редактирование
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                    }}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Баннер активности
                    </label>
                    <div className="space-y-4">
                      {(activity.bannerImage || bannerPreview) && (
                        <div className="relative">
                          <img
                            src={bannerPreview || activity.bannerImage}
                            alt="Баннер активности"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveBanner}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Удалить баннер"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        name="bannerImage"
                        onChange={handleEditChange}
                        accept="image/*"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500">
                        Рекомендуемый размер: 1200x400px. Форматы: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название активности *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          formErrors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Тип активности *
                      </label>
                      <select
                        name="type"
                        value={editForm.type}
                        onChange={handleEditChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="FLIGHT">✈️ Перелет</option>
                        <option value="HOTEL">🏨 Отель</option>
                        <option value="RESTAURANT">🍽️ Ресторан</option>
                        <option value="ATTRACTION">🏛️ Достопримечательность</option>
                        <option value="TRANSPORTATION">🚗 Транспорт</option>
                        <option value="EVENT">🎭 Мероприятие</option>
                        <option value="ACTIVITY">🎯 Активность</option>
                        <option value="SHOPPING">🛍️ Шоппинг</option>
                        <option value="BEACH">🏖️ Пляж</option>
                        <option value="HIKING">🥾 Поход</option>
                        <option value="MUSEUM">🖼️ Музей</option>
                        <option value="CONCERT">🎵 Концерт</option>
                        <option value="SPORTS">⚽ Спорт</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Дата *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Статус
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="PLANNED">📅 Запланировано</option>
                        <option value="CONFIRMED">✅ Подтверждено</option>
                        <option value="IN_PROGRESS">🔄 В процессе</option>
                        <option value="COMPLETED">🏁 Завершено</option>
                        <option value="CANCELLED">❌ Отменено</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Время начала
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={editForm.startTime}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Время окончания
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={editForm.endTime}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Приоритет
                      </label>
                      <select
                        name="priority"
                        value={editForm.priority}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="LOW">🔴 Низкий</option>
                        <option value="MEDIUM">🟡 Средний</option>
                        <option value="HIGH">🟢 Высокий</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Стоимость (₽)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={editForm.cost}
                        onChange={handleEditChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Местоположение
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      value={editForm.locationName}
                      onChange={handleEditChange}
                      placeholder="Название места"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2 ${
                        formErrors.locationName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.locationName && (
                      <p className="mt-1 text-sm text-red-600 mb-2">{formErrors.locationName}</p>
                    )}
                    <input
                      type="text"
                      name="locationAddress"
                      value={editForm.locationAddress}
                      onChange={handleEditChange}
                      placeholder="Адрес"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        formErrors.locationAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.locationAddress && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.locationAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Заметки
                    </label>
                    <textarea
                      name="notes"
                      value={editForm.notes}
                      onChange={handleEditChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setBannerPreview(null);
                        setFormErrors({});
                      }}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleEditSubmit}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                          <span>Сохранение...</span>
                        </>
                      ) : (
                        <span>Сохранить изменения</span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Нажмите "Редактировать" чтобы изменить данные активности
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
