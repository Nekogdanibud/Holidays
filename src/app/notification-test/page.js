// src/app/notifications-test/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function NotificationsTestPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testNotifications = [
    {
      type: 'invitation',
      title: 'Приглашение в отпуск',
      message: 'Анна пригласила вас в отпуск "Отдых на Бали"',
      buttonText: '📨 Тест приглашения',
      description: 'Проверка системы приглашений с кнопками принятия/отклонения'
    },
    {
      type: 'activity_update', 
      title: 'Обновление планов',
      message: 'В вашем отпуске "Горные походы" добавлена новая активность',
      buttonText: '🔄 Тест обновления',
      description: 'Уведомление об изменениях в планах отпуска'
    },
    {
      type: 'memory_comment',
      title: 'Новый комментарий',
      message: 'Иван прокомментировал ваше воспоминание',
      buttonText: '💬 Тест комментария',
      description: 'Оповещение о новых комментариях к фотографиям'
    },
    {
      type: 'info',
      title: 'Информационное уведомление',
      message: 'Это тестовое информационное уведомление для проверки системы',
      buttonText: 'ℹ️ Тест информации',
      description: 'Простое информационное уведомление без действий'
    }
  ];

  const sendTestNotification = async (type) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: `✅ Уведомление "${type}" успешно отправлено!`,
          notification: data.notification
        });
      } else {
        setResult({
          type: 'error', 
          message: `❌ Ошибка: ${data.message || 'Неизвестная ошибка'}`
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `❌ Ошибка сети: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Заголовок */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Тестирование уведомлений
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Проверьте работу системы уведомлений Breezeway. 
              Отправьте тестовые уведомления разных типов и посмотрите, как они отображаются.
            </p>
            {user && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full text-sm text-gray-600 shadow-sm">
                <span>Тестируете как:</span>
                <span className="font-semibold text-emerald-600">{user.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{user.email}</span>
              </div>
            )}
          </div>

          {/* Результат операции */}
          {result && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              result.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{result.message}</p>
                  {result.notification && (
                    <div className="mt-2 text-sm opacity-80">
                      <p><strong>Тип:</strong> {result.notification.type}</p>
                      <p><strong>Заголовок:</strong> {result.notification.title}</p>
                      <p><strong>Сообщение:</strong> {result.notification.message}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={clearResult}
                  className="ml-4 p-1 hover:opacity-70 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Кнопки тестирования */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {testNotifications.map((notification) => (
              <div
                key={notification.type}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {notification.description}
                    </p>
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                      <strong>Сообщение:</strong> "{notification.message}"
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendTestNotification(notification.type)}
                    disabled={isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        Отправка...
                      </div>
                    ) : (
                      notification.buttonText
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Инструкция */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Как проверить результат?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">📱 На мобильном:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Откройте меню (три линии вверху)</li>
                  <li>• Нажмите на иконку уведомлений 🔔</li>
                  <li>• Проверьте появившиеся тестовые уведомления</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">💻 На компьютере:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Нажмите на иконку уведомлений в правом верхнем углу</li>
                  <li>• Откроется панель уведомлений</li>
                  <li>• Проверьте работу разных типов уведомлений</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              После отправки уведомления откройте центр уведомлений (иконка колокольчика в шапке сайта)
            </p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
