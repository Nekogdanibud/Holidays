// src/components/vacation/PlansSection.js
'use client';

import { useState, useEffect } from 'react';

export default function PlansSection({ vacation, preview = false }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Форма для новой активности
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'activity',
    location: ''
  });

  useEffect(() => {
    fetchPlans();
  }, [vacation.id]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`/api/vacations/${vacation.id}/activities`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки планов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Форматируем дату и время
      const activityDate = new Date(newActivity.date);
      if (newActivity.startTime) {
        const [hours, minutes] = newActivity.startTime.split(':');
        activityDate.setHours(parseInt(hours), parseInt(minutes));
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newActivity.title,
          description: newActivity.description,
          date: activityDate.toISOString(),
          type: newActivity.type,
          vacationId: vacation.id,
          startTime: newActivity.startTime || null,
          endTime: newActivity.endTime || null
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Добавляем новую активность в список
        setPlans(prev => [data, ...prev]);
        
        // Сбрасываем форму
        setNewActivity({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          type: 'activity',
          location: ''
        });
        
        setShowAddForm(false);
      } else {
        alert(data.message || 'Ошибка при создании активности');
      }
    } catch (error) {
      console.error('Ошибка создания активности:', error);
      alert('Ошибка сети');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUpcomingPlans = () => {
    const now = new Date();
    return plans
      .filter(plan => new Date(plan.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, preview ? 3 : 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanEmoji = (type) => {
    const emojis = {
      flight: '✈️',
      hotel: '🏨',
      restaurant: '🍽️',
      attraction: '🏛️',
      transportation: '🚗',
      event: '🎪',
      activity: '🎯',
      shopping: '🛍️',
      beach: '🏖️',
      hiking: '🥾',
      museum: '🏛️',
      concert: '🎵',
      sports: '⚽'
    };
    return emojis[type] || '📅';
  };

  const activityTypes = [
    { value: 'activity', label: '🎯 Активность', emoji: '🎯' },
    { value: 'flight', label: '✈️ Перелет', emoji: '✈️' },
    { value: 'hotel', label: '🏨 Отель', emoji: '🏨' },
    { value: 'restaurant', label: '🍽️ Ресторан', emoji: '🍽️' },
    { value: 'attraction', label: '🏛️ Достопримечательность', emoji: '🏛️' },
    { value: 'transportation', label: '🚗 Транспорт', emoji: '🚗' },
    { value: 'event', label: '🎪 Мероприятие', emoji: '🎪' },
    { value: 'shopping', label: '🛍️ Шоппинг', emoji: '🛍️' },
    { value: 'beach', label: '🏖️ Пляж', emoji: '🏖️' },
    { value: 'hiking', label: '🥾 Поход', emoji: '🥾' },
    { value: 'museum', label: '🏛️ Музей', emoji: '🏛️' },
    { value: 'concert', label: '🎵 Концерт', emoji: '🎵' },
    { value: 'sports', label: '⚽ Спорт', emoji: '⚽' }
  ];

  const upcomingPlans = getUpcomingPlans();
  const nearestPlan = upcomingPlans[0];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Планы и мероприятия</h2>
        
        {!preview && (
          <div className="flex items-center space-x-4">
            {/* Переключение вида */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Список
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Календарь
              </button>
            </div>

            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-semibold flex items-center space-x-2"
            >
              <span>+</span>
              <span>Добавить план</span>
            </button>
          </div>
        )}
      </div>

      {/* Форма добавления активности */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Добавить новую активность</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Название */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название активности *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newActivity.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Например: Посещение Эрмитажа"
                />
              </div>

              {/* Тип активности */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип активности *
                </label>
                <select
                  name="type"
                  value={newActivity.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Дата */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата *
                </label>
                <input
                  type="date"
                  name="date"
                  value={newActivity.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Время начала */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Время начала
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={newActivity.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Время окончания */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Время окончания
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={newActivity.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Описание */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={newActivity.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Дополнительная информация о активности..."
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                    <span>Добавление...</span>
                  </>
                ) : (
                  <span>Добавить активность</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ближайший план (только в превью) */}
      {preview && nearestPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl">{getPlanEmoji(nearestPlan.type)}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ближайшее мероприятие</h3>
                  <p className="text-blue-600 font-semibold">Следующее в плане</p>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{nearestPlan.title}</h4>
              <p className="text-gray-600">{nearestPlan.description}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(nearestPlan.date)}
              </div>
            </div>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition duration-200 font-semibold whitespace-nowrap">
              Все планы →
            </button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📅</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Планов пока нет</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Добавьте мероприятия, экскурсии и другие планы, чтобы ничего не забыть во время отпуска
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl hover:bg-emerald-600 transition duration-200 font-semibold shadow-lg"
          >
            + Добавить первый план
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-4">
          {(preview ? upcomingPlans : plans).map((plan) => (
            <div
              key={plan.id}
              className="border-2 border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">{getPlanEmoji(plan.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {plan.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(plan.date)}
                        {plan.startTime && (
                          <span className="ml-2">
                            в {formatTime(plan.date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {plan.description && (
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.location && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        📍 {plan.location.name || plan.location}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {activityTypes.find(t => t.value === plan.type)?.label || plan.type}
                    </span>
                    {plan.author && (
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        👤 {plan.author.name}
                      </span>
                    )}
                    {plan.participants && plan.participants.length > 0 && (
                      <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        👥 {plan.participants.length}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {new Date(plan.date).getDate()}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {new Date(plan.date).toLocaleDateString('ru-RU', { month: 'short' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-center text-gray-500">Вид календаря будет реализован позже</p>
        </div>
      )}

      {preview && upcomingPlans.length > 3 && (
        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-500 transition duration-200 font-semibold shadow-lg">
            Показать все {plans.length} планов →
          </button>
        </div>
      )}
    </div>
  );
}
