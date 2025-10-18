// src/app/profile/[usertag]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileVacations from '@/components/profile/ProfileVacations';
import ProfilePosts from '@/components/profile/ProfilePosts';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

// Компонент вкладок
function ProfileTabs({ activeTab, onTabChange, profile }) {
  const tabs = [
    { id: 'posts', label: 'Записи', count: profile.posts?.length || 0 },
    { id: 'vacations', label: 'Отпуски', count: profile.vacations?.length || 0 },
    { id: 'achievements', label: 'Достижения' },
    { id: 'about', label: 'О себе' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Компонент информации "О себе"
function AboutTab({ profile }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">О себе</h2>
      
      <div className="space-y-6">
        {/* Биография */}
        {profile.bio && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Биография</h3>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Местоположение */}
          {profile.location && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Местоположение</p>
                <p className="font-medium text-gray-900">{profile.location}</p>
              </div>
            </div>
          )}

          {/* Веб-сайт */}
          {profile.website && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Веб-сайт</p>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}

          {/* Дата регистрации */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">С нами с</p>
              <p className="font-medium text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Статистика */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Активность</p>
              <p className="font-medium text-gray-900">
                {profile.vacations?.length || 0} отпусков • {profile.posts?.length || 0} записей
              </p>
            </div>
          </div>
        </div>

        {/* Если нет информации */}
        {!profile.bio && !profile.location && !profile.website && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">ℹ️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Информация отсутствует</h3>
            <p className="text-gray-600">Пользователь еще не добавил информацию о себе</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // По умолчанию вкладка "Записи"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile?usertag=${params.usertag}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error('Ошибка загрузки профиля');
        }
      } catch (error) {
        console.error('Ошибка сети:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.usertag) {
      fetchProfile();
    }
  }, [params.usertag]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'posts':
        return <ProfilePosts profile={profile} onUpdate={handleProfileUpdate} />;
      case 'vacations':
        return <ProfileVacations profile={profile} />;
      case 'achievements':
        return <ProfileAchievements profile={profile} />;
      case 'about':
        return <AboutTab profile={profile} />;
      default:
        return <ProfilePosts profile={profile} onUpdate={handleProfileUpdate} />;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Профиль не найден</h1>
            <p className="text-gray-600">Пользователь с таким usertag не существует</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader 
          profile={profile} 
          onEdit={() => setIsEditModalOpen(true)}
          onUpdate={handleProfileUpdate}
        />
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Вкладки */}
          <ProfileTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            profile={profile}
          />
          
          {/* Контент вкладки */}
          <div className="py-8">
            {renderTabContent()}
          </div>
        </div>

        {/* Модальное окно редактирования */}
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </ProtectedRoute>
  );
}
