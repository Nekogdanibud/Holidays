// src/components/profile/ProfileHeader.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileHeader({ profile, onEdit, onUpdate }) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;

  // Если есть загруженный баннер - используем его, иначе градиент
  const bannerStyle = profile.banner 
    ? { backgroundImage: `url(${profile.banner})` }
    : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  // Роль пользователя
  const getUserRole = () => {
    const vacationCount = profile.vacations?.length || 0;
    
    if (vacationCount >= 5) {
      return { label: '🚀 Опытный путешественник', color: 'bg-purple-100 text-purple-800' };
    }
    if (vacationCount >= 2) {
      return { label: '✈️ Путешественник', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: '👋 Новый участник', color: 'bg-gray-100 text-gray-800' };
  };

  const userRole = getUserRole();

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Баннер */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div 
          className="h-48 rounded-xl border-4 border-white shadow-lg bg-cover bg-center bg-no-repeat"
          style={bannerStyle}
        >
          {/* Если нет баннера, показываем градиент */}
          {!profile.banner && (
            <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-opacity-80">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Аватар и основная информация */}
        <div className="flex flex-col items-center -mt-20">
          
          {/* Аватар */}
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Имя и шильдик */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.name}
            </h1>
            
            {/* Шильдик роли */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userRole.color}`}>
              <span>{userRole.label}</span>
            </div>
          </div>

          {/* Кнопка редактирования */}
          {isOwnProfile && (
            <button
              onClick={onEdit}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium shadow mb-6"
            >
              Редактировать профиль
            </button>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="border-t border-gray-200 pt-6 pb-8">
          
          {/* Контактная информация */}
          <div className="flex flex-wrap gap-4 justify-center mb-4 text-sm text-gray-600">
            {profile.location && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Сайт
                </a>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>С {new Date(profile.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>

          {/* Био */}
          {profile.bio && (
            <div className="bg-gray-50 rounded-lg p-4 text-center max-w-2xl mx-auto">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
