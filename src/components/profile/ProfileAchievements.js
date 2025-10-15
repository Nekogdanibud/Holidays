// src/components/profile/ProfileAchievements.js
'use client';

import { useState } from 'react';

export default function ProfileAchievements({ profile }) {
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const defaultAchievements = [
    {
      id: 'first_vacation',
      title: 'Первый отпуск',
      description: 'Создал свой первый отпуск',
      icon: '🏖️',
      earned: profile.vacations && profile.vacations.length > 0
    },
    // ... остальные достижения
  ];

  const earnedAchievements = defaultAchievements.filter(a => a.earned);
  const lockedAchievements = defaultAchievements.filter(a => !a.earned);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Достижения</h2>
        <div className="text-sm text-gray-500">
          {earnedAchievements.length} из {defaultAchievements.length} получено
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс достижений</span>
          <span>{Math.round((earnedAchievements.length / defaultAchievements.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 md:h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedAchievements.length / defaultAchievements.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Полученные достижения */}
      {earnedAchievements.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Полученные</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedAchievement(achievement)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl md:text-3xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1">{achievement.title}</h4>
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Неполученные достижения */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">В процессе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl md:text-3xl filter grayscale">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1">{achievement.title}</h4>
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно достижения */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl md:text-6xl mb-4">{selectedAchievement.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selectedAchievement.title}</h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">{selectedAchievement.description}</p>
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Достижение получено!</span>
              </div>
            </div>
            <div className="flex justify-center mt-4 md:mt-6">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition duration-200 text-sm md:text-base"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
