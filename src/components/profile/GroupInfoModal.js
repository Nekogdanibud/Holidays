// src/components/profile/GroupInfoModal.js
'use client';

export default function GroupInfoModal({ isOpen, onClose, userGroup, levelProgress }) {
  if (!isOpen || !userGroup) return null;

  const isExclusive = userGroup.isExclusive;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 border border-gray-200 shadow-2xl">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Информация о группе</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Бейдж группы */}
          <div className={`flex items-center justify-center px-6 py-4 rounded-xl ${userGroup.bgColor} ${userGroup.color} mb-6`}>
            <span className="text-2xl mr-3">{userGroup.icon}</span>
            <div className="text-center">
              <div className="text-xl font-bold">{userGroup.badgeText}</div>
              <div className="text-sm opacity-90">{userGroup.name}</div>
            </div>
          </div>

          {/* Описание группы */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
              <p className="text-gray-700 text-sm">
                {userGroup.description || 'Особая группа с уникальными привилегиями и статусом.'}
              </p>
            </div>

            {/* Информация о типе группы */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Тип группы</h3>
              {isExclusive ? (
                <div className="space-y-2">
                  <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Эксклюзивная группа</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Эта группа выдана администратором вручную и не зависит от количества очков опыта.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center text-emerald-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Обычная группа</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Эта группа достигается автоматически при наборе определенного количества очков опыта.
                  </p>
                </div>
              )}
            </div>

            {/* Дополнительная информация */}
            {levelProgress && !isExclusive && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Прогресс</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Текущие очки:</span>
                    <span className="font-medium">{levelProgress.currentPoints}</span>
                  </div>
                  {levelProgress.nextGroup && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">До следующего уровня:</span>
                      <span className="font-medium">{levelProgress.pointsToNext} очков</span>
                    </div>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${levelProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition duration-200 font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
