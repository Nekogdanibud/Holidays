// src/components/vacation/MemoryGrid.js
'use client';

import { useState, memo } from 'react';

const MemoryGrid = memo(({ memories = [], showBadge = false, onPhotoClick }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoads, setImageLoads] = useState({});

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
    validMemories: validMemories.length
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
    if (!imageUrl) return '/placeholder-image.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/')) {
      return `/uploads/memories/${imageUrl}`;
    }
    return imageUrl;
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

  const handlePhotoClick = (memory, index) => {
    console.log('🖱️ MemoryGrid: Клик по фото', {
      index,
      memoryId: memory?.id,
      memoryTitle: memory?.title,
      onPhotoClickExists: !!onPhotoClick,
      totalMemories: validMemories.length
    });
    
    if (onPhotoClick && typeof onPhotoClick === 'function') {
      try {
        onPhotoClick(memory, validMemories, index);
      } catch (error) {
        console.error('❌ Ошибка в onPhotoClick:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {validMemories.map((memory, index) => {
        if (!memory || typeof memory !== 'object') {
          console.error('❌ Некорректный memory объект:', memory);
          return null;
        }

        const imageUrl = getImageUrl(memory.imageUrl);
        const hasError = imageErrors[memory.id];
        const hasLoaded = imageLoads[memory.id];
        
        return (
          <div
            key={memory.id || `memory-${index}`}
            className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => handlePhotoClick(memory, index)}
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
                
                {/* Loading state */}
                {!hasLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-1">📷</div>
                      <div className="text-xs">Загрузка...</div>
                    </div>
                  </div>
                )}

                {/* Бейдж для capture-фото */}
                {showBadge && memory.captureType && hasLoaded && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                    ⭐
                  </div>
                )}

                {/* Hover overlay */}
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

MemoryGrid.displayName = 'MemoryGrid';

export default MemoryGrid;
