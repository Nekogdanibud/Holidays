// src/components/AdminRoute.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

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
        } finally {
          setChecking(false);
        }
      } else if (!isLoading && !user) {
        router.push('/login');
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Доступ запрещен</p>
        </div>
      </div>
    );
  }

  return children;
}
