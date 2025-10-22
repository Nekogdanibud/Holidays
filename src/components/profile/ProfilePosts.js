'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePosts({ profile, onUpdate }) {
  // ... (остальной код компонента ProfilePosts без изменений)
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    fetchPosts();
  }, [profile.id]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/profile/posts?userId=${profile.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('Ошибка загрузки постов:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Можно загрузить не более 5 изображений');
      return;
    }
    
    const validFiles = files.filter(file => 
      file && file.size > 0 && file.type.startsWith('image/')
    );
    
    setSelectedImages(validFiles);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && selectedImages.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      
      selectedImages.forEach(image => {
        if (image && image.size > 0) {
          formData.append('images', image);
        }
      });

      const response = await fetch('/api/profile/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setSelectedImages([]);
        onUpdate?.();
      } else {
        const errorData = await response.json();
        console.error('Ошибка создания поста:', errorData.message);
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      alert('Ошибка сети при создании поста');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        onUpdate?.();
      } else {
        const errorData = await response.json();
        console.error('Ошибка удаления поста:', errorData.message);
      }
    } catch (error) {
      console.error('Ошибка удаления поста:', error);
    }
  };

  // Функция для перехода на страницу поста
  const handleOpenPost = (postId) => {
    router.push(`/posts/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Форма создания поста */}
      {isOwnProfile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 md:mb-4">Новая запись</h3>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Поделитесь своими мыслями..."
              className="w-full border border-gray-300 rounded-2xl p-3 md:p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm md:text-base"
              rows="3"
              maxLength="500"
            />
            
            {/* Превью изображений */}
            {selectedImages.length > 0 && (
              <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="w-full h-20 md:h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs md:text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-3 md:mt-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </label>
                
                <div className="text-xs md:text-sm text-gray-500">
                  {profile.profileVisibility === 'PUBLIC' && '📢 Публичный'}
                  {profile.profileVisibility === 'FRIENDS_ONLY' && '👥 Друзья'}
                  {profile.profileVisibility === 'PRIVATE' && '🔒 Приватный'}
                </div>
                
                <span className="text-xs md:text-sm text-gray-500">
                  {newPostContent.length}/500
                </span>
              </div>
              
              <button
                type="submit"
                disabled={(!newPostContent.trim() && selectedImages.length === 0) || isSubmitting}
                className="bg-emerald-500 text-white p-2 md:p-3 rounded-full hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
                title="Опубликовать"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 md:w-5 md:h-5 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 md:w-5 md:h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список постов */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl">📝</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Пока нет записей</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {isOwnProfile ? 
                'Напишите первую запись, чтобы поделиться новостями' :
                !profile.canViewPosts ? 
                  'Нет доступа к постам этого пользователя' :
                  'Пользователь еще не опубликовал ни одной записи'
              }
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user?.id}
              onDelete={handleDeletePost}
              onUpdate={fetchPosts}
              onOpenPost={handleOpenPost}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Компонент для адаптивного отображения изображений
function ImageGrid({ images, onImageClick }) {
  if (images.length === 0) return null;

  const getImageLayout = (images) => {
    const count = images.length;
    
    if (count === 1) {
      return (
        <div className="w-full">
          <ResponsiveImage 
            image={images[0]} 
            index={0}
            onClick={onImageClick}
            className="w-full max-h-80 md:max-h-96"
          />
        </div>
      );
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <ResponsiveImage 
              key={image.id}
              image={image} 
              index={index}
              onClick={onImageClick}
              className="w-full h-32 sm:h-40 md:h-48 lg:h-56"
            />
          ))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="row-span-2">
            <ResponsiveImage 
              image={images[0]} 
              index={0}
              onClick={onImageClick}
              className="w-full h-full min-h-48 md:min-h-56"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((image, index) => (
              <ResponsiveImage 
                key={image.id}
                image={image} 
                index={index + 1}
                onClick={onImageClick}
                className="w-full h-24 sm:h-32 md:h-40"
              />
            ))}
          </div>
        </div>
      );
    }
    
    // 4 и более изображений
    return (
      <div className="grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((image, index) => (
          <div key={image.id} className={index === 0 && count > 4 ? 'relative' : ''}>
            <ResponsiveImage 
              image={image} 
              index={index}
              onClick={onImageClick}
              className="w-full h-24 sm:h-32 md:h-36 lg:h-40"
            />
            {index === 0 && count > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm md:text-lg">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-3 md:mb-4">
      {getImageLayout(images)}
    </div>
  );
}

// Компонент для адаптивного изображения
function ResponsiveImage({ image, index, onClick, className = '' }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsLoaded(true);
    };
    img.src = image.url;
  }, [image.url]);

  const aspectRatio = dimensions.width / dimensions.height;
  const isPortrait = aspectRatio < 0.8;
  const isLandscape = aspectRatio > 1.2;

  return (
    <div 
      className={`
        relative cursor-pointer overflow-hidden rounded-lg bg-gray-100
        transition-transform hover:scale-105 active:scale-95
        ${isPortrait ? 'max-w-xs mx-auto' : ''}
        ${className}
      `}
      onClick={() => onClick(index)}
    >
      <img
        src={image.url}
        alt={`Post image ${index + 1}`}
        className={`
          w-full h-full object-cover
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          maxHeight: isPortrait ? '320px' : 'none'
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Компонент лайтбокса с полным покрытием экрана
function Lightbox({ images, currentIndex, onClose, onIndexChange }) {
  const [startX, setStartX] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchAreaRef = useRef(null);

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    // Полностью блокируем скролл
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, []);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    const endX = e.clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  };

  const goToNextImage = () => {
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    onIndexChange(newIndex);
    setImageLoaded(false);
  };

  const goToPrevImage = () => {
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    onIndexChange(newIndex);
    setImageLoaded(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNextImage();
      if (e.key === 'ArrowLeft') goToPrevImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, onClose]);

  const currentImage = images[currentImageIndex];

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
      onClick={onClose}
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-2xl md:text-4xl z-10 hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-14 md:h-14 flex items-center justify-center"
      >
        ×
      </button>

      {/* Кнопки навигации */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevImage();
            }}
            className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 text-white text-xl md:text-3xl bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:bg-opacity-70 transition-all z-10"
          >
            ‹
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNextImage();
            }}
            className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 text-white text-xl md:text-3xl bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:bg-opacity-70 transition-all z-10"
          >
            ›
          </button>
        </>
      )}

      {/* Область с изображением */}
      <div 
        ref={touchAreaRef}
        className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={currentImage.url}
            alt={`Image ${currentImageIndex + 1}`}
            className={`
              max-w-full max-h-full object-contain
              transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Индикатор загрузки */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Счетчик фото */}
        <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-lg font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Индикатор свайпа */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs md:text-sm opacity-70 text-center">
          <div className="block md:hidden">Свайпните для навигации</div>
          <div className="hidden md:block">Используйте ← → для навигации</div>
        </div>
      </div>

      {/* Миниатюры (только для десктопа) */}
      {images.length > 1 && (
        <div 
          className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 hidden lg:flex space-x-2 max-w-full overflow-x-auto px-4 md:px-6 py-2 md:py-3"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={`Thumbnail ${index + 1}`}
              className={`
                w-12 h-12 md:w-16 md:h-16 object-cover rounded cursor-pointer border-2 transition-all
                ${index === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60'}
                hover:border-gray-400 hover:opacity-100
              `}
              onClick={() => {
                setCurrentImageIndex(index);
                onIndexChange(index);
                setImageLoaded(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент карточки поста
function PostCard({ post, currentUserId, onDelete, onUpdate, onOpenPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.userId === currentUserId));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showMenu, setShowMenu] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxType, setLightboxType] = useState('post'); // 'post' или 'comment'

  const isAuthor = post.authorId === currentUserId;
  const isLongContent = post.content.length > 150;

  // Получаем последний комментарий
  const lastComment = post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.post-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const handleLikePost = async () => {
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(previousIsLiked ? previousLikesCount - 1 : previousLikesCount + 1);

    try {
      const response = await fetch(`/api/profile/posts/${post.id}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
      }
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) return;

    setIsSubmittingEdit(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsEditing(false);
        setShowMenu(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Ошибка редактирования поста:', error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Функция для открытия фотографий поста
  const openPostLightbox = (index) => {
    setLightboxImages(post.images || []);
    setCurrentImageIndex(index);
    setLightboxType('post');
    setLightboxOpen(true);
  };

  // Функция для открытия фотографий комментария
  const openCommentLightbox = (imageIndex) => {
    if (lastComment && lastComment.images) {
      setLightboxImages(lastComment.images);
      setCurrentImageIndex(imageIndex);
      setLightboxType('comment');
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handleImageIndexChange = (index) => {
    setCurrentImageIndex(index);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60 * 1000) return 'только что';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} мин назад`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} ч назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayContent = isExpanded || !isLongContent 
    ? post.content 
    : post.content.slice(0, 150) + '...';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        {/* Заголовок поста */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                post.author.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm md:text-base">{post.author.name}</div>
              <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                {post.updatedAt > post.createdAt && (
                  <span className="text-xs text-gray-400">(ред.)</span>
                )}
              </div>
            </div>
          </div>

          {/* Меню действий для автора */}
          {isAuthor && (
            <div className="relative post-menu">
              <button 
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Редактирование поста */}
        {isEditing && (
          <div className="mb-3 md:mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm md:text-base"
              rows="3"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-xs md:text-sm"
              >
                Отмена
              </button>
              <button
                onClick={handleEditPost}
                disabled={!editContent.trim() || isSubmittingEdit}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-xs md:text-sm"
              >
                {isSubmittingEdit ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}

        {/* Содержимое поста */}
        {!isEditing && (
          <>
            <div className="mb-3 md:mb-4">
              <p className="text-gray-800 whitespace-pre-wrap text-sm md:text-base">{displayContent}</p>
              {isLongContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium mt-2"
                >
                  {isExpanded ? 'Свернуть' : 'Читать далее'}
                </button>
              )}
            </div>

            {/* Изображения поста */}
            <ImageGrid 
              images={post.images || []} 
              onImageClick={openPostLightbox}
            />
          </>
        )}

        {/* Действия */}
        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button
              onClick={handleLikePost}
              className={`flex items-center space-x-1 md:space-x-2 text-xs md:text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => onOpenPost(post.id)}
              className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </button>
          </div>
        </div>

        {/* Последний комментарий */}
        {lastComment && (
          <div className="mt-3 md:mt-4 border-t border-gray-100 pt-3 md:pt-4">
            <div className="flex space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {lastComment.author.avatar ? (
                  <img
                    src={lastComment.author.avatar}
                    alt={lastComment.author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  lastComment.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-xl p-2 md:p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900 text-xs md:text-sm truncate">
                      {lastComment.author.name}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(lastComment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-xs md:text-sm break-words">{lastComment.content}</p>
                  
                  {/* Изображения комментария */}
                  {lastComment.images && lastComment.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2 max-w-xs">
                      {lastComment.images.map((image, imageIndex) => (
                        <div 
                          key={image.id}
                          className="cursor-pointer"
                          onClick={() => openCommentLightbox(imageIndex)}
                        >
                          <img
                            src={image.url}
                            alt="Comment image"
                            className="w-full h-16 md:h-20 object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка "Показать все комментарии" если их больше 1 */}
            {post.comments.length > 1 && (
              <button
                onClick={() => onOpenPost(post.id)}
                className="text-emerald-600 hover:text-emerald-700 text-xs md:text-sm font-medium mt-2 block"
              >
                Показать все {post.comments.length} комментариев
              </button>
            )}
          </div>
        )}
      </div>

      {/* Лайтбокс для фотографий поста и комментариев */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onIndexChange={handleImageIndexChange}
        />
      )}
    </>
  );
}
