// src/app/profile/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileVacations from '@/components/profile/ProfileVacations';
import ProfilePosts from '@/components/profile/ProfilePosts';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userId = params.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setError('Пользователь не найден');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка загрузки профиля');
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setError('Ошибка сети при загрузке профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
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

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Профиль не найден</h2>
            <p className="text-gray-600">Пользователь не существует или профиль скрыт</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Хедер профиля */}
        <ProfileHeader 
          profile={profile} 
          onEdit={() => setIsEditModalOpen(true)}
          onUpdate={handleProfileUpdate}
        />

        {/* Навигация по вкладкам */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex">
              {[
                { id: 'posts', label: 'Новости', icon: '📝' },
                { id: 'vacations', label: 'Отпуски', icon: '🏖️' },
                { id: 'achievements', label: 'Достижения', icon: '🏆' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Контент вкладок */}
          <div className="mb-8">
            {activeTab === 'posts' && (
              <ProfilePosts profile={profile} onUpdate={fetchProfile} />
            )}
            {activeTab === 'vacations' && (
              <ProfileVacations profile={profile} />
            )}
            {activeTab === 'achievements' && (
              <ProfileAchievements profile={profile} />
            )}
          </div>
        </div>

        {/* Модальное окно редактирования профиля */}
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
