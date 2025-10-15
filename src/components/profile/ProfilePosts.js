// src/components/profile/ProfilePosts.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePosts({ profile, onUpdate }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent,
          isPublic,
          userId: user.id // Добавляем userId
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setIsPublic(true);
        onUpdate?.();
      } else {
        const errorData = await response.json();
        console.error('Ошибка создания поста:', errorData.error);
      }
    } catch (error) {
      console.error('Ошибка создания поста:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`/api/profile/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id // Добавляем userId
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.some(like => like.userId === user.id);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(like => like.userId !== user.id)
                : [...post.likes, { userId: user.id }]
            };
          }
          return post;
        }));
      } else {
        const errorData = await response.json();
        console.error('Ошибка лайка поста:', errorData.error);
      }
    } catch (error) {
      console.error('Ошибка лайка поста:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
    <div className="space-y-6">
      {/* Форма создания поста (только для владельца) */}
      {isOwnProfile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Новая запись</h3>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Поделитесь своими мыслями..."
              className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Публичная запись</span>
                </label>
                <span className="text-sm text-gray-500">
                  {newPostContent.length}/500
                </span>
              </div>
              <button
                type="submit"
                disabled={!newPostContent.trim() || isSubmitting}
                className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список постов */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет записей</h3>
            <p className="text-gray-600">
              {isOwnProfile ? 
                'Напишите первую запись, чтобы поделиться новостями' :
                'Пользователь еще не опубликовал ни одной записи'
              }
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLikePost}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Компонент карточки поста
function PostCard({ post, onLike, currentUserId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLiked = post.likes.some(like => like.userId === currentUserId);
  const isLongContent = post.content.length > 200;

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
    : post.content.slice(0, 200) + '...';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Заголовок поста */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
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
            <div className="font-semibold text-gray-900">{post.author.name}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatDate(post.createdAt)}</span>
              {!post.isPublic && (
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Только для меня</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Содержимое поста */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{displayContent}</p>
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2"
          >
            {isExpanded ? 'Свернуть' : 'Читать далее'}
          </button>
        )}
      </div>

      {/* Действия */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes.length}</span>
          </button>

          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments.length}</span>
          </button>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
