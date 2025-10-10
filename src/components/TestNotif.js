// components/NotificationTester.js
'use client';
import { useState } from 'react';

export default function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);

  const testNotifications = [
    {
      type: 'invitation',
      title: 'Приглашение в отпуск',
      message: 'Анна пригласила вас в отпуск "Отдых на Бали"',
      buttonText: '📨 Тест приглашения'
    },
    {
      type: 'activity_update', 
      title: 'Обновление планов',
      message: 'В вашем отпуске добавлена новая активность',
      buttonText: '🔄 Тест обновления'
    },
    {
      type: 'memory_comment',
      title: 'Новый комментарий',
      message: 'Иван прокомментировал ваше воспоминание',
      buttonText: '💬 Тест комментария'
    },
    {
      type: 'info',
      title: 'Информационное уведомление',
      message: 'Это тестовое информационное уведомление',
      buttonText: 'ℹ️ Тест информации'
    }
  ];

  const sendTest = async (type) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        credentials: 'include'
      });

      if (response.ok) {
        console.log(`Тестовое уведомление "${type}" отправлено`);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Тестирование уведомлений</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {testNotifications.map((notification) => (
          <button
            key={notification.type}
            onClick={() => sendTest(notification.type)}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg transition disabled:opacity-50"
          >
            {notification.buttonText}
          </button>
        ))}
      </div>
    </div>
  );
}
