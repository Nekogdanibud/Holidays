// src/components/vacation/MemoryGrid.js
'use client';

import { useState } from 'react';

export default function MemoryGrid({ memories = [], showBadge = false }) {
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoads, setImageLoads] = useState({});

  // Функция для получения базового URL с учетом кастомного домена
  const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://holidays.breezeway.su';
    }
    
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    return 'http://localhost:3000';
  };

  // Защита от undefined или null
  if (!memories || !Array.isArray(memories)) {
    console.warn('⚠️ MemoryGrid: memories не является массивом:', memories);
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❓</span>
        </div>
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  // Фильтруем некорректные элементы
  const validMemories = memories.filter(memory => 
    memory && 
    typeof memory === 'object' && 
    memory.id && 
    memory.imageUrl
  );

  console.log('🖼️ MemoryGrid данные:', {
    totalMemories: memories.length,
    validMemories: validMemories.length,
    baseUrl: getBaseUrl()
  });

  if (validMemories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📸</span>
        </div>
        <p className="text-gray-600">Пока нет фотографий</p>
      </div>
    );
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return '/placeholder-image.jpg';
    }
    
    // Если уже полный URL - оставляем как есть
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Корректируем относительные пути
    let correctedUrl = imageUrl;
    
    // Добавляем /uploads/memories/ если путь не начинается с /
    if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/')) {
      correctedUrl = `/uploads/memories/${imageUrl}`;
    }
    
    // Формируем полный URL с правильным доменом
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${correctedUrl}`;
    
    return fullUrl;
  };

  const handleImageError = (memoryId, imageUrl) => {
    console.error('❌ Ошибка загрузки изображения:', memoryId, imageUrl);
    setImageErrors(prev => ({ ...prev, [memoryId]: true }));
  };

  const handleImageLoad = (memoryId) => {
    console.log('✅ Изображение загружено:', memoryId);
    setImageLoads(prev => ({ ...prev, [memoryId]: true }));
    setImageErrors(prev => ({ ...prev, [memoryId]: false }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {validMemories.map((memory) => {
        const imageUrl = getImageUrl(memory.imageUrl);
        const hasError = imageErrors[memory.id];
        const hasLoaded = imageLoads[memory.id];
        
        return (
          <div
            key={memory.id}
            className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {!hasError ? (
              <div className="relative w-full h-full">
                {/* Основное изображение */}
                <img
                  src={imageUrl}
                  alt={memory.title || 'Фото из отпуска'}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    hasLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  onError={() => handleImageError(memory.id, imageUrl)}
                  onLoad={() => handleImageLoad(memory.id)}
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Loading state - ТОЛЬКО пока не загрузилось */}
                {!hasLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-1">📷</div>
                      <div className="text-xs">Загрузка...</div>
                    </div>
                  </div>
                )}

                {/* Бейдж для capture-фото - поверх изображения */}
                {showBadge && memory.captureType && hasLoaded && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                    ⭐
                  </div>
                )}

                {/* Hover overlay - ТОЛЬКО при наведении и после загрузки */}
                {hasLoaded && (
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                )}
              </div>
            ) : (
              // Error state
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="text-2xl text-gray-400 mb-2">❌</div>
                <div className="text-xs text-gray-500 text-center">
                  Ошибка загрузки
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center break-all">
                  {memory.imageUrl}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
