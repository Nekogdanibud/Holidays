// src/components/vacation/DebugImages.js
'use client';

import { useState } from 'react';

export default function DebugImages({ memories }) {
  const [testResults, setTestResults] = useState([]);

  const testImageUrls = async () => {
    console.log('🧪 Начинаем тестирование URL изображений...');
    
    const results = await Promise.all(
      memories.map(async (memory) => {
        const getImageUrl = (imageUrl) => {
          if (!imageUrl) return null;
          if (imageUrl.startsWith('http')) return imageUrl;
          if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/')) {
            return `/uploads/memories/${imageUrl}`;
          }
          return imageUrl;
        };

        const imageUrl = getImageUrl(memory.imageUrl);
        const fullUrl = imageUrl?.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
        
        try {
          const response = await fetch(fullUrl, { method: 'HEAD' });
          return {
            memoryId: memory.id,
            originalUrl: memory.imageUrl,
            resolvedUrl: imageUrl,
            fullUrl: fullUrl,
            exists: response.ok,
            status: response.status,
            size: response.headers.get('content-length')
          };
        } catch (error) {
          return {
            memoryId: memory.id,
            originalUrl: memory.imageUrl,
            resolvedUrl: imageUrl,
            fullUrl: fullUrl,
            exists: false,
            error: error.message
          };
        }
      })
    );

    setTestResults(results);
    
    // Логируем результаты
    results.forEach(result => {
      if (result.exists) {
        console.log('✅', result);
      } else {
        console.log('❌', result);
      }
    });
  };

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-800">🐛 Режим отладки изображений</h3>
        <button
          onClick={testImageUrls}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
        >
          Тестировать URL
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {memories.map((memory) => {
          const getImageUrl = (imageUrl) => {
            if (!imageUrl) return '/placeholder-image.jpg';
            if (imageUrl.startsWith('http')) return imageUrl;
            if (!imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('/')) {
              return `/uploads/memories/${imageUrl}`;
            }
            return imageUrl;
          };

          const imageUrl = getImageUrl(memory.imageUrl);
          const testResult = testResults.find(r => r.memoryId === memory.id);

          return (
            <div key={memory.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
              <img
                src={imageUrl}
                alt={memory.title}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                  e.target.classList.add('border-2', 'border-red-500');
                }}
                onLoad={(e) => {
                  e.target.classList.add('border-2', 'border-green-500');
                }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{memory.title}</div>
                <div className="text-xs text-gray-600 truncate">ID: {memory.id}</div>
                <div className="text-xs text-gray-500 truncate" title={memory.imageUrl}>
                  {memory.imageUrl}
                </div>
              </div>

              <div className="text-right">
                {testResult ? (
                  testResult.exists ? (
                    <span className="text-green-600 text-sm">✅ Доступно</span>
                  ) : (
                    <span className="text-red-600 text-sm">❌ Ошибка</span>
                  )
                ) : (
                  <span className="text-gray-500 text-sm">⏳ Не проверено</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {testResults.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Результаты тестирования:</h4>
          <div className="text-sm">
            ✅ Доступно: {testResults.filter(r => r.exists).length} / {testResults.length}
          </div>
          <div className="text-sm">
            ❌ Ошибки: {testResults.filter(r => !r.exists).length} / {testResults.length}
          </div>
        </div>
      )}
    </div>
  );
}
