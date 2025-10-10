// src/components/vacation/VacationTimer.js
'use client';

import { useState, useEffect } from 'react';

export default function VacationTimer({ vacation }) {
  const [timeLeft, setTimeLeft] = useState({
    status: 'upcoming',
    days: 0
  });

  // Функция для правильного склонения слова "день"
  const getDaysText = (days) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'дней';
    }
    
    if (lastDigit === 1) {
      return 'день';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }
    
    return 'дней';
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      
      if (now < startDate) {
        const diff = startDate - now;
        return {
          status: 'upcoming',
          days: Math.floor(diff / (1000 * 60 * 60 * 24))
        };
      } else if (now <= endDate) {
        const diff = endDate - now;
        return {
          status: 'current',
          days: Math.floor(diff / (1000 * 60 * 60 * 24))
        };
      } else {
        return {
          status: 'past',
          days: 0
        };
      }
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [vacation]);

  const getStatusConfig = () => {
    switch (timeLeft.status) {
      case 'upcoming':
        return {
          text: 'ДО НАЧАЛА ОТПУСКА',
          bgGradient: 'from-blue-50/90 to-sky-50/70',
          borderColor: 'border-blue-200/30',
          textColor: 'text-blue-700',
          emoji: '🛩️',
          // МЯГКИЙ СИНИЙ РАДИАЛЬНЫЙ ГРАДИЕНТ
          radialGradient: 'radial-gradient(circle at center, #93c5fd 0%, #60a5fa 40%, #3b82f6 80%)',
          daysText: 'text-white'
        };
      case 'current':
        return {
          text: 'ДО КОНЦА ОТПУСКА',
          bgGradient: 'from-emerald-50/90 to-teal-50/70',
          borderColor: 'border-emerald-200/30',
          textColor: 'text-emerald-700',
          emoji: '🎉',
          radialGradient: 'radial-gradient(circle at center, #86efac 0%, #4ade80 40%, #16a34a 80%)',
          daysText: 'text-white'
        };
      case 'past':
        return {
          text: 'ОТПУСК ЗАВЕРШЕН',
          bgGradient: 'from-purple-50/90 to-pink-50/70',
          borderColor: 'border-purple-200/30',
          textColor: 'text-purple-700',
          emoji: '🏆',
          radialGradient: 'radial-gradient(circle at center, #d8b4fe 0%, #c084fc 40%, #a855f7 80%)',
          daysText: 'text-white'
        };
      default:
        return {
          text: '',
          bgGradient: 'from-gray-50/90 to-gray-100/70',
          borderColor: 'border-gray-200/30',
          textColor: 'text-gray-700',
          emoji: '📅',
          radialGradient: 'radial-gradient(circle at center, #d1d5db 0%, #9ca3af 40%, #6b7280 80%)',
          daysText: 'text-white'
        };
    }
  };

  const config = getStatusConfig();
  const daysText = getDaysText(timeLeft.days);

  if (timeLeft.status === 'past') {
    return (
      <div className="text-center">
        <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm ${config.textColor} rounded-2xl p-8 max-w-md mx-auto shadow-lg border ${config.borderColor}`}>
          <div className="text-5xl mb-4">{config.emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{config.text}</h2>
          <p className="text-lg opacity-80 mb-4">Надеемся, вам понравилось путешествие!</p>
          {vacation.destination && (
            <div className="bg-white/30 rounded-xl py-3 px-4 border border-white/20 backdrop-blur-sm">
              <span className="text-sm font-medium">📍 {vacation.destination}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm ${config.textColor} rounded-2xl p-8 max-w-sm mx-auto shadow-lg border ${config.borderColor}`}>
        
        {/* Статус и эмодзи */}
        <div className="mb-8">
          <div className="text-4xl mb-3 opacity-90">{config.emoji}</div>
          <h2 className="text-lg font-semibold opacity-90">{config.text}</h2>
        </div>

        {/* КВАДРАТ С МЯГКИМ СИНИМ ГРАДИЕНТОМ */}
        <div className="mb-6 flex justify-center">
          <div 
            className={`${config.daysText} rounded-2xl p-8 border border-white/40 shadow-2xl backdrop-blur-sm w-52 h-52 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 relative overflow-hidden`}
            style={{ background: config.radialGradient }}
          >
            {/* Мягкий оверлей для еще более нежного эффекта */}
            <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
            
            {/* Контент */}
            <div className="relative z-10">
              <div className="text-6xl font-bold mb-2 leading-none drop-shadow-lg">
                {timeLeft.days}
              </div>
              <div className="text-xl font-medium opacity-95 drop-shadow">{daysText}</div>
            </div>
          </div>
        </div>

        {/* Даты отпуска */}
        <div className="bg-white/40 rounded-xl py-4 px-5 border border-white/30 backdrop-blur-sm mb-3">
          <div className="text-sm font-medium opacity-80 mb-1">Даты отпуска</div>
          <div className="text-base font-semibold">
            {new Date(vacation.startDate).toLocaleDateString('ru-RU')} - {new Date(vacation.endDate).toLocaleDateString('ru-RU')}
          </div>
        </div>

        {/* Название отпуска */}
        {vacation.destination && (
          <div className="text-sm opacity-70 font-medium">
            📍 {vacation.destination}
          </div>
        )}
      </div>
    </div>
  );
}
