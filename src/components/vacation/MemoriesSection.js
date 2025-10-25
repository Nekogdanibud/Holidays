// src/components/vacation/MemoriesSection.js
'use client';

import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload.js';

export default function MemoriesSection({ vacation, preview = false }) {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [vacation.id]);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vacations/${vacation.id}/memories`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemoryUpload = (newMemories) => {
    setMemories(prev => [...newMemories, ...prev]);
    setShowUpload(false);
    setTimeout(() => {
      fetchMemories();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Воспоминания</h2>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayedMemories = preview ? memories.slice(0, 6) : memories;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Воспоминания {!preview && `(${memories.length})`}
        </h2>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 text-sm font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Добавить фото</span>
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">Camera</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Пока нет воспоминаний
          </h3>
          <p className="text-gray-600 mb-6">
            Добавьте первые фотографии вашего отпуска
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
          >
            + Добавить фото
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedMemories.map((memory) => (
            <div
              key={memory.id}
              className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative bg-gray-100"
            >
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="mt-6">
          <PhotoUpload 
            vacationId={vacation.id}
            onUpload={handleMemoryUpload}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}
    </div>
  );
}
