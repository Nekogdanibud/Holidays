import ParticipationButton from './ParticipationButton';

export default function ActivityParticipantsTab({ 
  activity, 
  userParticipation, 
  onParticipation, 
  isParticipationLoading 
}) {
  const goingParticipants = activity?.participants?.filter(p => p.status === 'GOING') || [];
  const notGoingParticipants = activity?.participants?.filter(p => p.status === 'NOT_GOING') || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Участники ({activity.participants?.length || 0})
        </h3>
        
        <div className="flex items-center space-x-3">
          <ParticipationButton
            userParticipation={userParticipation}
            onParticipation={onParticipation}
            isLoading={isParticipationLoading}
            showLabel={true}
          />
        </div>
      </div>
      
      {activity.participants && activity.participants.length > 0 ? (
        <div className="space-y-4">
          {goingParticipants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Участвуют ({goingParticipants.length})
              </h4>
              <div className="space-y-2">
                {goingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                        {participant.user.avatar ? (
                          <img
                            src={participant.user.avatar}
                            alt={participant.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          participant.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{participant.user.name}</div>
                        <div className="text-sm text-gray-500">@{participant.user.usertag}</div>
                      </div>
                    </div>
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                      Участвует
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notGoingParticipants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Не участвуют ({notGoingParticipants.length})
              </h4>
              <div className="space-y-2">
                {notGoingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {participant.user.avatar ? (
                          <img
                            src={participant.user.avatar}
                            alt={participant.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          participant.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{participant.user.name}</div>
                        <div className="text-sm text-gray-500">@{participant.user.usertag}</div>
                      </div>
                    </div>
                    <span className="text-gray-600 bg-gray-200 px-2 py-1 rounded-full text-xs">
                      Не участвует
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="mb-4">Пока нет участников</p>
          <button
            onClick={() => onParticipation(true)}
            disabled={isParticipationLoading}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition duration-200 font-medium"
          >
            Стать первым участником
          </button>
        </div>
      )}
    </div>
  );
}
