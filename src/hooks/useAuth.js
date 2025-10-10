// src/hooks/useAuth.js
'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
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

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
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

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    getSessions,
    deleteSession,
    deleteOtherSessions
  };
}
