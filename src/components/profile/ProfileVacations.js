// src/components/profile/ProfileVacations.js
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProfileVacations({ profile, isOwnProfile }) {
  const [viewMode, setViewMode] = useState('all'); // all, owned, participating

  if (!profile.vacations || profile.vacations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏖️</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Пока нет отпусков
        </h3>
        <p className="text-gray-600 mb-6">
          {isOwnProfile ? 
            'Создайте свой первый отпуск или примите приглашение, чтобы поделиться впечатлениями' :
            'Пользователь еще не участвует в отпусках'
          }
        </p>
        {isOwnProfile && (
          <Link 
            href="/create-vacation" 
            className="bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 transition duration-200 font-semibold inline-flex items-center space-x-2"
          >
            <span>+</span>
            <span>Создать отпуск</span>
          </Link>
        )}
      </div>
    );
  }

  // Фильтруем отпуски по роли
  const ownedVacations = profile.vacations.filter(v => v.isOwner);
  const participatingVacations = profile.vacations.filter(v => !v.isOwner);

  const getFilteredVacations = () => {
    switch (viewMode) {
      case 'owned':
        return ownedVacations;
      case 'participating':
        return participatingVacations;
      default:
        return profile.vacations;
    }
  };

  const filteredVacations = getFilteredVacations();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Отпуски</h2>
          <p className="text-gray-600 mt-1">
            Всего: {profile.vacations.length}
            {ownedVacations.length > 0 && ` • Создано: ${ownedVacations.length}`}
            {participatingVacations.length > 0 && ` • Участвует: ${participatingVacations.length}`}
          </p>
        </div>
        
        {/* Переключение режима просмотра (только если есть оба типа отпусков) */}
        {ownedVacations.length > 0 && participatingVacations.length > 0 && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setViewMode('owned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'owned' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Созданные
            </button>
            <button
              onClick={() => setViewMode('participating')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'participating' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Участвует
            </button>
          </div>
        )}
      </div>

      {/* Сетка отпусков */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVacations.map((vacation) => (
          <VacationCard 
            key={vacation.id} 
            vacation={vacation} 
          />
        ))}
      </div>
    </div>
  );
}

// Обновленная карточка отпуска
function VacationCard({ vacation }) {
  const getStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now <= end) return { status: 'current', color: 'bg-green-100 text-green-800' };
    return { status: 'past', color: 'bg-gray-100 text-gray-800' };
  };

  const status = getStatus(vacation.startDate, vacation.endDate);

  return (
    <Link href={`/vacations/${vacation.id}`}>
      <div className="border-2 border-gray-200 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 group cursor-pointer">
        <div className="aspect-video bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl mb-4 flex items-center justify-center text-white text-4xl">
          🏖️
        </div>
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {vacation.title}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
              {status.status === 'upcoming' ? 'Предстоит' : status.status === 'current' ? 'Сейчас' : 'Завершен'}
            </span>
            {!vacation.isOwner && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                Участник
              </span>
            )}
            {vacation.isOwner && (
              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                Создатель
              </span>
            )}
          </div>
        </div>

        {vacation.destination && (
          <p className="text-gray-600 text-sm mb-3 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{vacation.destination}</span>
          </p>
        )}

        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {new Date(vacation.startDate).toLocaleDateString('ru-RU')}
          </span>
          <span>
            {vacation._count?.members || 0} участников
          </span>
        </div>
      </div>
    </Link>
  );
}
