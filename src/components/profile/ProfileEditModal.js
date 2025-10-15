// src/components/profile/ProfileEditModal.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileEditModal({ isOpen, onClose, profile, onUpdate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    profileVisibility: 'public'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '');
  const [bannerPreview, setBannerPreview] = useState(profile?.banner || '');
  
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        profileVisibility: profile.profileVisibility || 'public'
      });
      setAvatarPreview(profile.avatar || '');
      setBannerPreview(profile.banner || '');
    }
  }, [profile]);

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем превью
        if (type === 'avatar') {
          setAvatarPreview(data.user.avatar);
        } else {
          setBannerPreview(data.user.banner);
        }
        
        // Обновляем родительский компонент
        onUpdate(data.user);
      } else {
        setErrors({ image: data.message || 'Ошибка загрузки изображения' });
      }
    } catch (error) {
      setErrors({ image: 'Ошибка сети при загрузке изображения' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, 'avatar');
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, 'banner');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Биография не должна превышать 500 символов';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Введите корректный URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Ошибка обновления профиля' });
      }
    } catch (error) {
      setErrors({ submit: 'Ошибка сети' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Редактировать профиль</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Загрузка изображений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Баннер */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Баннер профиля
              </label>
              <div 
                className="relative h-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl cursor-pointer overflow-hidden group"
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Баннер"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isUploading ? 'Загрузка...' : 'Изменить баннер'}
                  </span>
                </div>
                
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Аватар */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Аватар
              </label>
              <div 
                className="relative w-32 h-32 mx-auto bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full cursor-pointer overflow-hidden group"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Аватар"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center px-2">
                    {isUploading ? 'Загрузка...' : 'Изменить аватар'}
                  </span>
                </div>
                
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {errors.image && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-600">{errors.image}</p>
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Имя */}
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
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ваше имя"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Биография */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Биография
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Расскажите о себе..."
                maxLength="500"
              />
              <div className="flex justify-between mt-1">
                {errors.bio ? (
                  <p className="text-sm text-red-600">{errors.bio}</p>
                ) : (
                  <div></div>
                )}
                <div className="text-sm text-gray-500">
                  {formData.bio.length}/500
                </div>
              </div>
            </div>

            {/* Местоположение */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Местоположение
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="Город, страна"
              />
            </div>

            {/* Веб-сайт */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-2 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            {/* Видимость профиля */}
            <div>
              <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-2">
                Видимость профиля
              </label>
              <select
                id="profileVisibility"
                name="profileVisibility"
                value={formData.profileVisibility}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              >
                <option value="public">Публичный</option>
                <option value="private">Приватный</option>
                <option value="friends">Только друзья</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {formData.profileVisibility === 'public' && 'Ваш профиль видят все пользователи'}
                {formData.profileVisibility === 'private' && 'Ваш профиль видят только вы'}
                {formData.profileVisibility === 'friends' && 'Ваш профиль видят только друзья'}
              </p>
            </div>

            {/* Ошибка отправки */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition duration-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <span>Сохранить</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
