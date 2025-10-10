// src/components/vacation/VacationManagement.js
'use client';

import { useState } from 'react';

export default function VacationManagement({ vacation, onUpdate }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/vacations/${vacation.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Приглашение отправлено!');
        setInviteEmail('');
        onUpdate?.(); // Обновляем данные отпуска
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = vacation.userId === vacation.user?.id;

  if (!isOwner) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Приглашение участников */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Пригласить участников</h3>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email участника"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? 'Отправка...' : 'Пригласить'}
          </button>
        </form>
        
        <p className="text-sm text-gray-500 mt-2">
          Пользователь получит уведомление о приглашении
        </p>
      </div>

      {/* Список участников */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Участники ({vacation.members?.length || 0})
        </h3>
        
        <div className="space-y-3">
          {vacation.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
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
                <div>
                  <div className="font-medium text-gray-900">
                    {member.user.name}
                    {member.role === 'owner' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Владелец
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.user.email}
                  </div>
                </div>
              </div>

              <div className="text-sm">
                {member.status === 'pending' ? (
                  <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">Ожидает принятия</span>
                ) : member.status === 'accepted' ? (
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Участник</span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Отклонено</span>
                )}
              </div>
            </div>
          ))}
          
          {(!vacation.members || vacation.members.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Пока нет участников
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
