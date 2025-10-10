// src/app/vacations/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import VacationTimer from '@/components/vacation/VacationTimer';
import CaptureMoment from '@/components/vacation/CaptureMoment';
import PlanSection from '@/components/vacation/PlanSection';
import MemoriesSection from '@/components/vacation/MemoriesSection';
import VacationManagement from '@/components/vacation/VacationManagement';

export default function VacationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vacation, setVacation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchVacation();
    }
  }, [params.id]);

  const fetchVacation = async () => {
    try {
      const response = await fetch(`/api/vacations/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setVacation(data);
      } else if (response.status === 404) {
        setError('Отпуск не найден');
      } else if (response.status === 401) {
        setError('Необходима авторизация');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка загрузки отпуска');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки отпуска:', error);
      setError('Ошибка сети при загрузки отпуска');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <VacationContent 
        vacation={vacation}
        isLoading={isLoading}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchVacation}
        router={router}
      />
    </ProtectedRoute>
  );
}

function VacationContent({ vacation, isLoading, error, activeTab, setActiveTab, onRefresh, router }) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-gray-400 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка отпуска...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/my-vacations')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Вернуться к моим отпускам
          </button>
        </div>
      </div>
    );
  }

  if (!vacation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Отпуск не найден</h2>
          <p className="text-gray-600 mb-6">Возможно, у вас нет доступа к этому отпуску или он был удален</p>
          <button 
            onClick={() => router.push('/my-vacations')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Вернуться к моим отпускам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/my-vacations')}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">{vacation.title}</h1>
                {vacation.destination && (
                  <p className="text-gray-600 text-sm truncate flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {vacation.destination}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 -mb-px overflow-x-auto">
                {[
                  { id: 'overview', label: 'Обзор', icon: '📊' },
                  { id: 'plans', label: 'Планы', icon: '📅' },
                  { id: 'memories', label: 'Воспоминания', icon: '📸' },
                  { id: 'management', label: 'Управление', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-gray-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <VacationTimer vacation={vacation} />
            <CaptureMoment vacation={vacation} />
            <PlanSection vacation={vacation} preview={true} />
            <MemoriesSection vacation={vacation} preview={true} />
          </div>
        )}

        {activeTab === 'plans' && (
          <PlanSection vacation={vacation} preview={false} />
        )}

        {activeTab === 'memories' && (
          <MemoriesSection vacation={vacation} preview={false} />
        )}

        {activeTab === 'management' && (
          <VacationManagement vacation={vacation} onUpdate={onRefresh} />
        )}
      </div>
    </div>
  );
}
