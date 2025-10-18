// src/components/users/UserCard.js
'use client';

import Link from 'next/link';
import FriendButton from '../FriendButton';

export default function UserCard({ user }) {
  const vacationCount = user.vacationCount || 0;
  const postCount = user.postCount || 0;
  const friendCount = user.friendCount || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-emerald-200 group">
      <div className="flex items-start space-x-4">
        {/* Аватар */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-200">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {user.name}
              </h3>
              <p className="text-gray-500 text-sm">@{user.usertag}</p>
            </div>
            
            {/* Уровень из БД */}
            {user.userGroup && (
              <span className={`text-xs px-2 py-1 rounded-full ${user.userGroup.bgColor} ${user.userGroup.color} flex-shrink-0 ml-2`}>
                {user.userGroup.icon} {user.userGroup.badgeText}
              </span>
            )}
          </div>

          {/* Био */}
          {user.bio && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Статистика - компактная версия для мобильных */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{vacationCount}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{postCount}</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{friendCount}</span>
            </div>

            {user.location && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="line-clamp-1 max-w-[100px]">{user.location}</span>
              </div>
            )}
          </div>

          {/* Кнопки - адаптивная верстка */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-gray-400 order-2 sm:order-1">
              С {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <FriendButton targetUserId={user.id} />
              <Link 
                href={`/profile/${user.usertag}`}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition duration-200 text-sm font-medium whitespace-nowrap"
              >
                Профиль
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
