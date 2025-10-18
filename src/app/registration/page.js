// src/app/registration/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '../../components/Notification';
import GuestRoute from '../../components/GuestRoute';

export default function RegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    usertag: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const generateUsertag = (name) => {
    if (!name.trim()) return '';
    
    // Таблица транслитерации для русских имен
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
      'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
      'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
      'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
      'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
      'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
      'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    let baseTag = name
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    
    if (!baseTag) {
      baseTag = 'user';
    }
    
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseTag}${randomSuffix}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.usertag.trim()) {
      newErrors.usertag = 'Usertag обязателен';
    } else if (formData.usertag.length < 3) {
      newErrors.usertag = 'Usertag должен содержать минимум 3 символа';
    } else if (!/^[a-z0-9-]+$/.test(formData.usertag)) {
      newErrors.usertag = 'Usertag может содержать только латинские буквы в нижнем регистре, цифры и дефисы';
    } else if (formData.usertag.length > 20) {
      newErrors.usertag = 'Usertag не должен превышать 20 символов';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'usertag') {
      processedValue = value.toLowerCase().replace(/\s+/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGenerateUsertag = () => {
    console.log('Generate button clicked', formData.name);
    
    if (formData.name.trim()) {
      const generatedUsertag = generateUsertag(formData.name);
      console.log('Generated usertag:', generatedUsertag);
      
      setFormData(prev => ({
        ...prev,
        usertag: generatedUsertag
      }));
      
      if (errors.usertag) {
        setErrors(prev => ({
          ...prev,
          usertag: ''
        }));
      }
    } else {
      console.log('Name is empty');
      setNotification({
        message: 'Сначала введите имя',
        type: 'warning'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          usertag: formData.usertag,
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({ 
          message: 'Регистрация прошла успешно! Перенаправляем...', 
          type: 'success' 
        });
        
        setTimeout(() => {
          router.push('/my-vacations');
        }, 1000);
      } else {
        setNotification({ 
          message: data.message || 'Ошибка при регистрации', 
          type: 'error' 
        });
      }
    } catch (error) {
      setNotification({ 
        message: 'Ошибка сети. Попробуйте еще раз.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <div>
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />

        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Link href="/" className="inline-flex items-center space-x-2 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BW</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Breezeway
                </span>
              </Link>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Создать аккаунт
              </h2>
              <p className="mt-2 text-gray-600">
                Начните планировать свои путешествия
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`text-gray-900 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Введите ваше имя"
                    required
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="usertag" className="block text-sm font-medium text-gray-700">
                      Usertag *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateUsertag}
                      disabled={!formData.name.trim()}
                      className="text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-md font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
                    >
                      Сгенерировать
                    </button>
                  </div>
                  <input
                    type="text"
                    id="usertag"
                    name="usertag"
                    value={formData.usertag}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.usertag ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ваш-usertag"
                    required
                  />
                  {errors.usertag && (
                    <p className="mt-2 text-sm text-red-600">{errors.usertag}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Только латинские буквы в нижнем регистре, цифры и дефисы (3-20 символов)
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`text-gray-900 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`text-gray-900 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Минимум 6 символов"
                    required
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Подтвердите пароль *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`text-gray-900 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Повторите пароль"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Регистрация...
                    </div>
                  ) : (
                    'Создать аккаунт бесплатно'
                  )}
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Полностью бесплатно • Без ограничений</span>
                  </div>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Уже есть аккаунт?{' '}
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-semibold transition duration-200">
                    Войдите
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
