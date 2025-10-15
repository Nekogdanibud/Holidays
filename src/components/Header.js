// src/components/Header.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const notifications = await response.json();
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNotificationOpen(true);
  };

  const handleMobileNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNotificationOpen(true);
    setIsMenuOpen(false);
  };

  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="ml-2 w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex space-x-4">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const isLoggedIn = !!user;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BW</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Breezeway
                </span>
              </Link>
            </div>

            {/* Навигация для десктопа */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium">
                Возможности
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium">
                О нас
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium">
                Сообщество
              </Link>
            </nav>

            {/* Кнопки для десктопа */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Центр уведомлений */}
                  <button 
                    onClick={handleNotificationClick}
                    className="relative p-2 text-gray-600 hover:text-emerald-600 transition duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <Link 
                    href="/my-vacations" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition duration-200"
                  >
                    Мои отпуски
                  </Link>
                  <Link 
                    href="/profile" 
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-2 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {user?.name || 'Профиль'}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 font-medium transition duration-200"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition duration-200"
                  >
                    Вход
                  </Link>
                  <Link 
                    href="/registration" 
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-2 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Начать бесплатно
                  </Link>
                </>
              )}
            </div>

            {/* Кнопка мобильного меню */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-100 transition duration-200"
              onClick={handleMenuToggle}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Мобильное меню */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/features" 
                  className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium py-2"
                  onClick={handleLinkClick}
                >
                  Возможности
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium py-2"
                  onClick={handleLinkClick}
                >
                  О нас
                </Link>
                <Link 
                  href="/community" 
                  className="text-gray-600 hover:text-emerald-600 transition duration-200 font-medium py-2"
                  onClick={handleLinkClick}
                >
                  Сообщество
                </Link>
                
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {isLoggedIn ? (
                    <>
                      <button 
                        onClick={handleMobileNotificationClick}
                        className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition duration-200 py-2 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 2.93A2 2 0 004 13.46v.54a2 2 0 002 2h8a2 2 0 002-2v-.54a2 2 0 00-1.45-1.97 5.97 5.97 0 01-3.79-2.93 2 2 0 00-3.52 0z" />
                        </svg>
                        <span>Уведомления</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      <Link 
                        href="/my-vacations" 
                        className="block text-emerald-600 hover:text-emerald-700 font-medium transition duration-200 py-2"
                        onClick={handleLinkClick}
                      >
                        Мои отпуски
                      </Link>
                      <Link 
                        href="/profile" 
                        className="block bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-center px-6 py-3 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg"
                        onClick={handleLinkClick}
                      >
                        {user?.name || 'Профиль'}
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-gray-600 hover:text-red-600 text-center font-medium transition duration-200 py-2"
                      >
                        Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block text-emerald-600 hover:text-emerald-700 font-medium transition duration-200 py-2"
                        onClick={handleLinkClick}
                      >
                        Вход
                      </Link>
                      <Link 
                        href="/registration" 
                        className="block bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-center px-6 py-3 rounded-full hover:from-emerald-700 hover:to-teal-600 transition duration-200 shadow-lg"
                        onClick={handleLinkClick}
                      >
                        Начать бесплатно
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Центр уведомлений */}
      <NotificationCenter 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUpdate={fetchUnreadCount}
      />
    </>
  );
}
