'use client';

import { useState, useEffect } from 'react';

// Утилиты для работы с временем
class TimeZoneUtils {
  static getUserLocalTime() {
    return new Date();
  }

  static convertToLocalTime(utcDateString) {
    if (!utcDateString) return null;
    
    const utcDate = new Date(utcDateString);
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    
    return localDate;
  }

  static getTimezoneOffset() {
    return new Date().getTimezoneOffset();
  }

  static formatLocalDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = this.convertToLocalTime(dateString);
    const defaultOptions = {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    };
    
    return date.toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
  }

  static getUserTimezoneInfo() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = -this.getTimezoneOffset() / 60;
      const offsetString = `UTC${offset >= 0 ? '+' : ''}${offset}`;
      
      const locations = {
        'Europe/Moscow': 'Москва',
        'Europe/London': 'Лондон',
        'Europe/Berlin': 'Берлин',
        'Europe/Paris': 'Париж',
        'America/New_York': 'Нью-Йорк',
        'Asia/Tokyo': 'Токио',
        'Asia/Shanghai': 'Шанхай'
      };
      
      return {
        timezone,
        offset,
        offsetString,
        location: locations[timezone] || timezone
      };
    } catch (error) {
      return {
        timezone: 'Unknown',
        offset: 0,
        offsetString: 'UTC',
        location: 'Локальное время'
      };
    }
  }
}

class TimeCalculationUtils {
  static calculateTimeLeft(targetDate, referenceDate = new Date()) {
    const target = new Date(targetDate);
    const now = referenceDate;
    
    const diff = target - now;
    
    if (diff <= 0) {
      return {
        status: 'past',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0
      };
    }
    
    return {
      status: 'upcoming',
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      totalMs: diff
    };
  }

  static getVacationStatus(startDate, endDate, referenceDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = referenceDate;
    
    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'current';
    } else {
      return 'past';
    }
  }
}

export default function VacationTimer({ vacation }) {
  const [timeLeft, setTimeLeft] = useState({
    status: 'upcoming',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [userTimezone, setUserTimezone] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const timezoneInfo = TimeZoneUtils.getUserTimezoneInfo();
    setUserTimezone(timezoneInfo);

    const calculateTimeLeft = () => {
      const now = TimeZoneUtils.getUserLocalTime();
      
      const localStartDate = TimeZoneUtils.convertToLocalTime(vacation.startDate);
      const localEndDate = TimeZoneUtils.convertToLocalTime(vacation.endDate);
      
      const status = TimeCalculationUtils.getVacationStatus(
        localStartDate, 
        localEndDate, 
        now
      );
      
      let targetDate;
      if (status === 'upcoming') {
        targetDate = localStartDate;
      } else if (status === 'current') {
        targetDate = localEndDate;
      } else {
        targetDate = localEndDate;
      }
      
      const calculatedTime = TimeCalculationUtils.calculateTimeLeft(targetDate, now);
      
      setTimeLeft({
        ...calculatedTime,
        status
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

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
    if (days === 0) return 'дней';
    
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

  const formatTimeWithLeadingZero = (number) => {
    return number.toString().padStart(2, '0');
  };

  // Если не клиент, показываем заглушку
  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl p-6 max-w-md mx-auto">
            <div className="animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-4 mx-auto w-48"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-8 bg-white/20 rounded mb-1"></div>
                    <div className="h-4 bg-white/20 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center">
        <div className={`bg-gradient-to-r ${config.gradient} text-white rounded-2xl p-6 max-w-md mx-auto shadow-xl relative overflow-hidden`}>
          {/* Фоновый узор для улучшения читаемости */}
          <div className="absolute inset-0 bg-black/5"></div>
          
          {/* Информация о часовом поясе */}
          {userTimezone && (
            <div className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-flex items-center space-x-1 mb-4 relative z-10">
              <span>🕐</span>
              <span>Ваше время: {userTimezone.location}</span>
              <span className="hidden sm:inline">({userTimezone.offsetString})</span>
            </div>
          )}
          
          <div className="text-4xl mb-3 relative z-10">
            {config.emoji}
          </div>
          
          <h2 className="text-xl font-bold mb-2 relative z-10">{config.title}</h2>
          <p className="text-white/80 mb-4 text-sm relative z-10">{config.description}</p>
          
          {timeLeft.status !== 'past' ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative z-10">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider bg-white/10 rounded-lg py-2 px-1 min-h-[3rem] flex items-center justify-center">
                    {timeLeft.days}
                  </div>
                  <div className="text-xs opacity-90 mt-2 font-medium">{getDaysText(timeLeft.days)}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider bg-white/10 rounded-lg py-2 px-1 min-h-[3rem] flex items-center justify-center">
                    {formatTimeWithLeadingZero(timeLeft.hours)}
                  </div>
                  <div className="text-xs opacity-90 mt-2 font-medium">часов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider bg-white/10 rounded-lg py-2 px-1 min-h-[3rem] flex items-center justify-center">
                    {formatTimeWithLeadingZero(timeLeft.minutes)}
                  </div>
                  <div className="text-xs opacity-90 mt-2 font-medium">мин</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider bg-white/10 rounded-lg py-2 px-1 min-h-[3rem] flex items-center justify-center">
                    {formatTimeWithLeadingZero(timeLeft.seconds)}
                  </div>
                  <div className="text-xs opacity-90 mt-2 font-medium">сек</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative z-10">
              <p className="text-md font-semibold">Время создавать воспоминания!</p>
              <p className="text-xs opacity-90 mt-1">Поделитесь фотографиями и впечатлениями</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-white/20 relative z-10">
            <div className="text-sm opacity-80">
              {TimeZoneUtils.formatLocalDate(vacation.startDate)} - {' '}
              {TimeZoneUtils.formatLocalDate(vacation.endDate)}
            </div>
            
            {vacation.destination && (
              <div className="text-sm opacity-80 mt-2 flex items-center justify-center">
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
