'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GroupDetail({ groupId }) {
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
      } else if (response.status === 404) {
        router.push('/admin/groups');
      }
    } catch (error) {
      console.error('Ошибка загрузки группы:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUserFromGroup = async (userId) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя из группы?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/groups?groupId=${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchGroup(); // Обновляем данные группы
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Группа не найдена</p>
        <Link href="/admin/groups" className="text-blue-600 hover:text-blue-800">
          Вернуться к списку групп
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/groups" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Назад к списку групп
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Детали группы</h1>
        </div>
      </div>

      {/* Информация о группе */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${group.bgColor}`}
                 style={{ color: group.color }}>
              {group.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
              <p className="text-gray-600">{group.description}</p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${group.bgColor}`}
               style={{ color: group.color }}>
            {group.badgeText}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{group.level}</div>
            <div className="text-sm text-gray-600">Уровень</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{group.minPoints}</div>
            <div className="text-sm text-gray-600">Мин. очки</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{group._count.userGroups}</div>
            <div className="text-sm text-gray-600">Участников</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {group.isExclusive ? 'Да' : 'Нет'}
            </div>
            <div className="text-sm text-gray-600">Эксклюзивная</div>
          </div>
        </div>
      </div>

      {/* Участники группы */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Участники группы ({group.userGroups.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Очки опыта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата вступления
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {group.userGroups.map((userGroup) => (
                <tr key={userGroup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {userGroup.user.avatar ? (
                          <img src={userGroup.user.avatar} alt={userGroup.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          userGroup.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="ml-4">
                        <Link 
                          href={`/admin/users/${userGroup.user.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {userGroup.user.name}
                        </Link>
                        <div className="text-sm text-gray-500">@{userGroup.user.usertag}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userGroup.user.experiencePoints || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userGroup.joinedAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => removeUserFromGroup(userGroup.user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {group.userGroups.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">В группе нет участников</p>
          </div>
        )}
      </div>
    </div>
  );
}
