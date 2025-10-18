// src/app/users/page.js
'use client';

import { useState, useEffect } from 'react';
import UserSearch from '@/components/users/UserSearch';
import UserCard from '@/components/users/UserCard';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/users${query}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Ошибка загрузки пользователей');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchUsers(search);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Пользователи
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Найдите друзей и попутчиков для ваших путешествий
          </p>
        </div>

        {/* Поиск */}
        <UserSearch 
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Результаты */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Пользователи не найдены' : 'Пока нет пользователей'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Будьте первым, кто присоединится к нашему сообществу!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
