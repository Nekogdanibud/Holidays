'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const menuItems = [
    { 
      href: '/admin', 
      label: 'Обзор', 
      icon: '📊'
    },
    { 
      href: '/admin/users', 
      label: 'Пользователи', 
      icon: '👥'
    },
    { 
      href: '/admin/vacations', 
      label: 'Отпуска', 
      icon: '🏖️'
    },
    { 
      href: '/admin/groups', 
      label: 'Группы', 
      icon: '🎯'
    },
    { 
      href: '/admin/notifications', 
      label: 'Уведомления', 
      icon: '🔔'
    },
  ];

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && user) {
        try {
          const response = await fetch('/api/admin/check', {
            credentials: 'include'
          });
          
          if (response.ok) {
            setIsAdmin(true);
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error('Ошибка проверки прав администратора:', error);
          router.push('/');
        }
      } else if (!isLoading && !user) {
        router.push('/login');
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Привет, {user?.name}</span>
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                На сайт
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`
            bg-white shadow-sm border-r border-gray-200 transform transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:sticky lg:translate-x-0 top-16 lg:top-0 w-64 h-[calc(100vh-4rem)] lg:h-screen z-40
            overflow-y-auto
          `}
        >
          <nav className="mt-8 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white lg:bg-transparent lg:m-4 lg:rounded-lg lg:shadow-sm">
          {children}
        </main>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
