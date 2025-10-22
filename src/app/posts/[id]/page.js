// src/app/posts/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentImages, setCommentImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postId = params.id;

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
      } else {
        console.error('Ошибка загрузки поста');
        router.push('/');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && commentImages.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', newComment);
      
      commentImages.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        setNewComment('');
        setCommentImages([]);
        fetchPost(); // Обновляем пост с новыми комментариями
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('Можно загрузить не более 4 изображений');
      return;
    }
    setCommentImages(files);
  };

  const removeImage = (index) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Пост не найден</h1>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Кнопка назад */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Назад</span>
          </button>
        </div>

        {/* Пост */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Заголовок поста */}
          <div className="flex items-center space-x-3 mb-4">
            <Link href={`/profile/${post.author.usertag}`} className="flex items-center space-x-3">
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
                <div className="font-semibold text-gray-900 hover:text-emerald-600">
                  {post.author.name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </Link>
          </div>

          {/* Содержимое поста */}
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap text-lg">
              {post.content}
            </p>
          </div>

          {/* Изображения поста */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-3 mb-4 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.images.map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Статистика */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>

        {/* Форма комментария */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить комментарий</h3>
          <form onSubmit={handleAddComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows="3"
            />
            
            {/* Превью изображений комментария */}
            {commentImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {commentImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 0 002 2z" />
                </svg>
              </label>

              <button
                type="submit"
                disabled={(!newComment.trim() && commentImages.length === 0) || isSubmitting}
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>

        {/* Комментарии */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Комментарии ({post.comments.length})
          </h3>
          
          {post.comments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-600">Пока нет комментариев</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex space-x-3">
                  <Link href={`/profile/${comment.author.usertag || comment.author.id}`} className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        comment.author.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Link 
                        href={`/profile/${comment.author.usertag || comment.author.id}`}
                        className="font-semibold text-gray-900 hover:text-emerald-600"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                    
                    {/* Изображения комментария */}
                    {comment.images && comment.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {comment.images.map((image) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt="Comment image"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
