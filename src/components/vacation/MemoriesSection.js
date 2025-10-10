// src/components/vacation/MemoriesSection.js
'use client';

import { useState, useEffect } from 'react';

export default function MemoriesSection({ vacation, preview = false }) {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Временно заглушка
    setMemories([]);
    setIsLoading(false);
  }, [vacation.id]);

  const displayedMemories = preview ? memories.slice(0, 6) : memories;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Воспоминания</h2>
        {preview && memories.length > 6 && (
          <button className="text-emerald-600 hover:text-emerald-500 font-medium">
            Все воспоминания →
          </button>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📸</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Пока нет воспоминаний
          </h3>
          <p className="text-gray-600 mb-6">
            Начните добавлять фотографии, чтобы сохранить моменты вашего отпуска
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedMemories.map((memory, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative bg-gray-100 flex items-center justify-center"
            >
              <span className="text-2xl">📷</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
