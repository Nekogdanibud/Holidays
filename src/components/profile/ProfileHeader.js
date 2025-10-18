// src/components/profile/ProfileHeader.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FriendButton from '../FriendButton';
import GroupInfoModal from './GroupInfoModal';

// Компонент бейджа уровня
function LevelBadge({ userGroup, levelProgress, onGroupClick }) {
  if (!userGroup) return null;

  return (
    <div 
      className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${userGroup.color} ${userGroup.bgColor} mb-4 cursor-pointer transition-transform hover:scale-105 relative group`}
      onClick={onGroupClick}
    >
      <span className="mr-2">{userGroup.icon}</span>
      <span>{userGroup.badgeText}</span>
      
      {/* Всплывающая подсказка для кликабельного бейджа */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          ℹ️ Нажмите для информации
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

// Компонент прогресса уровня
function LevelProgress({ levelProgress }) {
  if (!levelProgress) return null;

  // Если группа эксклюзивная, не показываем ничего дополнительного
  if (levelProgress.isExclusive) {
    return null;
  }

  // Обычная логика прогресса
  return (
    <div className="max-w-md mx-auto mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Уровень {levelProgress.currentGroup?.level}</span>
        <span>{levelProgress.currentPoints} очков</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${levelProgress.progress}%` }}
        ></div>
      </div>
      {levelProgress.nextGroup && (
        <div className="text-xs text-gray-500 mt-1">
          До {levelProgress.nextGroup.badgeText}: {levelProgress.pointsToNext} очков
        </div>
      )}
      {!levelProgress.nextGroup && (
        <div className="text-xs text-emerald-600 mt-1 font-medium">
          🏆 Максимальный уровень достигнут!
        </div>
      )}
    </div>
  );
}

// Компонент статистики профиля
function ProfileStats({ profile }) {
  const stats = [
    {
      label: 'Отпусков',
      value: profile.vacations?.length || 0,
      icon: '🏖️'
    },
    {
      label: 'Записей', 
      value: profile.posts?.length || 0,
      icon: '📝'
    },
    {
      label: 'Друзей',
      value: profile.friendCount || 0,
      icon: '👥'
    }
  ];

  return (
    <div className="flex justify-center space-x-6 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-xl font-bold text-gray-900">{stat.value}</span>
          </div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProfileHeader({ profile, onEdit, onUpdate }) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const handleGroupClick = () => {
    setIsGroupModalOpen(true);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="relative">
          {/* Баннер */}
          <div className="w-full aspect-[16/9] rounded-2xl border-4 border-white shadow-lg overflow-hidden">
            {profile.banner ? (
              <img
                src={profile.banner}
                alt="Баннер профиля"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg opacity-80 font-medium">Баннер профиля</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Аватар */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        
        {/* Имя и уровень */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {profile.name}
          </h1>
          
          <p className="text-gray-500 text-lg mb-4">@{profile.usertag}</p>

          {/* Бейдж уровня - кликабельный */}
          <LevelBadge 
            userGroup={profile.userGroup} 
            levelProgress={profile.levelProgress}
            onGroupClick={handleGroupClick}
          />

          {/* Прогресс уровня */}
          <LevelProgress levelProgress={profile.levelProgress} />

          {/* Статистика профиля */}
          <ProfileStats profile={profile} />
        </div>

        {/* Краткая био */}
        {profile.bio && (
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          {isOwnProfile && (
            <button
              onClick={onEdit}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Редактировать профиль</span>
            </button>
          )}
          {!isOwnProfile && (
            <FriendButton targetUserId={profile.id} />
          )}
        </div>
      </div>

      {/* Модальное окно информации о группе */}
      <GroupInfoModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        userGroup={profile.userGroup}
        levelProgress={profile.levelProgress}
      />
    </div>
  );
}
