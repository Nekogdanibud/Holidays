import ParticipationButton from './ParticipationButton';
import LocationCard from './LocationCard';

export default function ActivityInfoTab({ 
  activity, 
  userParticipation, 
  onParticipation, 
  isParticipationLoading 
}) {
  const goingParticipants = activity?.participants?.filter(p => p.status === 'GOING') || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Участие в активности
            </h3>
            <p className="text-gray-600">
              {goingParticipants.length > 0 
                ? `${goingParticipants.length} человек участвуют` 
                : 'Пока никто не участвует'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ParticipationButton
              userParticipation={userParticipation}
              onParticipation={onParticipation}
              isLoading={isParticipationLoading}
              showLabel={true}
            />
          </div>
        </div>

        {goingParticipants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Участвуют:</span>
              <div className="flex -space-x-2">
                {goingParticipants.slice(0, 5).map((participant) => (
                  <div 
                    key={participant.user.id}
                    className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    title={participant.user.name}
                  >
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
                ))}
              </div>
              {goingParticipants.length > 5 && (
                <span className="text-xs text-gray-400">
                  +{goingParticipants.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>
            
            {activity.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Описание</h4>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Статус</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                  activity.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  activity.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status === 'PLANNED' && 'Запланировано'}
                  {activity.status === 'CONFIRMED' && 'Подтверждено'}
                  {activity.status === 'IN_PROGRESS' && 'В процессе'}
                  {activity.status === 'COMPLETED' && 'Завершено'}
                  {activity.status === 'CANCELLED' && 'Отменено'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Приоритет</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.priority === 'LOW' ? 'bg-red-100 text-red-800' :
                  activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {activity.priority === 'LOW' && 'Низкий'}
                  {activity.priority === 'MEDIUM' && 'Средний'}
                  {activity.priority === 'HIGH' && 'Высокий'}
                </span>
              </div>
            </div>

            {activity.cost && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Стоимость</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {parseFloat(activity.cost).toFixed(2)} ₽
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Детали</h3>
            
            {activity.location && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Местоположение</h4>
                <LocationCard location={activity.location} />
              </div>
            )}

            {activity.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Заметки</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 text-sm">{activity.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
