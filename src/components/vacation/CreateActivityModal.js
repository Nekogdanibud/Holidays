// src/components/vacation/CreateActivityModal.js
'use client';

import { useState } from 'react';

export default function CreateActivityModal({ vacation, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'ACTIVITY',
    startTime: '',
    endTime: '',
    cost: '',
    notes: '',
    priority: 'MEDIUM',
    status: 'PLANNED'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.date) {
      alert('Название и дата обязательны');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vacationId: vacation.id
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const newActivity = await response.json();
        onCreate(newActivity);
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка создания активности');
      }
    } catch (error) {
      console.error('Ошибка создания активности:', error);
      alert('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const activityTypes = [
    { value: 'FLIGHT', label: '✈️ Перелет', emoji: '✈️' },
    { value: 'HOTEL', label: '🏨 Отель', emoji: '🏨' },
    { value: 'RESTAURANT', label: '🍽️ Ресторан', emoji: '🍽️' },
    { value: 'ATTRACTION', label: '🏛️ Достопримечательность', emoji: '🏛️' },
    { value: 'TRANSPORTATION', label: '🚗 Транспорт', emoji: '🚗' },
    { value: 'EVENT', label: '🎭 Мероприятие', emoji: '🎭' },
    { value: 'ACTIVITY', label: '🎯 Активность', emoji: '🎯' },
    { value: 'SHOPPING', label: '🛍️ Шоппинг', emoji: '🛍️' },
    { value: 'BEACH', label: '🏖️ Пляж', emoji: '🏖️' },
    { value: 'HIKING', label: '🥾 Поход', emoji: '🥾' },
    { value: 'MUSEUM', label: '🖼️ Музей', emoji: '🖼️' },
    { value: 'CONCERT', label: '🎵 Концерт', emoji: '🎵' },
    { value: 'SPORTS', label: '⚽ Спорт', emoji: '⚽' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать активность</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название активности *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Например: Экскурсия по старому городу"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип активности *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время начала
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время окончания
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Описание и заметки */}
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
              placeholder="Подробное описание активности..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заметки
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Дополнительные заметки..."
            />
          </div>

          {/* Стоимость и настройки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Стоимость
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="LOW">🔴 Низкий</option>
                <option value="MEDIUM">🟡 Средний</option>
                <option value="HIGH">🟢 Высокий</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="PLANNED">📅 Запланировано</option>
                <option value="CONFIRMED">✅ Подтверждено</option>
                <option value="IN_PROGRESS">🔄 В процессе</option>
                <option value="COMPLETED">🏁 Завершено</option>
                <option value="CANCELLED">❌ Отменено</option>
              </select>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
                  <span>Создание...</span>
                </>
              ) : (
                <span>Создать активность</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
