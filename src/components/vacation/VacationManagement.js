// components/vacation/VacationManagement.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import InviteFriendsModal from './InviteFriendsModal';

export default function VacationManagement({ vacation, onUpdate }) {
  const { user } = useAuth();
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = vacation.userId === user?.id;

  const handleDeleteVacation = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот отпуск? Все данные (планы, воспоминания, участники) будут безвозвратно удалены. Это действие нельзя отменить.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Отпуск "${result.deletedVacation?.title || vacation.title}" успешно удален`);
        router.push('/my-vacations');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка при удалении отпуска');
      }
    } catch (error) {
      console.error('Ошибка удаления отпуска:', error);
      alert('Ошибка сети при удалении отпуска');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditVacation = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        await onUpdate();
        setShowEditModal(false);
        alert('Отпуск успешно обновлен!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка при обновлении отпуска');
      }
    } catch (error) {
      console.error('Ошибка обновления отпуска:', error);
      alert('Ошибка сети при обновлении отпуска');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Вы уверены, что хотите удалить ${memberName} из отпуска?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vacations/${vacation.id}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        await onUpdate();
        alert(`${result.removedUser?.name || memberName} удален из отпуска`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ошибка при удалении участника');
      }
    } catch (error) {
      console.error('Ошибка удаления участника:', error);
      alert('Ошибка сети');
    }
  };

  if (!isOwner) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👑</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Только для владельца</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Функции управления доступны только создателю отпуска. 
            Если вам нужны права управления, попросите владельца добавить вас как соорганизатора.
          </p>
        </div>
      </div>
    );
  }

  const totalMembers = vacation.members?.length || 1;
  const acceptedMembers = vacation.members?.filter(m => m.status === 'ACCEPTED').length || 1;
  const pendingMembers = vacation.members?.filter(m => m.status === 'PENDING').length || 0;

  return (
    <div className="space-y-6">
      {/* Статистика и быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{acceptedMembers}</div>
          <div className="text-sm text-gray-600">Участников</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{vacation._count?.activities || 0}</div>
          <div className="text-sm text-gray-600">Планов</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{vacation._count?.memories || 0}</div>
          <div className="text-sm text-gray-600">Воспоминаний</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Приглашение друзей */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Участники</h3>
              <p className="text-sm text-gray-600">
                {acceptedMembers} участник{acceptedMembers === 1 ? '' : 'а'}
                {pendingMembers > 0 && `, ${pendingMembers} ожидает`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Пригласить друзей
          </button>
        </div>

        {/* Редактирование отпуска */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">✏️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Редактировать</h3>
              <p className="text-sm text-gray-600">Даты, название, описание</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Изменить отпуск
          </button>
        </div>
      </div>

      {/* Список участников */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Все участники</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {totalMembers} всего
          </span>
        </div>
        
        {vacation.members?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-gray-600">Пока нет других участников</p>
            <p className="text-sm text-gray-500 mt-1">Пригласите друзей присоединиться к отпуску</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Владелец */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {vacation.user.avatar ? (
                    <img
                      src={vacation.user.avatar}
                      alt={vacation.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    vacation.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {vacation.user.name}
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Владелец
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 truncate">@{vacation.user.usertag}</div>
                </div>
              </div>
            </div>

            {/* Остальные участники */}
            {vacation.members?.map((member) => (
              member.userId !== vacation.userId && (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {member.user.name}
                        {member.role === 'CO_ORGANIZER' && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Организатор
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">@{member.user.usertag}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      member.status === 'ACCEPTED' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status === 'ACCEPTED' ? 'Участник' : 'Ожидает'}
                    </div>
                    
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user.name)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      title="Удалить участника"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Опасная зона */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-700">Опасная зона</h3>
            <p className="text-sm text-gray-600">
              Удаление отпуска нельзя отменить. Все данные будут безвозвратно удалены.
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">
            <strong>Будет удалено:</strong> все планы, воспоминания, фотографии, участники и настройки отпуска.
          </p>
        </div>
        <button
          onClick={handleDeleteVacation}
          disabled={isDeleting}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold w-full flex items-center justify-center space-x-2"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              <span>Удаление...</span>
            </>
          ) : (
            <>
              <span>🗑️</span>
              <span>Удалить отпуск</span>
            </>
          )}
        </button>
      </div>

      {/* Модальные окна */}
      {showInviteModal && (
        <InviteFriendsModal
          vacation={vacation}
          onClose={() => setShowInviteModal(false)}
          onInvite={onUpdate}
        />
      )}

      {showEditModal && (
        <EditVacationModal
          vacation={vacation}
          onSubmit={handleEditVacation}
          onCancel={() => setShowEditModal(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Компонент модального окна редактирования отпуска
function EditVacationModal({ vacation, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: vacation.title,
    description: vacation.description || '',
    destination: vacation.destination || '',
    startDate: vacation.startDate.split('T')[0],
    endDate: vacation.endDate.split('T')[0],
    coverImage: vacation.coverImage || '',
    isPublic: vacation.isPublic || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title.trim()) {
      alert('Название отпуска обязательно');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert('Даты начала и окончания обязательны');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('Дата начала не может быть позже даты окончания');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Редактировать отпуск</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название отпуска *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Название вашего отпуска"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Место назначения
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Куда едете?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Описание отпуска..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Начало *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Конец *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL обложки
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Сделать отпуск публичным
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
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
  );
}
