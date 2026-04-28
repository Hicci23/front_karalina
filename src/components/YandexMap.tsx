import { useEffect, useRef, useCallback, useState } from 'react';
import './YandexMap.css';

interface YandexMapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string | number;
    coordinates: [number, number];
    title?: string;
    address?: string;
    category?: string;
  }>;
  onMarkerClick?: (id: string | number) => void;
  onMapClick?: (coords: [number, number]) => void;
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  onMapClick,
  height = '100%',
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadYandexMaps = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.ymaps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${import.meta.env.VITE_YANDEX_MAP_KEY}`;
      script.onload = () => {
        window.ymaps.ready(() => {
          setIsLoaded(true);
          resolve();
        });
      };
      script.onerror = () => reject(new Error('Failed to load Yandex Maps'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadYandexMaps().catch((err) => {
      console.error('Yandex Maps loading error:', err);
      setError('Не удалось загрузить карту');
    });
  }, [loadYandexMaps]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const initMap = async () => {
      try {
        const { Map, Placemark } = window.ymaps.modules;

        const map = new Map(mapRef.current, {
          center,
          zoom,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector'],
        });

        map.events.add('click', (e: any) => {
          const coords = e.get('coords') as [number, number];
          if (onMapClick) {
            onMapClick(coords);
          }
        });

        // Add markers
        const placemarks = markers.map((marker) => {
          const placemark = new Placemark(
            marker.coordinates,
            {
              balloonContent: `
                <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px;">${marker.title || 'Событие'}</h3>
                  ${marker.address ? `<p style="margin: 4px 0; color: #666;">${marker.address}</p>` : ''}
                  ${marker.category ? `<p style="margin: 4px 0;"><span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${marker.category}</span></p>` : ''}
                </div>
              `,
            },
            {
              preset: 'islands#blueDotIcon',
            }
          );

          placemark.events.add('click', () => {
            if (onMarkerClick) {
              onMarkerClick(marker.id);
            }
          });

          return placemark;
        });

        map.geoObjects.add(placemarks);

        mapInstanceRef.current = map;

        return () => {
          map.destroy();
        };
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Ошибка инициализации карты');
      }
    };

    const cleanupPromise = initMap();

    return () => {
      cleanupPromise.then((unsubscribe) => unsubscribe?.());
    };
  }, [isLoaded, center, zoom, markers, onMarkerClick, onMapClick]);

  return (
    <div className={`yandex-map-wrapper ${className}`} style={{ height }}>
      {error ? (
        <div className="map-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Перезагрузить</button>
        </div>
      ) : (
        <div ref={mapRef} className="yandex-map" />
      )}
    </div>
  );
};

export default YandexMap;
