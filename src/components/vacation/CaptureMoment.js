// src/components/vacation/CaptureMoment.js
'use client';

import { useState } from 'react';

export default function CaptureMoment({ vacation }) {
  const [isOpen, setIsOpen] = useState(false);

  const isVacationActive = () => {
    const now = new Date();
    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);
    return now >= start && now <= end;
  };

  if (!isVacationActive()) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
        <span className="text-2xl">📸</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Запечатлейте сегодняшний день
      </h3>
      <p className="text-gray-600 mb-4 text-sm">
        Добавьте до 3 фотографий, чтобы сохранить моменты этого дня
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-200 text-sm font-medium"
      >
        Добавить фото дня
      </button>
    </div>
  );
}
