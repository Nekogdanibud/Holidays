'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GroupsManagement() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    minPoints: '',
    maxPoints: '',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: '⭐',
    badgeText: '',
    isExclusive: false
  });

  useEffect(() => {
    fetchGroups();
  }, [currentPage, searchTerm]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/groups?page=${currentPage}&search=${searchTerm}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchGroups();
        alert('Группа создана');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка создания группы:', error);
      alert('Ошибка сети');
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const response = await fetch(`/api/admin/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        setEditingGroup(null);
        resetForm();
        fetchGroups();
        alert('Группа обновлена');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка обновления группы:', error);
      alert('Ошибка сети');
    }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm('Вы уверены, что хотите удалить эту группу?')) return;

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchGroups();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Ошибка удаления группы:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: '',
      minPoints: '',
      maxPoints: '',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      icon: '⭐',
      badgeText: '',
      isExclusive: false
    });
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      level: group.level,
      minPoints: group.minPoints,
      maxPoints: group.maxPoints || '',
      color: group.color,
      bgColor: group.bgColor || '#DBEAFE',
      icon: group.icon,
      badgeText: group.badgeText,
      isExclusive: group.isExclusive
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Управление группами</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Создать группу
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка групп...</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${group.bgColor} ${group.color}`}>
                  <span className="mr-2 text-lg">{group.icon}</span>
                  {group.name}
                </div>
                <div className="text-xs text-gray-500">
                  {group._count.userGroups} участников
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Уровень:</span>
                  <span className="font-medium">{group.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Мин. очки:</span>
                  <span className="font-medium">{group.minPoints}</span>
                </div>
                {group.maxPoints && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Макс. очки:</span>
                    <span className="font-medium">{group.maxPoints}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Тип:</span>
                  <span className="font-medium">
                    {group.isExclusive ? 'Эксклюзивная' : 'Обычная'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Link
                  href={`/admin/groups/${group.id}`}
                  className="flex-1 text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                  Подробнее
                </Link>
                <button
                  onClick={() => openEditModal(group)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Назад
            </button>
            <span className="text-sm text-gray-700">
              Страница {currentPage} из {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования группы */}
      {(showCreateModal || editingGroup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingGroup ? 'Редактировать группу' : 'Создать группу'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Уровень *
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимальные очки *
                </label>
                <input
                  type="number"
                  value={formData.minPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, minPoints: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимальные очки
                </label>
                <input
                  type="number"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPoints: e.target.value ? parseInt(e.target.value) : '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Иконка *
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="⭐"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Текст бейджа *
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цвет текста *
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цвет фона
                </label>
                <input
                  type="color"
                  value={formData.bgColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isExclusive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isExclusive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Эксклюзивная группа</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGroup(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                disabled={!formData.name || !formData.description || !formData.level || !formData.minPoints || !formData.icon || !formData.badgeText}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {editingGroup ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
