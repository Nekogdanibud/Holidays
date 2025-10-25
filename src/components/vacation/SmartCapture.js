// src/components/vacation/SmartCapture.js
'use client';

import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';

export default function SmartCapture({ vacation }) {
  const [limits, setLimits] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, [vacation.id]);

  const fetchLimits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/memories/capture-limits?vacationId=${vacation.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLimits(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки лимитов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpload = (captureType, activityId = null) => {
    setUploadConfig({ captureType, activityId });
    setShowUpload(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!limits) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          Не удалось загрузить информацию о лимитах
        </div>
      </div>
    );
  }

  const { daily, activities } = limits;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Запечатлеть яркий момент</h3>
      
      {/* Дневной слот */}
      <CaptureSlot
        title="Момент дня"
        description="3 ярких фото в день"
        used={daily.used}
        total={daily.total}
        remaining={daily.remaining}
        onClick={() => openUpload('DAILY_MOMENT')}
        type="daily"
      />

      {/* Слоты по активностям */}
      {activities.map(activity => (
        <CaptureSlot
          key={activity.activityId}
          title={activity.title}
          description="3 ярких фото на активность"
          used={activity.used}
          total={activity.total}
          remaining={activity.remaining}
          onClick={() => openUpload('ACTIVITY_MOMENT', activity.activityId)}
          type="activity"
        />
      ))}

      {activities.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          На сегодня нет активностей для запечатления моментов
        </div>
      )}

      {showUpload && (
        <div className="mt-6">
          <PhotoUpload
            vacationId={vacation.id}
            captureType={uploadConfig.captureType}
            activityId={uploadConfig.activityId}
            onUpload={() => {
              setShowUpload(false);
              fetchLimits(); // Обновляем лимиты
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}
    </div>
  );
}

function CaptureSlot({ title, description, used, total, remaining, onClick, type }) {
  const disabled = remaining === 0;
  const percentage = (used / total) * 100;

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg mb-3 transition-all ${
      disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-emerald-300 cursor-pointer'
    }`}>
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            type === 'daily' ? 'bg-blue-500' : 'bg-green-500'
          }`}></div>
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-600">{description}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    disabled ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">
                {used}/{total}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
      >
        {disabled ? 'Лимит' : `+${remaining}`}
      </button>
    </div>
  );
}
