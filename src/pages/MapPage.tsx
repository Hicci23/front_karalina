import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, categoryLabels } from '@/api';
import { useMapStore, useFilterStore } from '@/stores';
import type { Event } from '@/types';
import YandexMap from '@/components/YandexMap';
import EventFilters from '@/components/EventFilters';
import CategoryBadge from '@/components/CategoryBadge';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [markers, setMarkers] = useState<Array<{
    id: number;
    coordinates: [number, number];
    title: string;
    address?: string;
    category: string;
  }>>([]);

  const { center, setCenter, setSelectedPlace, selectedCoordinates, selectedPlace } = useMapStore();
  const { searchQuery, category, resetFilters } = useFilterStore();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', { searchQuery, category }],
    queryFn: () =>
      eventsApi.getAll({
        search: searchQuery || undefined,
        category: category !== 'all' ? category : undefined,
      }),
  });

  const events = eventsData?.data?.items || [];

  useEffect(() => {
    setMarkers(events.map((event: Event) => ({
      id: event.id,
      coordinates: [event.coordinates.lat, event.coordinates.lng] as [number, number],
      title: event.title,
      address: event.address,
      category: categoryLabels[event.category as keyof typeof categoryLabels],
    })));
  }, [events]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
        },
        () => {
          console.log('Geolocation denied, using default');
        }
      );
    }
  }, [setCenter]);

  const handleMarkerClick = (id: string | number) => {
    const event = events.find((e: Event) => e.id === Number(id));
    if (event) {
      setSelectedEvent(event);
      setCenter([event.coordinates.lat, event.coordinates.lng]);
    }
  };

  const handleMapClick = (coords: [number, number]) => {
    setSelectedPlace('Новое событие', coords);
  };

  const closeEventPopup = () => {
    setSelectedEvent(null);
  };

  const createEventAtLocation = () => {
    if (selectedCoordinates) {
      navigate('/create-event', {
        state: {
          coordinates: {
            lat: selectedCoordinates[0],
            lng: selectedCoordinates[1],
          },
          address: selectedPlace || '',
        },
      });
      setSelectedPlace(null, null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <EventFilters />
            </div>
            <button
              onClick={resetFilters}
              className="btn btn-outline self-start md:self-auto"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <YandexMap
          center={center}
          zoom={12}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
        />

        {/* Event popup */}
        {selectedEvent && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
            <div className="bg-white rounded-lg shadow-xl p-4">
              <button
                onClick={closeEventPopup}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h3 className="font-bold text-lg mb-2 pr-6">{selectedEvent.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <CategoryBadge category={selectedEvent.category} />
                <span className="text-sm text-gray-600">
                  {new Date(selectedEvent.date_time).toLocaleString('ru-RU')}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {selectedEvent.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/events/${selectedEvent.id}`)}
                  className="btn btn-primary flex-1"
                >
                  Подробнее
                </button>
                <button
                  onClick={() => navigate(`/events/${selectedEvent.id}/chat`)}
                  className="btn btn-outline"
                >
                  Чат
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create event button */}
        {selectedCoordinates && (
          <div className="absolute bottom-6 right-4 z-20">
            <button
              onClick={createEventAtLocation}
              className="btn btn-primary shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Создать событие
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg">
            <div className="skeleton h-4 w-32"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && events.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Событий не найдено</h3>
            <p className="text-gray-600 text-sm mb-4">
              Попробуйте изменить фильтры или создайте новое событие, кликнув на карте
            </p>
            {selectedCoordinates && (
              <button onClick={createEventAtLocation} className="btn btn-primary">
                Создать событие здесь
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
