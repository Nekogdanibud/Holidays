export default function ParticipationButton({ 
  userParticipation, 
  onParticipation, 
  isLoading,
  showLabel = true 
}) {
  const isGoing = userParticipation?.status === 'GOING';

  return (
    <button
      onClick={() => onParticipation(!isGoing)}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-medium shadow-sm ${
        isGoing 
          ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {isLoading ? (
        <div className={`w-4 h-4 border-t-2 rounded-full animate-spin ${
          isGoing ? 'border-white' : 'border-gray-600'
        }`}></div>
      ) : (
        <>
          <span className="text-base">{isGoing ? '✅' : '➕'}</span>
          {showLabel && <span>{isGoing ? 'Я участвую' : 'Участвовать'}</span>}
        </>
      )}
    </button>
  );
}
