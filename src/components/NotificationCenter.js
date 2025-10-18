// src/components/NotificationCenter.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import NotificationFactory from './notifications/NotificationFactory';

export default function NotificationCenter({ isOpen, onClose, onUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

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
        credentials: 'include',
        cache: 'no-store'
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
        if (notificationId) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          );
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
        onUpdate?.();
      }
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
  };

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead();
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      onClick={handleClose}
    >
      <div className="flex items-center justify-center h-full w-full">
        {/* Мобильная версия - занимает всю высоту экрана */}
        <div 
          className="md:hidden w-full h-full bg-white flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleClose} 
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
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Прочитать все
                </button>
              )}
            </div>
          </div>

          <NotificationContent 
            ref={containerRef}
            isLoading={isLoading}
            notifications={notifications}
            markAsRead={markAsRead}
            fetchNotifications={fetchNotifications}
            isMobile={true}
          />
        </div>

        {/* Десктоп версия - компактная с правой стороны */}
        <div 
          className="hidden md:block absolute top-4 right-4 w-96 h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Уведомления</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">{unreadCount} непрочитанных</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Прочитать все
                  </button>
                )}
                <button 
                  onClick={handleClose} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <NotificationContent 
                ref={containerRef}
                isLoading={isLoading}
                notifications={notifications}
                markAsRead={markAsRead}
                fetchNotifications={fetchNotifications}
                isMobile={false}
              />
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Link
                href="/notifications"
                className="block w-full text-center bg-white text-gray-700 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium border border-gray-300 transition-colors"
                onClick={handleClose}
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

// Отдельный компонент для контента уведомлений
const NotificationContent = React.forwardRef(({ 
  isLoading, 
  notifications, 
  markAsRead, 
  fetchNotifications, 
  isMobile 
}, ref) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
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
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-gray-500 ${
        isMobile ? 'h-[60vh] p-8' : 'h-64 p-6'
      }`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет уведомлений</h3>
        <p className="text-center text-gray-600 text-sm">Здесь появятся ваши уведомления</p>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`h-full overflow-y-auto notification-scroll ${
        isMobile ? 'p-4' : 'p-3'
      }`}
      style={isMobile ? {} : { maxHeight: 'calc(85vh - 120px)' }}
    >
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            data-notification-id={notification.id}
            className="notification-item"
          >
            <NotificationFactory
              notification={notification}
              onMarkAsRead={markAsRead}
              onUpdate={fetchNotifications}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// Добавляем React импорт в конец файла
import React from 'react';
NotificationContent.displayName = 'NotificationContent';
