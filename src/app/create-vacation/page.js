// src/app/create-vacation/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Notification from '../../components/Notification';

export default function CreateVacationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const validateForm = () => {
    const newErrors = {};

    // Проверка названия
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Название должно содержать минимум 2 символа';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Название не должно превышать 100 символов';
    }

    // Проверка дат
    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Дата окончания обязательна';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Дата начала не может быть в прошлом';
      }

      if (end < start) {
        newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
      }

      if ((end - start) / (1000 * 60 * 60 * 24) > 365) {
        newErrors.endDate = 'Отпуск не может длиться больше года';
      }
    }

    // Проверка места назначения
    if (formData.destination && formData.destination.length > 200) {
      newErrors.destination = 'Место назначения не должно превышать 200 символов';
    }

    // Проверка описания
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описание не должно превышать 500 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Начало создания отпуска...');
    console.log('📋 Данные формы:', formData);

    if (!validateForm()) {
      console.log('❌ Валидация не пройдена:', errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/vacations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      console.log('📡 Ответ сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📄 Данные ответа:', data);

      if (response.ok) {
        console.log('✅ Отпуск успешно создан:', data.id);
        
        setNotification({ 
          message: 'Отпуск успешно создан! Перенаправляем...', 
          type: 'success' 
        });
        
        // Даем пользователю увидеть сообщение об успехе
        setTimeout(() => {
          router.push(`/vacations/${data.id}`);
        }, 1500);
      } else {
        console.log('❌ Ошибка API:', data.message);
        setNotification({ 
          message: data.message || 'Ошибка при создании отпуска', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('❌ Сетевая ошибка:', error);
      setNotification({ 
        message: 'Ошибка сети. Проверьте подключение и попробуйте еще раз.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения минимальной даты (сегодня)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Функция для получения максимальной даты (год от сегодня)
  const getMaxDate = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  };

  return (
    <ProtectedRoute>
      <Notification 
        message={notification.message} 
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Заголовок */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Создать новый отпуск
              </h1>
              <p className="text-gray-600">
                Заполните информацию о вашем следующем путешествии
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Название отпуска */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название отпуска *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Например: Отпуск в горах, Пляжный отдых на Бали..."
                />
                <div className="flex justify-between mt-1">
                  {errors.title ? (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Минимум 2 символа
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {formData.title.length}/100
                  </div>
                </div>
              </div>

              {/* Место назначения */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Место назначения
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  maxLength={200}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Например: Париж, Франция или Тайланд, Пхукет..."
                />
                <div className="flex justify-between mt-1">
                  {errors.destination ? (
                    <p className="text-sm text-red-600">{errors.destination}</p>
                  ) : (
                    <div></div>
                  )}
                  <div className="text-sm text-gray-500">
                    {formData.destination.length}/200
                  </div>
                </div>
              </div>

              {/* Описание */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Расскажите о ваших планах, целях поездки или особых пожеланиях..."
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <div></div>
                  )}
                  <div className="text-sm text-gray-500">
                    {formData.description.length}/500
                  </div>
                </div>
              </div>

              {/* Даты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Дата окончания *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={formData.startDate || getMinDate()}
                    max={getMaxDate()}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Подсказка по длительности */}
              {formData.startDate && formData.endDate && !errors.startDate && !errors.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-800 text-sm">
                      Длительность отпуска: {' '}
                      {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} дней
                    </span>
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/my-vacations')}
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      <span>Создание...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Создать отпуск</span>
                    </>
                  )}
                </button>
              </div>

              {/* Подсказка */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  После создания вы сможете добавить участников, планы и воспоминания
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
