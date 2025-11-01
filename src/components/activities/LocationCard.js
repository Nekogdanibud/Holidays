export default function LocationCard({ location }) {
  const openInYandexMaps = (address) => {
    if (!address) return;
    
    const query = encodeURIComponent(address);
    const url = `https://yandex.ru/maps/?text=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!location) return null;

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium text-sm">{location.name}</p>
          {location.address && (
            <div className="mt-1">
              <p className="text-gray-600 text-sm mb-2">{location.address}</p>
              <button
                onClick={() => openInYandexMaps(location.address)}
                className="inline-flex items-center space-x-1.5 text-emerald-600 hover:text-emerald-700 transition-colors text-xs font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200"
                title="Открыть в Яндекс Картах"
              >
                <span>Открыть в Яндекс Картах</span>
                <svg 
                  className="w-3.5 h-3.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
