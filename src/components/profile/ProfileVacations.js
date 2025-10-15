// src/components/profile/ProfileVacations.js
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProfileVacations({ profile }) {
  const [viewMode, setViewMode] = useState('grid'); // grid или list

  if (!profile.vacations || profile.vacations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏖️</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет отпусков</h3>
        <p className="text-gray-600 mb-6">
          {profile.id === profile.userId ? 
            'Создайте свой первый отпуск, чтобы поделиться впечатлениями' :
            'Пользователь еще не создал ни одного отпуска'
          }
        </p>
        {profile.id === profile.userId && (
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Отпуски</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{profile.vacations.length} отпусков</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.vacations.map((vacation) => (
            <VacationCard key={vacation.id} vacation={vacation} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {profile.vacations.map((vacation) => (
            <VacationListItem key={vacation.id} vacation={vacation} />
          ))}
        </div>
      )}
    </div>
  );
}

// Карточка отпуска для grid view
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
          <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
            {status.status === 'upcoming' ? 'Предстоит' : status.status === 'current' ? 'Сейчас' : 'Завершен'}
          </span>
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

// Элемент списка для list view
function VacationListItem({ vacation }) {
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
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
            🏖️
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {vacation.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${status.color} flex-shrink-0 ml-2`}>
                {status.status === 'upcoming' ? 'Предстоит' : status.status === 'current' ? 'Сейчас' : 'Завершен'}
              </span>
            </div>

            {vacation.destination && (
              <p className="text-gray-600 text-sm mb-2 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{vacation.destination}</span>
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                {new Date(vacation.startDate).toLocaleDateString('ru-RU')} - {new Date(vacation.endDate).toLocaleDateString('ru-RU')}
              </span>
              <span>•</span>
              <span>{vacation._count?.members || 0} участников</span>
              <span>•</span>
              <span>{vacation._count?.memories || 0} воспоминаний</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
