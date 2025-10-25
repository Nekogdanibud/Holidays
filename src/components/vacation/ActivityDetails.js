// src/components/vacation/ActivityDetail.js
'use client';

import { useEffect, useState } from 'react';
import PhotoUpload from './PhotoUpload';
import MemoryGrid from './MemoryGrid';

export default function ActivityDetail({ vacationId, activityId }) {
  const [activity, setActivity] = useState(null);
  const [captureMemories, setCaptureMemories] = useState([]);
  const [regularMemories, setRegularMemories] = useState([]);
  const [tab, setTab] = useState('capture');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vacations/${vacationId}/activities/${activityId}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/memories?activityId=${activityId}&captureType=ACTIVITY_MOMENT`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/memories?activityId=${activityId}&captureType=null`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([act, cap, reg]) => {
      setActivity(act);
      setCaptureMemories(cap);
      setRegularMemories(reg);
    });
  }, [vacationId, activityId]);

  if (!activity) return <div className="p-6">Загрузка…</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(activity.date).toLocaleDateString('ru-RU')} • {activity.location?.name}
      </p>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setTab('capture')}
          className={`px-4 py-2 rounded ${tab === 'capture' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
        >
          Запечатлённые ({captureMemories.length})
        </button>
        <button
          onClick={() => setTab('regular')}
          className={`px-4 py-2 rounded ${tab === 'regular' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
        >
          Обычные фото ({regularMemories.length})
        </button>
      </div>

      {tab === 'capture' && <MemoryGrid memories={captureMemories} showBadge />}
      {tab === 'regular' && <MemoryGrid memories={regularMemories} />}

      <button
        onClick={() => setShowUpload(true)}
        className="mt-6 w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600"
      >
        + Добавить фото
      </button>

      {showUpload && (
        <div className="mt-6">
          <PhotoUpload
            vacationId={vacationId}
            captureType={tab === 'capture' ? 'ACTIVITY_MOMENT' : null}
            activityId={activityId}
            onUpload={() => {
              setShowUpload(false);
              window.location.reload();
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}
    </div>
  );
}
