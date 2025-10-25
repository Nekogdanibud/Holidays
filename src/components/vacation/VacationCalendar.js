// src/components/vacation/VacationCalendar.js
'use client';

import { useState } from 'react';

export default function VacationCalendar({ vacation, activities = [] }) {
  const start = new Date(vacation.startDate);
  const end = new Date(vacation.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const getActivityCount = (date) => {
    return activities.filter(a => {
      const actDate = new Date(a.date);
      actDate.setHours(0, 0, 0, 0);
      return actDate.getTime() === date.getTime();
    }).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Календарь отпуска</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="font-medium text-gray-600 py-2">{day}</div>
        ))}
        {days.map((day, i) => {
          const count = getActivityCount(day);
          const isToday = day.getTime() === today.getTime();
          const isPast = day < today;
          const isFuture = day > today;

          return (
            <div
              key={i}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border ${
                isToday
                  ? 'border-emerald-500 bg-emerald-50'
                  : isPast
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200'
              }`}
            >
              <span className={`text-sm ${isToday ? 'font-bold text-emerald-600' : ''}`}>
                {day.getDate()}
              </span>
              {count > 0 && (
                <span className="text-xs bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-1">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
