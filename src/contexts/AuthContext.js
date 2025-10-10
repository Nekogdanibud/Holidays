// src/contexts/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для обновления access токена
  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        return true; // Токен успешно обновлен
      } else {
        // Если не удалось обновить, разлогиниваем пользователя
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    }
  };

  // Проверяем авторизацию с обработкой истекшего токена
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Токен истек, пытаемся обновить
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // После обновления токена снова проверяем авторизацию
          await checkAuth();
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuth(); // Перепроверяем авторизацию
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const register = async (name, email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuth(); // Перепроверяем авторизацию
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setUser(null);
    }
  };

  // Получить активные сессии
  const getSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
      return { sessions: [] };
    } catch (error) {
      console.error('Ошибка получения сессий:', error);
      return { sessions: [] };
    }
  };

  // Удалить сессию
  const deleteSession = async (sessionId) => {
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      console.error('Ошибка удаления сессии:', error);
      return false;
    }
  };

  // Удалить все другие сессии
  const deleteOtherSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions/all', {
        method: 'DELETE',
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      console.error('Ошибка удаления сессий:', error);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    refreshAccessToken,
    getSessions,
    deleteSession,
    deleteOtherSessions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
