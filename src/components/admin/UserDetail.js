'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [availableGroups, setAvailableGroups] = useState([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditData(data.user);
      } else if (response.status === 404) {
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableGroups = async () => {
    setIsGroupsLoading(true);
    try {
      const response = await fetch('/api/admin/groups?limit=100', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableGroups(data.groups);
      }
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
    } finally {
      setIsGroupsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        alert('Данные пользователя обновлены');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      alert('Ошибка сети');
    }
  };

  const addUserToGroup = async (groupId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchUser(); // Обновляем данные пользователя
        setShowAddGroupModal(false);
        setSelectedGroupId('');
        alert('Пользователь добавлен в группу');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка добавления в группу:', error);
      alert('Ошибка сети');
    }
  };

  const removeUserFromGroup = async (groupId) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя из этой группы?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/groups?groupId=${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchUser(); // Обновляем данные пользователя
        alert('Пользователь удален из группы');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка удаления из группы:', error);
      alert('Ошибка сети');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MODERATOR': return 'bg-purple-100 text-purple-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Вызываем загрузку групп при открытии модального окна
  useEffect(() => {
    if (showAddGroupModal) {
      fetchAvailableGroups();
    }
  }, [showAddGroupModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Пользователь не найден</p>
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
          Вернуться к списку пользователей
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Назад к списку пользователей
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Профиль пользователя</h1>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(user);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Отмена
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Баннер и аватар */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          {user.banner && (
            <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-white rounded-full p-1">
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-10 px-6 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">@{user.usertag}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-500">
                  Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статистика */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Статистика</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user._count?.ownedVacations || 0}</div>
                <div className="text-sm text-gray-600">Создано отпусков</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user._count?.vacationMembers || 0}</div>
                <div className="text-sm text-gray-600">Участвует в отпусках</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user._count?.posts || 0}</div>
                <div className="text-sm text-gray-600">Постов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{user._count?.memories || 0}</div>
                <div className="text-sm text-gray-600">Воспоминаний</div>
              </div>
            </div>
          </div>

          {/* Последние отпуски */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Последние отпуски</h3>
            <div className="space-y-3">
              {user.ownedVacations?.map(vacation => (
                <div key={vacation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{vacation.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(vacation.startDate).toLocaleDateString('ru-RU')} - {new Date(vacation.endDate).toLocaleDateString('ru-RU')}
                    </div>
                    {vacation.destination && (
                      <div className="text-sm text-gray-500">📍 {vacation.destination}</div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>👤 {vacation._count?.members || 0}</div>
                    <div>📸 {vacation._count?.memories || 0}</div>
                  </div>
                </div>
              ))}
              {(!user.ownedVacations || user.ownedVacations.length === 0) && (
                <p className="text-gray-500 text-center py-4">Нет созданных отпусков</p>
              )}
            </div>
          </div>

          {/* Последние посты */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Последние посты</h3>
            <div className="space-y-3">
              {user.posts?.map(post => (
                <div key={post.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <p className="text-gray-900">{post.content}</p>
                  <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                    <span>💬 {post._count?.comments || 0}</span>
                    <span>❤️ {post._count?.likes || 0}</span>
                  </div>
                </div>
              ))}
              {(!user.posts || user.posts.length === 0) && (
                <p className="text-gray-500 text-center py-4">Нет постов</p>
              )}
            </div>
          </div>

          {/* Достижения */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Последние достижения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.achievements?.map(achievement => (
                <div key={achievement.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
              {(!user.achievements || user.achievements.length === 0) && (
                <p className="text-gray-500 text-center py-4 col-span-full">Нет достижений</p>
              )}
            </div>
          </div>
        </div>

        {/* Боковая панель с информацией */}
        <div className="space-y-6">
          {/* Контактная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Местоположение</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.location || 'Не указано'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Веб-сайт</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.website || 'Не указан'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Очки опыта</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.experiencePoints || 0}
                    onChange={(e) => handleInputChange('experiencePoints', parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.experiencePoints || 0}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Видимость профиля</label>
                {isEditing ? (
                  <select
                    value={editData.profileVisibility || 'PUBLIC'}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLIC">Публичный</option>
                    <option value="FRIENDS_ONLY">Только друзья</option>
                    <option value="PRIVATE">Приватный</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {user.profileVisibility === 'PUBLIC' && 'Публичный'}
                    {user.profileVisibility === 'FRIENDS_ONLY' && 'Только друзья'}
                    {user.profileVisibility === 'PRIVATE' && 'Приватный'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Биография</label>
                {isEditing ? (
                  <textarea
                    value={editData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows="3"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.bio || 'Не указана'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Группы пользователя */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Группы</h3>
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
              >
                Добавить в группу
              </button>
            </div>
            <div className="space-y-2">
              {user.userGroups?.map(userGroup => (
                <div
                  key={userGroup.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                >
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userGroup.group.bgColor} ${userGroup.group.color}`}>
                    <span className="mr-2">{userGroup.group.icon}</span>
                    {userGroup.group.name}
                    {userGroup.group.isExclusive && (
                      <span className="ml-2 text-xs opacity-75">(эксклюзив)</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeUserFromGroup(userGroup.group.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              ))}
              {(!user.userGroups || user.userGroups.length === 0) && (
                <p className="text-gray-500 text-sm">Пользователь не состоит в группах</p>
              )}
            </div>
          </div>

          {/* Дополнительная статистика */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Дополнительная статистика</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Друзья:</span>
                <span className="font-medium">
                  {(user._count?.friendsAsUser1 || 0) + (user._count?.friendsAsUser2 || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Комментарии к воспоминаниям:</span>
                <span className="font-medium">{user._count?.memoryComments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Лайки воспоминаний:</span>
                <span className="font-medium">{user._count?.memoryLikes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Активности:</span>
                <span className="font-medium">{user._count?.activityParticipants || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления в группу */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Добавить в группу</h3>
            
            {isGroupsLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Загрузка групп...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите группу</option>
                  {availableGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.icon} {group.name} (Уровень {group.level})
                      {group.isExclusive && ' - Эксклюзивная'}
                    </option>
                  ))}
                </select>
                
                {selectedGroupId && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Информация о группе:</h4>
                    {(() => {
                      const selectedGroup = availableGroups.find(g => g.id === selectedGroupId);
                      return selectedGroup ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Описание: {selectedGroup.description}</div>
                          <div>Минимальные очки: {selectedGroup.minPoints}</div>
                          <div>Участников: {selectedGroup._count?.userGroups || 0}</div>
                          {selectedGroup.isExclusive && (
                            <div className="text-orange-600 font-medium">Эксклюзивная группа</div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddGroupModal(false);
                      setSelectedGroupId('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => addUserToGroup(selectedGroupId)}
                    disabled={!selectedGroupId}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
