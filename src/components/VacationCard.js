// src/components/VacationCard.js
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VacationCard({ vacation }) {
  const [imageError, setImageError] = useState(false);
  
  const calculateDaysLeft = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusInfo = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysLeft = calculateDaysLeft(startDate);

    if (today < start) {
      return {
        type: 'upcoming',
        text: `Через ${daysLeft} д.`,
        color: 'bg-blue-100 text-blue-800'
      };
    } else if (today >= start && today <= end) {
      return {
        type: 'current',
        text: 'Сейчас',
        color: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        type: 'past',
        text: 'Завершен',
        color: 'bg-gray-100 text-gray-800'
      };
    }
  };

  const getVacationEmoji = (destination, status) => {
    // Если есть место назначения, пытаемся определить тип по тексту
    if (destination) {
      const dest = destination.toLowerCase();
      
      // Пляжные направления
      if (dest.includes('пляж') || dest.includes('море') || dest.includes('океан') || 
          dest.includes('остров') || dest.includes('мальдив') || dest.includes('бали') ||
          dest.includes('тайланд') || dest.includes('египет') || dest.includes('турция')) {
        return '🏖️';
      }
      
      // Горные направления
      if (dest.includes('гор') || dest.includes('альп') || dest.includes('лыж') || 
          dest.includes('снег') || dest.includes('шале')) {
        return '🏔️';
      }
      
      // Городские направления
      if (dest.includes('париж') || dest.includes('рим') || dest.includes('барселон') ||
          dest.includes('лондон') || dest.includes('берлин') || dest.includes('праг') ||
          dest.includes('город') || dest.includes('столиц')) {
        return '🏙️';
      }
      
      // Природа и кемпинг
      if (dest.includes('лес') || dest.includes('озер') || dest.includes('река') ||
          dest.includes('кемпинг') || dest.includes('палатк') || dest.includes('поход')) {
        return '⛺';
      }
      
      // Культура и история
      if (dest.includes('музей') || dest.includes('замок') || dest.includes('храм') ||
          dest.includes('пирамид') || dest.includes('истори')) {
        return '🏛️';
      }
    }

    // Если не удалось определить по месту, используем статус
    switch (status) {
      case 'upcoming':
        return '📅';
      case 'current':
        return '🎉';
      case 'past':
        return '📸';
      default:
        return '🌴'; // Пальма по умолчанию
    }
  };

  const getCoverBackground = (status) => {
    const gradients = {
      upcoming: 'from-blue-400 to-cyan-500',
      current: 'from-green-400 to-emerald-500',
      past: 'from-purple-400 to-indigo-500'
    };
    
    return gradients[status] || 'from-emerald-400 to-teal-500';
  };

  const statusInfo = getStatusInfo(vacation.startDate, vacation.endDate);
  const vacationEmoji = getVacationEmoji(vacation.destination, statusInfo.type);
  const coverBackground = getCoverBackground(statusInfo.type);

  return (
    <Link 
      href={`/vacations/${vacation.id}`}
      className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1"
    >
      {/* Изображение обложки */}
      <div className={`relative h-48 bg-gradient-to-br ${coverBackground} overflow-hidden flex items-center justify-center`}>
        {/* Эмодзи на всю карточку */}
        <div className="text-6xl opacity-90 transform group-hover:scale-110 transition-transform duration-300">
          {vacationEmoji}
        </div>
        
        {/* Статус бадж */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} backdrop-blur-sm bg-white/20`}>
          {statusInfo.text}
        </div>
        
        {/* Градиент overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Информация поверх изображения */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-semibold mb-1 line-clamp-1 drop-shadow-lg">
            {vacation.title}
          </h3>
          {vacation.destination && (
            <p className="text-sm opacity-90 line-clamp-1 drop-shadow-lg">
              {vacation.destination}
            </p>
          )}
        </div>
      </div>

      {/* Контент карточки */}
      <div className="p-6">
        {/* Даты */}
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}</span>
        </div>

        {/* Описание (если есть) */}
        {vacation.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {vacation.description}
          </p>
        )}

        {/* Статистика */}
        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1" title="Участники">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>{vacation._count?.members || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1" title="Планы">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{vacation._count?.activities || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1" title="Воспоминания">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{vacation._count?.memories || 0}</span>
            </div>
          </div>

          {/* Владелец/участники */}
          <div className="flex items-center">
            {vacation.members?.slice(0, 3).map((member, index) => (
              <div
                key={member.user.id}
                className={`w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white ${
                  index > 0 ? '-ml-2' : ''
                }`}
                title={member.user.name}
              >
                {member.user.avatar ? (
                  <img
                    src={member.user.avatar}
                    alt={member.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.user.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {vacation.members?.length > 3 && (
              <div 
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white -ml-2"
                title={`Еще ${vacation.members.length - 3} участников`}
              >
                +{vacation.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
