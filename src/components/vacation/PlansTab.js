// src/components/vacation/PlansTab.js
'use client';

import { useState, useEffect } from 'react';
import VacationCalendar from './VacationCalendar';
import Link from 'next/link';

export default function PlansTab({ vacationId }) {
  const [view, setView] = useState('list');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vacations/${vacationId}/activities`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [vacationId]);

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">Загрузка…</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Планы</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded ${view === 'list' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
          >
            Список
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1 rounded ${view === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
          >
            Календарь
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Планов пока нет</p>
          ) : (
            activities.map(act => (
              <Link
                key={act.id}
                href={`/vacation/${vacationId}/activity/${act.id}`}
                className="block p-4 border rounded-lg hover:border-emerald-400 transition"
              >
                <div className="font-medium">{act.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(act.date).toLocaleDateString('ru-RU')}
                  {act.location && ` – ${act.location.name}`}
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <VacationCalendar vacation={vacationId} activities={activities} />
      )}
    </div>
  );
}
