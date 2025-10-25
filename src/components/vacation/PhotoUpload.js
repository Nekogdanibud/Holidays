// src/components/vacation/PhotoUpload.js
'use client';

import { useState, useRef } from 'react';

export default function PhotoUpload({
  vacationId,
  captureType,
  activityId,
  onUpload,
  onCancel,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Проверка количества файлов
    if (files.length > 10) {
      alert('Можно загрузить не более 10 фотографий за раз');
      return;
    }

    // Проверка типа и размера файлов
    const validFiles = files.filter(f => {
      const isImage = f.type.startsWith('image/');
      const isSizeValid = f.size <= 10 * 1024 * 1024; // 10MB
      return isImage && isSizeValid;
    });

    if (validFiles.length !== files.length) {
      alert('Некоторые файлы не являются изображениями или превышают размер 10 МБ');
    }

    setSelectedFiles(validFiles);
    
    // Создаем preview URLs
    const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(newPreviewUrls);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('vacationId', vacationId);
    
    // Добавляем параметры типа загрузки
    if (captureType) {
      formData.append('captureType', captureType);
    }
    if (activityId) {
      formData.append('activityId', activityId);
    }
    
    // Добавляем файлы
    selectedFiles.forEach(f => formData.append('photos', f));

    try {
      const response = await fetch('/api/memories/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Успешно загружено ${data.memories.length} фото!`);
        onUpload?.(data.memories);
      } else {
        alert(data.message || 'Ошибка загрузки');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка сети при загрузке');
    } finally {
      setIsUploading(false);
      clearAll();
    }
  };

  const removeFile = (index) => {
    // Освобождаем URL preview
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    // Освобождаем все preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUploadTitle = () => {
    if (captureType === 'DAILY_MOMENT') return 'Запечатлеть момент дня';
    if (captureType === 'ACTIVITY_MOMENT') return 'Запечатлеть момент активности';
    if (activityId) return 'Добавить фото к активности';
    return 'Добавить фото в галерею';
  };

  const getUploadDescription = () => {
    if (captureType) {
      return 'Яркие моменты имеют ограничения по количеству для сохранения ценности каждого кадра';
    }
    return 'Обычные фото можно загружать без ограничений по количеству';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getUploadTitle()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {getUploadDescription()}
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Область загрузки */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 cursor-pointer bg-gray-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="text-4xl mb-4 text-gray-400">📸</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">
          Выберите фотографии
        </div>
        <div className="text-sm text-gray-500 mb-1">
          Перетащите файлы или нажмите для выбора
        </div>
        <div className="text-xs text-gray-400">
          Максимум 10 файлов, до 10 МБ каждый
        </div>
      </div>

      {/* Preview выбранных файлов */}
      {previewUrls.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700">
              Выбрано файлов: {selectedFiles.length}
            </h4>
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 transition-colors"
            >
              Очистить все
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img 
                    src={url} 
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{selectedFiles[index].name}</div>
                  <div>{(selectedFiles[index].size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedFiles.length} файлов для загрузки
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                disabled={isUploading}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <span>Загрузить</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
