// src/components/vacation/SmartGallery.js
'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import MemoryGrid from './MemoryGrid';
import PhotoViewerModal from '../activities/PhotoViewerModal';

const SmartGallery = memo(({ vacationId }) => {
  const [view, setView] = useState('all');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoViewer, setPhotoViewer] = useState({
    isOpen: false,
    initialIndex: 0,
    memories: []
  });

  const fetchGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/vacations/${vacationId}/gallery?view=${view}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('❌ Ошибка загрузки галереи:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [vacationId, view]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Функция для получения ВСЕХ фотографий для просмотрщика
  const getAllMemoriesForViewer = useCallback(() => {
    if (!data) return [];

    const allMemories = [];
    const seenIds = new Set();
    
    // Обычные фото по дням
    if (data.memories?.byDay) {
      Object.values(data.memories.byDay).forEach(dayMemories => {
        if (Array.isArray(dayMemories)) {
          dayMemories.forEach(memory => {
            if (memory?.id && !seenIds.has(memory.id)) {
              seenIds.add(memory.id);
              allMemories.push(memory);
            }
          });
        }
      });
    }
    
    // Фото из активностей
    if (data.memories?.byActivity) {
      Object.values(data.memories.byActivity).forEach(activityData => {
        if (activityData?.memories && Array.isArray(activityData.memories)) {
          activityData.memories.forEach(memory => {
            if (memory?.id && !seenIds.has(memory.id)) {
              seenIds.add(memory.id);
              allMemories.push(memory);
            }
          });
        }
      });
    }

    // Яркие моменты (прямой массив)
    if (data.memories?.memories && Array.isArray(data.memories.memories)) {
      data.memories.memories.forEach(memory => {
        if (memory?.id && !seenIds.has(memory.id)) {
          seenIds.add(memory.id);
          allMemories.push(memory);
        }
      });
    }
    
    return allMemories;
  }, [data]);

  // Обработчик клика по фотографии
  const handlePhotoClick = useCallback((memory, contextMemories = [], contextIndex = 0) => {
    try {
      // Для просмотрщика используем ВСЕ фотографии из всех источников
      const memoriesForViewer = getAllMemoriesForViewer();
      
      // Находим индекс в общем массиве
      let initialIndex = memoriesForViewer.findIndex(m => m?.id === memory?.id);
      
      if (initialIndex === -1) {
        initialIndex = contextIndex;
      }
      
      // МОМЕНТАЛЬНОЕ ОТКРЫТИЕ - сразу показываем модальное окно
      setPhotoViewer({
        isOpen: true,
        initialIndex,
        memories: memoriesForViewer
      });
    } catch (error) {
      console.error('❌ Ошибка при открытии фотографии:', error);
    }
  }, [getAllMemoriesForViewer]);

  // Получение данных для отображения в текущей вкладке
  const getDisplayData = useCallback(() => {
    if (!data) return null;

    try {
      switch (view) {
        case 'all':
          return {
            type: 'byDay',
            data: data.memories?.byDay || {}
          };
        
        case 'capture':
          if (data.memories?.memories && Array.isArray(data.memories.memories)) {
            return {
              type: 'capture',
              data: {
                'capture-moments': {
                  title: 'Яркие моменты',
                  memories: data.memories.memories
                }
              }
            };
          }
          
          const captureActivities = {};
          if (data.memories?.byActivity) {
            Object.entries(data.memories.byActivity).forEach(([activityId, activityData]) => {
              const captureMemories = activityData?.memories?.filter(memory => 
                memory?.captureType && 
                (memory.captureType === 'DAILY_MOMENT' || memory.captureType === 'ACTIVITY_MOMENT') &&
                memory.activityId === activityData.id
              );
              
              if (captureMemories?.length > 0) {
                captureActivities[activityId] = {
                  ...activityData,
                  memories: captureMemories
                };
              }
            });
          }
          
          return {
            type: 'byActivity',
            data: captureActivities
          };
        
        case 'activities':
          // ВКЛАДКА "ПО ПЛАНАМ" - ВСЕ фото активностей (обычные + яркие моменты)
          const activitiesData = {};
          
          if (data.memories?.byActivity) {
            Object.entries(data.memories.byActivity).forEach(([activityId, activityData]) => {
              if (activityData?.memories && Array.isArray(activityData.memories)) {
                // Берем ВСЕ фото активности (обычные + яркие моменты)
                const allActivityMemories = activityData.memories.filter(memory => 
                  memory && memory.activityId === activityData.id
                );
                
                if (allActivityMemories.length > 0) {
                  activitiesData[activityId] = {
                    ...activityData,
                    memories: allActivityMemories
                  };
                }
              }
            });
          }
          
          return {
            type: 'byActivity',
            data: activitiesData
          };
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Ошибка при формировании данных отображения:', error);
      return null;
    }
  }, [data, view]);

  const getViewTitle = useCallback(() => {
    switch (view) {
      case 'all': return 'Все фотографии';
      case 'capture': return 'Яркие моменты';
      case 'activities': return 'По планам';
      default: return 'Галерея';
    }
  }, [view]);

  const getTotalCount = useCallback(() => {
    if (!data) return 0;

    try {
      switch (view) {
        case 'all':
          return data.total || 0;
        
        case 'capture':
          if (data.memories?.memories && Array.isArray(data.memories.memories)) {
            return data.memories.memories.length;
          }
          
          if (data.memories?.byActivity) {
            return Object.values(data.memories.byActivity)
              .reduce((total, activityData) => {
                const captureMemories = activityData?.memories?.filter(m => 
                  m?.captureType && 
                  (m.captureType === 'DAILY_MOMENT' || m.captureType === 'ACTIVITY_MOMENT') &&
                  m.activityId === activityData.id
                );
                return total + (captureMemories?.length || 0);
              }, 0);
          }
          return 0;
        
        case 'activities':
          if (data.memories?.byActivity) {
            return Object.values(data.memories.byActivity)
              .reduce((total, activityData) => total + (activityData?.memories?.length || 0), 0);
          }
          return 0;
        
        default:
          return 0;
      }
    } catch (error) {
      console.error('Ошибка при подсчете фотографий:', error);
      return 0;
    }
  }, [data, view]);

  // Функция для рендеринга контента
  const renderContent = useCallback(() => {
    const displayData = getDisplayData();
    const totalCount = getTotalCount();

    if (totalCount === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              {view === 'all' ? '🖼️' : view === 'capture' ? '⭐' : '📅'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {view === 'all' && 'Пока нет фотографий'}
            {view === 'capture' && 'Пока нет ярких моментов'}
            {view === 'activities' && 'Пока нет фото в планах'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {view === 'all' && 'Начните добавлять фотографии в ваш отпуск'}
            {view === 'capture' && 'Запечатлейте первые яркие моменты вашего отпуска'}
            {view === 'activities' && 'Добавьте фотографии к активностям'}
          </p>
        </div>
      );
    }

    // Все фотографии - по дням
    if (view === 'all' && displayData?.type === 'byDay') {
      return (
        <div className="space-y-8">
          {Object.entries(displayData.data).map(([date, dayMemories]) => (
            <div key={date} className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                {new Date(date).toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <MemoryGrid 
                memories={Array.isArray(dayMemories) ? dayMemories : []} 
                showBadge={true}
                onPhotoClick={handlePhotoClick}
              />
            </div>
          ))}
        </div>
      );
    }

    // Яркие моменты
    if (view === 'capture' && displayData?.type === 'capture') {
      const activities = Object.entries(displayData.data);
      
      return (
        <div className="space-y-8">
          {activities.map(([activityId, activityData]) => (
            <div key={activityId} className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                {activityData?.title || 'Яркие моменты'} 
                <span className="text-sm text-gray-500 ml-2">
                  ({activityData?.memories?.length || 0} фото)
                </span>
              </h3>
              {activityData?.memories && activityData.memories.length > 0 ? (
                <MemoryGrid 
                  memories={activityData.memories} 
                  showBadge={true}
                  onPhotoClick={handlePhotoClick}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Нет фотографий
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Активности (обычные + яркие моменты)
    if ((view === 'activities' || view === 'capture') && displayData?.type === 'byActivity') {
      const activities = Object.entries(displayData.data);
      
      if (activities.length === 0) {
        return (
          <div className="text-center py-12">
            <div className="text-gray-500">
              Нет данных для отображения
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          {activities.map(([activityId, activityData]) => (
            <div key={activityData.id} className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                {activityData?.title || 'Без названия'} 
                <span className="text-sm text-gray-500 ml-2">
                  ({activityData?.memories?.length || 0} {view === 'capture' ? 'ярких фото' : 'фото'})
                </span>
              </h3>
              {activityData?.memories && activityData.memories.length > 0 ? (
                <MemoryGrid 
                  memories={activityData.memories} 
                  showBadge={true}
                  onPhotoClick={handlePhotoClick}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Нет фотографий в этой активности
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-12 text-gray-500">
        Не удалось загрузить данные
      </div>
    );
  }, [getDisplayData, getTotalCount, view, handlePhotoClick]);

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-red-600 py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Ошибка загрузки галереи</h3>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={fetchGallery}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-gray-500 py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📸</span>
          </div>
          <p>Не удалось загрузить галерею</p>
        </div>
      </div>
    );
  }

  const totalCount = getTotalCount();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {getViewTitle()} ({totalCount})
        </h2>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Все фото', icon: '🖼️' },
            { id: 'capture', label: 'Яркие моменты', icon: '⭐' },
            { id: 'activities', label: 'По планам', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                view === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {renderContent()}

      {/* Модальное окно просмотра фотографий */}
      {photoViewer.isOpen && (
        <PhotoViewerModal
          memories={photoViewer.memories}
          initialIndex={photoViewer.initialIndex}
          onClose={() => setPhotoViewer({ isOpen: false, initialIndex: 0, memories: [] })}
        />
      )}
    </div>
  );
});

SmartGallery.displayName = 'SmartGallery';

export default SmartGallery;
