// src/components/vacation/PlanSection.js
'use client';

import { useState, useEffect } from 'react';
import ActivityCard from './ActivityCard';
import CreateActivityModal from './CreateActivityModal';

export default function PlanSection({ vacation, preview = false }) {
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [vacation.id]);

  useEffect(() => {
    if (activities.length > 0) {
      if (preview) {
        // На главной: показываем только сегодняшний и ближайшие 2 плана
        filterActivitiesForPreview(activities);
      } else {
        // В полной вкладке: показываем все планы
        setDisplayedActivities(activities);
      }
    }
  }, [activities, preview]);

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

  const filterActivitiesForPreview = (allActivities) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Фильтруем планы: только сегодня и будущие
    const futureActivities = allActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
      return activityDay >= today;
    });

    // Сортируем по дате
    futureActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Берем максимум 3 ближайших плана (сегодняшний + 2 следующих)
    const previewActivities = futureActivities.slice(0, 3);
    
    setDisplayedActivities(previewActivities);
  };

  const handleActivityCreated = (newActivity) => {
    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    
    if (preview) {
      filterActivitiesForPreview(updatedActivities);
    }
  };

  // Группируем активности по датам для отображения
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

  const getSectionTitle = () => {
    if (preview) {
      return `Ближайшие планы (${displayedActivities.length})`;
    }
    return `Планы (${activities.length})`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {getSectionTitle()}
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

      {displayedActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {preview ? 'На сегодня планов нет' : 'Пока нет активностей'}
          </h3>
          <p className="text-gray-600 mb-6">
            {preview 
              ? 'Запланируйте активности на ближайшие дни' 
              : 'Создайте первую активность для вашего отпуска'
            }
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

      {/* Показываем кнопку "Показать все" только если есть больше планов чем отображается */}
      {preview && activities.length > displayedActivities.length && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = `/vacations/${vacation.id}?tab=plans`}
            className="w-full text-center text-emerald-600 hover:text-emerald-700 font-medium py-2 flex items-center justify-center space-x-2"
          >
            <span>Показать все {activities.length} активностей</span>
            <span>→</span>
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
