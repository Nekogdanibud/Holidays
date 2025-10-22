'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVacations: 0,
    activeVacations: 0,
    totalGroups: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Обзор системы</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Пользователи</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-4">
              <span className="text-2xl">🏖️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Всего отпусков</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVacations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mr-4">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Активные отпуски</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeVacations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Группы</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-blue-600 text-lg mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">Управление пользователями</h3>
            <p className="text-sm text-gray-600 mt-1">Просмотр и редактирование пользователей</p>
          </a>

          <a
            href="/admin/vacations"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-green-600 text-lg mb-2">🏖️</div>
            <h3 className="font-semibold text-gray-900">Управление отпусками</h3>
            <p className="text-sm text-gray-600 mt-1">Просмотр и управление отпусками</p>
          </a>

          <a
            href="/admin/groups"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-purple-600 text-lg mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900">Управление группами</h3>
            <p className="text-sm text-gray-600 mt-1">Назначение эксклюзивных групп</p>
          </a>
        </div>
      </div>
    </div>
  );
}
