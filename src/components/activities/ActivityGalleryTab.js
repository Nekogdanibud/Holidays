// src/components/activities/ActivityGalleryTab.js
'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import PhotoUpload from '@/components/vacation/PhotoUpload';
import MemoryGrid from '@/components/vacation/MemoryGrid';
import PhotoViewerModal from './PhotoViewerModal';

const ActivityGalleryTab = memo(({ activity, vacationId, activityId, onRefresh }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [photoViewer, setPhotoViewer] = useState({
    isOpen: false,
    initialIndex: 0
  });

  // Теперь activity.memories содержит ТОЛЬКО фото этой активности
  const activityMemories = activity?.memories || [];

  const handlePhotoClick = useCallback((memory, index) => {
    // МОМЕНТАЛЬНОЕ ОТКРЫТИЕ
    setPhotoViewer({
      isOpen: true,
      initialIndex: index
    });
  }, []);

  const handleUploadComplete = useCallback((newMemories) => {
    setShowUpload(false);
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Фотографии активности ({activityMemories.length})
          </h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowUpload(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 text-sm font-medium flex items-center justify-center space-x-2 min-w-[140px]"
            >
              <span>📸</span>
              <span>Добавить фото</span>
            </button>
          </div>
        </div>

        {activityMemories.length > 0 ? (
          <MemoryGrid 
            memories={activityMemories} 
            showBadge={true}
            onPhotoClick={handlePhotoClick}
          />
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
          vacationId={vacationId}
          activityId={activityId}
          onUpload={handleUploadComplete}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Просмотрщик с фотографиями ТОЛЬКО этой активности */}
      {photoViewer.isOpen && (
        <PhotoViewerModal
          memories={activityMemories}
          initialIndex={photoViewer.initialIndex}
          onClose={() => setPhotoViewer({ isOpen: false, initialIndex: 0 })}
        />
      )}
    </div>
  );
});

ActivityGalleryTab.displayName = 'ActivityGalleryTab';

export default ActivityGalleryTab;
