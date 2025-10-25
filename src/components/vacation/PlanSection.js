// src/components/vacation/PlanSection.js
'use client';

import { useState, useEffect } from 'react';
import ActivityCard from './ActivityCard';
import CreateActivityModal from './CreateActivityModal';

export default function PlanSection({ vacation, preview = false }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [vacation.id]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/vacations/${vacation.id}/activities`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityCreated = (newActivity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  const displayedActivities = preview ? activities.slice(0, 3) : activities;

  // Группируем активности по датам
  const activitiesByDate = displayedActivities.reduce((acc, activity) => {
    const dateKey = new Date(activity.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {});

  // Сортируем даты
  const sortedDates = Object.keys(activitiesByDate).sort();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Планы</h2>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Планы {!preview && `(${activities.length})`}
        </h2>
        
        {!preview && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 text-sm font-medium flex items-center space-x-2"
          >
            <span>+</span>
            <span>Создать активность</span>
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Пока нет активностей
          </h3>
          <p className="text-gray-600 mb-6">
            Создайте первую активность для вашего отпуска
          </p>
          {!preview && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
            >
              + Создать активность
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                {new Date(date).toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <div className="space-y-3">
                {activitiesByDate[date].map((activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    vacationId={vacation.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && activities.length > 3 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = `/vacations/${vacation.id}?tab=plans`}
            className="w-full text-center text-emerald-600 hover:text-emerald-700 font-medium py-2"
          >
            Показать все {activities.length} активностей →
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateActivityModal
          vacation={vacation}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleActivityCreated}
        />
      )}
    </div>
  );
}
