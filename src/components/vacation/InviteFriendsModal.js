// src/components/vacation/InviteFriendsModal.js (исправленная версия)
'use client';

import { useState, useEffect } from 'react';

export default function InviteFriendsModal({ vacation, onClose, onInvite }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [usertag, setUsertag] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends/list', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      } else {
        console.error('Ошибка загрузки друзей:', response.status);
      }
    } catch (error) {
      console.error('Ошибка загрузки друзей:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInviteSelected = async () => {
    if (selectedFriends.length === 0) return;

    setIsInviting(true);
    try {
      const results = [];
      for (const friendId of selectedFriends) {
        try {
          const response = await fetch(`/api/vacations/${vacation.id}/invite-friend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ friendId }),
            credentials: 'include'
          });
          
          const data = await response.json();
          results.push({ 
            friendId, 
            success: response.ok,
            message: data.message 
          });
        } catch (error) {
          results.push({ 
            friendId, 
            success: false,
            message: 'Ошибка сети' 
          });
        }
      }

      onInvite(results);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Ошибка отправки приглашений:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteByUsertag = async () => {
    if (!usertag.trim()) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.id}/invite-by-usertag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usertag: usertag.trim() }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Приглашение отправлено!');
        setUsertag('');
        onInvite([{ success: true, message: 'Приглашение отправлено' }]);
      } else {
        alert(`❌ ${data.message || 'Ошибка отправки приглашения'}`);
      }
    } catch (error) {
      console.error('Ошибка отправки приглашения:', error);
      alert('❌ Ошибка сети');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.usertag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Пригласить друзей</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Приглашение по usertag */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Пригласить по usertag</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={usertag}
              onChange={(e) => setUsertag(e.target.value)}
              placeholder="Введите usertag пользователя"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isInviting}
            />
            <button
              onClick={handleInviteByUsertag}
              disabled={!usertag.trim() || isInviting}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isInviting ? 'Отправка...' : 'Пригласить'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Введите usertag пользователя (например: ivan_petrov)
          </p>
        </div>

        {/* Список друзей */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Выберите из друзей</h3>
          
          <input
            type="text"
            placeholder="Поиск друзей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Загрузка друзей...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => toggleFriendSelection(friend.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        friend.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{friend.name}</div>
                      <div className="text-sm text-gray-500">@{friend.usertag}</div>
                    </div>
                  </div>
                  
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    selectedFriends.includes(friend.id)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedFriends.includes(friend.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredFriends.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Друзья не найдены' : 'У вас пока нет друзей'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Выбрано: {selectedFriends.length}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isInviting}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleInviteSelected}
              disabled={selectedFriends.length === 0 || isInviting}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isInviting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {isInviting ? 'Отправка...' : `Пригласить (${selectedFriends.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
