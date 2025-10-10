// src/app/my-vacations/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import VacationCard from '../../components/VacationCard';
import Notification from '../../components/Notification';

export default function MyVacationsPage() {
  const { user } = useAuth();
  const [vacations, setVacations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, current, past
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchVacations();
  }, []);

  const fetchVacations = async () => {
    try {
      const response = await fetch('/api/vacations', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVacations(data);
      } else {
        setNotification({
          message: 'Ошибка загрузки отпусков',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки отпусков:', error);
      setNotification({
        message: 'Ошибка сети при загрузке отпусков',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredVacations = () => {
    const today = new Date();
    
    return vacations.filter(vacation => {
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      
      switch (filter) {
        case 'upcoming':
          return startDate > today;
        case 'current':
          return startDate <= today && endDate >= today;
        case 'past':
          return endDate < today;
        default:
          return true;
      }
    });
  };

  const getStats = () => {
    const today = new Date();
    return {
      all: vacations.length,
      upcoming: vacations.filter(v => new Date(v.startDate) > today).length,
      current: vacations.filter(v => new Date(v.startDate) <= today && new Date(v.endDate) >= today).length,
      past: vacations.filter(v => new Date(v.endDate) < today).length,
    };
  };

  const stats = getStats();
  const filteredVacations = getFilteredVacations();

  return (
    <ProtectedRoute>
      <Notification 
        message={notification.message} 
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок и кнопка создания */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Мои отпуски</h1>
                <p className="text-gray-600 mt-2">
                  Привет, {user?.name}! Управляй своими путешествиями
                </p>
              </div>
              <Link 
                href="/create-vacation" 
                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center lg:justify-start space-x-2 w-full lg:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Создать отпуск</span>
              </Link>
            </div>
          </div>

          {/* Фильтры и статистика - АДАПТИВНАЯ ВЕРСИЯ */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Фильтры - во всю ширину на мобильных, компактные на ПК */}
              <div className="w-full lg:w-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full">
                    {[
                      { key: 'all', label: 'Все', count: stats.all },
                      { key: 'upcoming', label: 'Предстоящие', count: stats.upcoming },
                      { key: 'current', label: 'Текущие', count: stats.current },
                      { key: 'past', label: 'Завершенные', count: stats.past }
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center ${
                          filter === key
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">{count}</span>
                        <span className="text-xs mt-1">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Общая статистика - под фильтрами на мобильных, справа на ПК */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{stats.upcoming} предстоящих</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{stats.current} текущих</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>{stats.past} завершенных</span>
                </div>
              </div>
            </div>
          </div>

          {/* Сетка карточек */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVacations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏝️</span>
              </div>
              
              {filter === 'all' ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">У вас пока нет отпусков</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Создайте свой первый отпуск, чтобы начать планирование путешествий вместе с друзьями
                  </p>
                  <Link 
                    href="/create-vacation" 
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Создать первый отпуск</span>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {filter === 'upcoming' && 'Нет предстоящих отпусков'}
                    {filter === 'current' && 'Нет текущих отпусков'}
                    {filter === 'past' && 'Нет завершенных отпусков'}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {filter === 'upcoming' && 'Все ваши отпуски уже начались или завершились'}
                    {filter === 'current' && 'Сейчас у вас нет активных отпусков'}
                    {filter === 'past' && 'У вас пока нет завершенных отпусков'}
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-emerald-600 hover:text-emerald-500 font-medium"
                  >
                    Посмотреть все отпуски
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVacations.map((vacation) => (
                <VacationCard key={vacation.id} vacation={vacation} />
              ))}
              
              {/* Карточка для создания нового отпуска */}
              <Link 
                href="/create-vacation" 
                className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 flex flex-col items-center justify-center text-gray-500 hover:text-emerald-600 min-h-[300px]"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-lg mb-2">Добавить отпуск</span>
                <span className="text-sm text-center">Создайте новое путешествие</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
