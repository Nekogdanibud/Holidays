// src/components/NotificationCenter.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationCenter({ isOpen, onClose, onUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId = null) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: notificationId ? [notificationId] : null
        }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchNotifications();
        onUpdate?.();
      }
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-100">
      {/* На мобильных - на весь экран, на ПК - по центру */}
      <div className="flex items-center justify-center h-full">
        {/* Мобильная версия - на весь экран */}
        <div className="md:hidden w-full h-full bg-white flex flex-col">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Уведомления</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} непрочитанных</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Прочитать все
                </button>
              )}
            </div>
          </div>

          {/* Контент */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex space-x-3">
                      <div className="w-2 h-2 bg-gray-200 rounded-full mt-3"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет уведомлений</h3>
                <p className="text-center text-gray-600">Здесь появятся ваши приглашения и уведомления</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      !notification.isRead 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.isRead ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        {notification.type === 'invitation' && !notification.isRead && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                            >
                              Принять приглашение
                            </button>
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                              Отклонить
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Десктоп версия - модальное окно */}
        <div className="hidden md:block w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 mx-4">
          <div className="flex flex-col h-full">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Уведомления</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">{unreadCount} непрочитанных</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead()}
                    className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Прочитать все
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-3"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет уведомлений</h3>
                  <p className="text-center text-gray-600">Здесь появятся ваши приглашения и уведомления</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !notification.isRead ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {notification.message}
                          </p>
                          {notification.type === 'invitation' && !notification.isRead && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                              >
                                Принять
                              </button>
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                              >
                                Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Футер */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Link
                href="/notifications"
                className="block w-full text-center bg-white text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-300"
                onClick={onClose}
              >
                Все уведомления
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
