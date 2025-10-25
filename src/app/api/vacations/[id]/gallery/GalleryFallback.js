// src/components/vacation/GalleryFallback.js
'use client';

export default function GalleryFallback({ error, onRetry }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Не удалось загрузить галерею
        </h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-red-700 text-sm font-mono break-words">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition duration-200 font-semibold"
          >
            Попробовать снова
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-semibold"
          >
            Обновить страницу
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Если проблема сохраняется, проверьте:</p>
          <ul className="mt-2 space-y-1">
            <li>• Подключение к интернету</li>
            <li>• Доступность изображений</li>
            <li>• Консоль браузера для деталей</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
