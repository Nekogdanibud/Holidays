// src/app/vacations/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import VacationTimer from '@/components/vacation/VacationTimer';
import SmartCapture from '@/components/vacation/SmartCapture';
import PlanSection from '@/components/vacation/PlanSection';
import SmartGallery from '@/components/vacation/SmartGallery';
import VacationManagement from '@/components/vacation/VacationManagement';

export default function VacationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [vacation, setVacation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchVacation();
    }
  }, [params.id]);

  const fetchVacation = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/vacations/${params.id}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setVacation(data);
      } else if (response.status === 404) {
        setError('Отпуск не найден');
      } else if (response.status === 401) {
        setError('Необходима авторизация');
        router.push('/login');
      } else if (response.status === 403) {
        setError('У вас нет доступа к этому отпуску');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка загрузки отпуска');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки отпуска:', error);
      setError('Ошибка сети при загрузке отпуска');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchVacation();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка отпуска...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 font-medium"
                >
                  {retryCount >= 3 ? 'Превышено количество попыток' : `Попробовать снова ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </button>
                <button 
                  onClick={() => router.push('/my-vacations')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
                >
                  Вернуться к моим отпускам
                </button>
              </div>
            </div>
          </div>
        ) : !vacation ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Отпуск не найден</h2>
              <p className="text-gray-600 mb-6">Возможно, у вас нет доступа к этому отпуску или он был удален</p>
              <button 
                onClick={() => router.push('/my-vacations')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
              >
                Вернуться к моим отпускам
              </button>
            </div>
          </div>
        ) : (
          <VacationContent 
            vacation={vacation}
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={fetchVacation}
            router={router}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function VacationContent({ vacation, user, activeTab, setActiveTab, onRefresh, router }) {
  // Проверяем доступ пользователя к отпуску
  const hasAccess = vacation?.members?.some(member => 
    member.userId === user?.id && member.status === 'ACCEPTED'
  ) || vacation?.userId === user?.id;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600 mb-6">
            У вас нет доступа к этому отпуску. Если вас пригласили, убедитесь что приняли приглашение.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => router.push('/my-vacations')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
            >
              Мои отпуски
            </button>
            <button 
              onClick={() => router.push('/notifications')}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
            >
              Проверить приглашения
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = vacation.userId === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/my-vacations')}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Назад к моим отпускам"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">{vacation.title}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {vacation.destination && (
                    <p className="text-gray-600 text-sm truncate flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {vacation.destination}
                    </p>
                  )}
                  {isOwner && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Владелец
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-1 -mb-px overflow-x-auto">
                {[
                  { id: 'overview', label: 'Обзор', icon: '📊', available: true },
                  { id: 'plans', label: 'Планы', icon: '📅', available: true },
                  { id: 'gallery', label: 'Галерея', icon: '🖼️', available: true },
                  { id: 'management', label: 'Управление', icon: '⚙️', available: isOwner }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.available && setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center space-x-2 ${
                      !tab.available 
                        ? 'opacity-50 cursor-not-allowed text-gray-400 border-transparent'
                        : activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    disabled={!tab.available}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {!tab.available && (
                      <span className="text-xs" title="Только для владельца">🔒</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <VacationTimer vacation={vacation} />
            <SmartCapture vacation={vacation} />
            <PlanSection vacation={vacation} preview={true} />
          </div>
        )}

        {activeTab === 'plans' && (
          <PlanSection vacation={vacation} preview={false} />
        )}

        {activeTab === 'gallery' && (
          <SmartGallery vacationId={vacation.id} />
        )}

        {activeTab === 'management' && isOwner && (
          <VacationManagement vacation={vacation} onUpdate={onRefresh} />
        )}
      </div>
    </div>
  );
}
