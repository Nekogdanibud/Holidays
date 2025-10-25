// components/vacation/VacationTimer.js
'use client';

import { useState, useEffect } from 'react';

export default function VacationTimer({ vacation }) {
  const [timeLeft, setTimeLeft] = useState({
    status: 'upcoming',
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(vacation.startDate);
      const endDate = new Date(vacation.endDate);
      
      if (now < startDate) {
        const diff = startDate - now;
        return {
          status: 'upcoming',
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        };
      } else if (now <= endDate) {
        const diff = endDate - now;
        return {
          status: 'current',
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        };
      } else {
        return {
          status: 'past',
          days: 0,
          hours: 0,
          minutes: 0
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
          title: 'До начала отпуска',
          gradient: 'from-blue-500 to-cyan-500',
          emoji: '🛩️',
          description: 'Скоро начнется ваше путешествие!'
        };
      case 'current':
        return {
          title: 'До конца отпуска',
          gradient: 'from-green-500 to-emerald-500',
          emoji: '🎉',
          description: 'Наслаждайтесь каждым моментом!'
        };
      case 'past':
        return {
          title: 'Отпуск завершен',
          gradient: 'from-purple-500 to-pink-500',
          emoji: '🏆',
          description: 'Надеемся, вам понравилось путешествие!'
        };
      default:
        return {
          title: 'Отпуск',
          gradient: 'from-gray-500 to-gray-600',
          emoji: '📅',
          description: ''
        };
    }
  };

  const config = getStatusConfig();

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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center">
        <div className={`bg-gradient-to-r ${config.gradient} text-white rounded-2xl p-8 max-w-md mx-auto shadow-xl`}>
          <div className="text-4xl mb-4 transform hover:scale-110 transition-transform duration-300">
            {config.emoji}
          </div>
          
          <h2 className="text-2xl font-bold mb-2 drop-shadow-sm">{config.title}</h2>
          <p className="text-white/80 mb-6 text-sm">{config.description}</p>
          
          {timeLeft.status !== 'past' ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center space-x-6">
                <div className="text-center">
                  <div className="text-4xl font-bold drop-shadow-md">{timeLeft.days}</div>
                  <div className="text-sm opacity-90 mt-1">{getDaysText(timeLeft.days)}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold drop-shadow-md">{timeLeft.hours}</div>
                  <div className="text-sm opacity-90 mt-1">часов</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold drop-shadow-md">{timeLeft.minutes}</div>
                  <div className="text-sm opacity-90 mt-1">мин</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg font-semibold">Время создавать воспоминания!</p>
              <p className="text-sm opacity-90 mt-2">Поделитесь фотографиями и впечатлениями</p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="text-sm opacity-80">
              {new Date(vacation.startDate).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} - {new Date(vacation.endDate).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            {vacation.destination && (
              <div className="text-sm opacity-80 mt-1 flex items-center justify-center">
                <span className="mr-1">📍</span>
                {vacation.destination}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
