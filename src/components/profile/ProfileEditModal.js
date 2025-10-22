// src/components/profile/ProfileEditModal.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Компонент для превью изображений
const ImagePreview = ({ src, alt, className, type }) => {
  const [hasError, setHasError] = useState(false);

  console.log(`ImagePreview for ${type}:`, { src, hasError });

  if (!src || hasError) {
    console.warn(`ImagePreview fallback to placeholder for ${type}:`, { src, hasError });
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.error(`Failed to load image for ${type}:`, src);
        setHasError(true);
      }}
      style={{ objectFit: 'cover' }}
    />
  );
};

export default function ProfileEditModal({ isOpen, onClose, profile, onUpdate }) {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    usertag: '',
    bio: '',
    location: '',
    website: '',
    profileVisibility: 'PUBLIC'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [tempAvatar, setTempAvatar] = useState(null); // Временный путь аватара
  const [tempBanner, setTempBanner] = useState(null); // Временный путь баннера
  
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (profile && isOpen) {
      console.log('Profile data:', profile);
      console.log('Profile avatar:', profile.avatar);
      console.log('Profile banner:', profile.banner);

      setFormData({
        name: profile.name || '',
        usertag: profile.usertag || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        profileVisibility: profile.profileVisibility || 'PUBLIC'
      });
      
      const avatarUrl = profile.avatar ? getFullImageUrl(profile.avatar) : '';
      const bannerUrl = profile.banner ? getFullImageUrl(profile.banner) : '';
      console.log('Avatar preview URL:', avatarUrl);
      console.log('Banner preview URL:', bannerUrl);
      
      setAvatarPreview(avatarUrl);
      setBannerPreview(bannerUrl);
      
      setTempAvatar(null);
      setTempBanner(null);
      setErrors({});
    }
  }, [profile, isOpen]);

  // Очистка Blob URL и удаление временных изображений при размонтировании
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        console.log('Revoking avatar blob URL:', avatarPreview);
        URL.revokeObjectURL(avatarPreview);
      }
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        console.log('Revoking banner blob URL:', bannerPreview);
        URL.revokeObjectURL(bannerPreview);
      }
      // Удаляем временные изображения с сервера
      if (tempAvatar) deleteTempImage(tempAvatar);
      if (tempBanner) deleteTempImage(tempBanner);
    };
  }, [avatarPreview, bannerPreview, tempAvatar, tempBanner]);

  // Функция для получения полного URL изображения
  const getFullImageUrl = (url) => {
    console.log('getFullImageUrl input:', url);
    if (!url) return '';
    
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    if (url.startsWith('/') && typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${url}`;
      console.log('Generated full URL:', fullUrl);
      return fullUrl;
    }
    
    console.warn('Unexpected URL format:', url);
    return url;
  };

  // Функция для удаления временного изображения
  const deleteTempImage = async (imagePath) => {
    if (!imagePath) return;
    try {
      await fetch('/api/profile/delete-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error deleting temp image:', error);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    setIsUploading(true);
    setUploadingType(type);
    setErrors({ ...errors, image: '' });

    // Удаляем старое временное изображение
    if (type === 'avatar' && tempAvatar) {
      await deleteTempImage(tempAvatar);
    } else if (type === 'banner' && tempBanner) {
      await deleteTempImage(tempBanner);
    }

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
      console.log('API response:', data);

      if (response.ok) {
        const imageUrl = getFullImageUrl(data.tempPath);
        console.log(`Uploaded ${type} temp URL:`, imageUrl);
        
        if (type === 'avatar') {
          setTempAvatar(data.tempPath);
          setAvatarPreview(imageUrl);
        } else {
          setTempBanner(data.tempPath);
          setBannerPreview(imageUrl);
        }
      } else {
        setErrors({ image: data.message || 'Ошибка загрузки изображения' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ image: 'Ошибка сети при загрузке изображения' });
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Файл должен быть изображением' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'Размер файла не должен превышать 5MB' });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      console.log('Avatar preview blob URL:', objectUrl);
      setAvatarPreview(objectUrl);

      handleImageUpload(file, 'avatar');
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Файл должен быть изображением' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'Размер файла не должен превышать 5MB' });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      console.log('Banner preview blob URL:', objectUrl);
      setBannerPreview(objectUrl);

      handleImageUpload(file, 'banner');
    }
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
      // Подтверждаем временные изображения
      const confirmData = {};
      if (tempAvatar) confirmData.avatar = tempAvatar;
      if (tempBanner) confirmData.banner = tempBanner;

      // Обновляем профиль
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, ...confirmData }),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        
        const finalProfile = {
          ...updatedProfile,
          posts: profile.posts,
          vacations: profile.vacations,
          friendCount: profile.friendCount,
          vacationCount: profile.vacationCount,
          postCount: profile.postCount
        };

        const usertagChanged = profile.usertag !== updatedProfile.usertag;
        
        onUpdate?.(finalProfile);
        onClose();
        
        if (usertagChanged) {
          setTimeout(() => {
            router.push(`/profile/${updatedProfile.usertag}`);
          }, 100);
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Ошибка обновления профиля' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: 'Ошибка сети' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsLoading(false);
    setIsUploading(false);
    setUploadingType(null);
    
    // Восстанавливаем оригинальные превью
    if (profile) {
      const avatarUrl = profile.avatar ? getFullImageUrl(profile.avatar) : '';
      const bannerUrl = profile.banner ? getFullImageUrl(profile.banner) : '';
      console.log('Restoring avatar preview:', avatarUrl);
      console.log('Restoring banner preview:', bannerUrl);
      setAvatarPreview(avatarUrl);
      setBannerPreview(bannerUrl);
    }
    
    // Удаляем временные изображения
    if (tempAvatar) deleteTempImage(tempAvatar);
    if (tempBanner) deleteTempImage(tempBanner);
    
    setTempAvatar(null);
    setTempBanner(null);
    
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Редактировать профиль</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isUploading}
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {(tempAvatar || tempBanner) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  Новые изображения будут применены после сохранения
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Баннер профиля
                {tempBanner && <span className="ml-2 text-xs text-green-600">(новый)</span>}
              </label>
              <div 
                className={`relative rounded-xl cursor-pointer overflow-hidden ${
                  isUploading && uploadingType === 'banner' ? 'opacity-50' : ''
                }`}
                style={{ height: '120px' }}
                onClick={() => !isUploading && bannerInputRef.current?.click()}
              >
                <ImagePreview
                  src={bannerPreview}
                  alt="Баннер профиля"
                  className="w-full h-full"
                  type="banner"
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm">
                    {isUploading && uploadingType === 'banner' ? 'Загрузка...' : 'Изменить баннер'}
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

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Аватар
                {tempAvatar && <span className="ml-2 text-xs text-green-600">(новый)</span>}
              </label>
              <div 
                className={`relative w-32 h-32 mx-auto rounded-full cursor-pointer overflow-hidden ${
                  isUploading && uploadingType === 'avatar' ? 'opacity-50' : ''
                }`}
                onClick={() => !isUploading && avatarInputRef.current?.click()}
              >
                <ImagePreview
                  src={avatarPreview}
                  alt="Аватар"
                  className="w-full h-full"
                  type="avatar"
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs text-center px-2">
                    {isUploading && uploadingType === 'avatar' ? 'Загрузка...' : 'Изменить аватар'}
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
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ваше имя"
                disabled={isUploading}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="usertag" className="block text-sm font-medium text-gray-700 mb-2">
                Usertag *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2 text-lg">@</span>
                <input
                  type="text"
                  id="usertag"
                  name="usertag"
                  value={formData.usertag}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 ${
                    errors.usertag ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ваш-usertag"
                  disabled={isUploading}
                />
              </div>
              {errors.usertag && (
                <p className="mt-2 text-sm text-red-600">{errors.usertag}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Только латинские буквы в нижнем регистре, цифры и дефисы (3-20 символов)
              </p>
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="Расскажите о себе..."
                maxLength="500"
                disabled={isUploading}
              />
              <div className="text-sm text-gray-500 text-right mt-1">
                {formData.bio.length}/500
              </div>
            </div>

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
                disabled={isUploading}
              />
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="https://example.com"
                disabled={isUploading}
              />
            </div>

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
                disabled={isUploading}
              >
                <option value="PUBLIC">Публичный</option>
                <option value="FRIENDS_ONLY">Только друзья</option>
                <option value="PRIVATE">Приватный</option>
              </select>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-emerald-600 transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
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
