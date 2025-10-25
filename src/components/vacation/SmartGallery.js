// src/components/vacation/SmartGallery.js
'use client';

import { useState, useEffect } from 'react';
import MemoryGrid from './MemoryGrid';

export default function SmartGallery({ vacationId }) {
  const [view, setView] = useState('all');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, [vacationId, view]);

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Загрузка галереи:', { vacationId, view });
      
      const response = await fetch(`/api/vacations/${vacationId}/gallery?view=${view}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      console.log('📡 Ответ галереи:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Данные галереи получены:', result);
      
      // Валидация данных
      if (!result || typeof result !== 'object') {
        throw new Error('Некорректный формат данных');
      }
      
      setData(result);
    } catch (error) {
      console.error('❌ Ошибка загрузки галереи:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'all': return 'Все фотографии';
      case 'capture': return 'Яркие моменты';
      case 'activities': return 'По активностям';
      default: return 'Галерея';
    }
  };

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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {getViewTitle()} ({data.total || 0})
        </h2>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'Все', icon: '🖼️' },
            { id: 'capture', label: 'Яркие', icon: '⭐' },
            { id: 'activities', label: 'По активностям', icon: '📅' }
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

      {/* Все фотографии */}
      {view === 'all' && data.memories?.byDay && (
        <div className="space-y-8">
          {Object.entries(data.memories.byDay).map(([date, dayMemories]) => (
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
              />
            </div>
          ))}
        </div>
      )}

      {/* Яркие моменты */}
      {view === 'capture' && data.memories?.memories && (
        <MemoryGrid 
          memories={Array.isArray(data.memories.memories) ? data.memories.memories : []} 
          showBadge={true} 
        />
      )}

      {/* По активностям */}
      {view === 'activities' && data.memories?.byActivity && (
        <div className="space-y-8">
          {Object.entries(data.memories.byActivity).map(([activityId, activityData]) => (
            <div key={activityId} className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                {activityData?.title || 'Без названия'} ({(activityData?.memories && Array.isArray(activityData.memories)) ? activityData.memories.length : 0})
              </h3>
              <MemoryGrid 
                memories={Array.isArray(activityData?.memories) ? activityData.memories : []} 
                showBadge={false} 
              />
            </div>
          ))}
        </div>
      )}

      {(!data.total || data.total === 0) && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📸</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Пока нет фотографий
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {view === 'all' && 'Начните добавлять фотографии в ваш отпуск'}
            {view === 'capture' && 'Запечатлейте первые яркие моменты вашего отпуска'}
            {view === 'activities' && 'Добавьте фотографии к активностям'}
          </p>
        </div>
      )}
    </div>
  );
}
