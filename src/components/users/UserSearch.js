// src/components/users/UserSearch.js
'use client';

import { useState } from 'react';

export default function UserSearch({ onSearch, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Поиск */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск пользователей
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Поиск по имени или usertag..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Найти
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  disabled={isLoading}
                  className="bg-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-400 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Очистить поиск"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Информация о поиске */}
      {searchTerm && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-sm text-blue-700">
            Поиск: <span className="font-semibold">"{searchTerm}"</span>
          </p>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Очистить
          </button>
        </div>
      )}
    </div>
  );
}
