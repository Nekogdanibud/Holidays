// src/components/YandexMap.js
'use client';

import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useState, useEffect } from 'react';

export default function YandexMap({ location, height = 300 }) {
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location?.address) {
      geocodeAddress(location.address);
    }
  }, [location?.address]);

  const geocodeAddress = async (address) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=2a268a3d-82ae-47d0-a4ff-6627d569f85a&geocode=${encodeURIComponent(address)}&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        const found = data.response.GeoObjectCollection.featureMember[0];
        if (found) {
          const [lon, lat] = found.GeoObject.Point.pos.split(' ').map(Number);
          setCoordinates([lat, lon]);
        }
      }
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!location?.address) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500 text-sm">Адрес не указан</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-6 h-6 border-t-2 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <YMaps query={{ apikey: '2a268a3d-82ae-47d0-a4ff-6627d569f85a' }}>
        <Map
          defaultState={{
            center: coordinates || [55.751244, 37.618423],
            zoom: coordinates ? 15 : 10,
          }}
          width="100%"
          height="100%"
        >
          {coordinates && (
            <Placemark
              geometry={coordinates}
              properties={{
                balloonContent: `
                  <div class="p-2">
                    <strong>${location.name || 'Местоположение'}</strong>
                    ${location.address ? `<br/><small>${location.address}</small>` : ''}
                  </div>
                `,
              }}
              options={{
                preset: 'islands#blueIcon',
              }}
            />
          )}
        </Map>
      </YMaps>
    </div>
  );
}
