import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, eventIcon, eventsApi } from '@/api';
import BrandLogo from '@/components/BrandLogo';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import YandexMap from '@/components/YandexMap';
import { useAuthStore, useFilterStore } from '@/stores';
import type { Event } from '@/types';

const patchEventList = (items: Event[], eventId: number, joined: boolean) =>
  items.map((item) => {
    if (item.id !== eventId) return item;
    const nextCount = Math.max(
      0,
      Math.min(item.maxUsers, item.currentUsers + (joined ? 1 : -1))
    );
    return {
      ...item,
      currentUsers: nextCount,
      isJoined: joined,
    };
  });

const MapPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { query, category } = useFilterStore();
  const { user, clear, setUser } = useAuthStore();
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'denied' | 'ready'>('idle');
  const [draftPoint, setDraftPoint] = useState<{
    lat: number;
    lng: number;
    address: string;
    isLoadingAddress: boolean;
  } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', query, category],
    queryFn: () =>
      eventsApi.getAll({
        title: query || undefined,
        category: category || undefined,
      }),
  });

  const joinedEventIds = new Set((user?.events || []).map((item) => item.id));
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) || null,
    [events, selectedId]
  );

  const syncUserAfterMembershipChange = async (event: Event, joined: boolean) => {
    setUser(await authApi.me());

    queryClient.setQueriesData({ queryKey: ['events'] }, (oldData: unknown) => {
      if (!Array.isArray(oldData)) return oldData;
      return patchEventList(oldData as Event[], event.id, joined);
    });

    queryClient.setQueryData(['event', event.id], (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData;
      return patchEventList([oldData as Event], event.id, joined)[0];
    });

    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['event', event.id] });
    queryClient.invalidateQueries({ queryKey: ['my-events'] });
  };

  const joinMutation = useMutation({
    mutationFn: eventsApi.join,
    onSuccess: async (joinedEvent) => {
      await syncUserAfterMembershipChange(joinedEvent, true);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: eventsApi.leave,
    onSuccess: async (leftEvent) => {
      await syncUserAfterMembershipChange(leftEvent, false);
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('loading');
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('ready');
      },
      () => setLocationStatus('denied'),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const logout = async () => {
    await authApi.logout().catch(() => undefined);
    clear();
  };

  const resolveAddress = async (
    coords: { lat: number; lng: number },
    previousAddress?: string
  ) => {
    setSelectedId(undefined);
    setDraftPoint({
      ...coords,
      address: previousAddress || 'Определяем адрес...',
      isLoadingAddress: true,
    });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=ru`
      );
      const data = await response.json();
      setDraftPoint({
        ...coords,
        address: data.display_name || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
        isLoadingAddress: false,
      });
    } catch {
      setDraftPoint({
        ...coords,
        address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
        isLoadingAddress: false,
      });
    }
  };

  const createAtDraftPoint = () => {
    if (!draftPoint) return;
    navigate('/create-event', {
      state: {
        address: draftPoint.address,
        coordinates: {
          lat: draftPoint.lat,
          lng: draftPoint.lng,
        },
      },
    });
  };

  return (
    <main className="phone-shell">
      <header className="top-bar">
        <BrandLogo compact />
        <div className="top-bar__actions">
          <Link className="avatar-button" to="/profile" title="Профиль">
            {user?.name?.slice(0, 1) || 'К'}
          </Link>
          <button className="ghost-link" onClick={logout}>Выйти</button>
        </div>
      </header>

      <YandexMap
        markers={[
          ...events.map((event) => ({
            id: event.id,
            lat: event.coordinates.lat,
            lng: event.coordinates.lng,
            title: event.title,
            category: event.category,
            attendeesLabel: `${event.currentUsers}/${event.maxUsers}`,
          })),
          ...(draftPoint
            ? [
                {
                  id: -1,
                  lat: draftPoint.lat,
                  lng: draftPoint.lng,
                  title: draftPoint.address,
                  category: 'Точка',
                  draggable: true,
                },
              ]
            : []),
        ]}
        selectedId={selectedEvent?.id}
        userLocation={userLocation}
        onMarkerClick={(id) => {
          if (id === -1) return;
          setDraftPoint(null);
          setSelectedId(id);
          setIsSheetOpen(true);
        }}
        onMarkerDoubleClick={(id) => {
          if (id === -1) {
            setDraftPoint(null);
            setIsSheetOpen(true);
            return;
          }
          setSelectedId(id);
          setIsSheetOpen(true);
        }}
        onMarkerMove={(id, coords) => {
          if (id !== -1) return;
          setDraftPoint((current) =>
            current
              ? {
                  ...current,
                  lat: coords.lat,
                  lng: coords.lng,
                  isLoadingAddress: true,
                }
              : current
          );
        }}
        onMarkerMoveEnd={(id, coords) => {
          if (id !== -1) return;
          resolveAddress(coords, 'Обновляем адрес...');
        }}
        onMapDoubleClick={resolveAddress}
      />

      <section className={`bottom-sheet ${isSheetOpen ? 'bottom-sheet--open' : 'bottom-sheet--closed'}`}>
        <button
          type="button"
          className="sheet-toggle"
          onClick={() => setIsSheetOpen((value) => !value)}
          aria-expanded={isSheetOpen}
        >
          <span className="sheet-toggle__handle" />
          <span>{isSheetOpen ? 'Скрыть события' : `${events.length} событий рядом`}</span>
        </button>
        <EventFilters />
        <div className="sheet-heading">
          <h2>{events.length} событий рядом</h2>
          <Link className="floating-add" to="/create-event">+</Link>
        </div>
        <div className="map-hint">
          Двойной клик по карте ставит новую точку. Двойной клик по новой точке убирает ее.
        </div>
        {locationStatus === 'loading' && (
          <div className="map-hint">Определяем ваше местоположение...</div>
        )}
        {locationStatus === 'denied' && (
          <div className="map-hint">
            Разрешите геолокацию в браузере, чтобы кнопка с точкой работала.
          </div>
        )}

        {draftPoint && (
          <div className="draft-point">
            <div>
              <strong>Новая точка</strong>
              <p>{draftPoint.address}</p>
            </div>
            <button
              className="primary-button"
              onClick={createAtDraftPoint}
              disabled={draftPoint.isLoadingAddress}
            >
              Создать
            </button>
          </div>
        )}

        {selectedEvent && (
          <section className="selected-event">
            <button
              className="selected-event__close"
              type="button"
              onClick={() => setSelectedId(undefined)}
            >
              ×
            </button>
            <div className="selected-event__icon">{eventIcon(selectedEvent.category)}</div>
            <div className="selected-event__content">
              <span className="category-badge">{selectedEvent.category}</span>
              <h3>{selectedEvent.title}</h3>
              <p className="event-card__meta">
                {new Date(selectedEvent.date).toLocaleString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="event-card__address">{selectedEvent.address}</p>
              <p>{selectedEvent.description}</p>
              <div className="detail-progress">
                <span>
                  {selectedEvent.currentUsers} / {selectedEvent.maxUsers} уже идут
                </span>
                <span>
                  {Math.round((selectedEvent.currentUsers / selectedEvent.maxUsers) * 100)}%
                </span>
                <div className="progress">
                  <span
                    style={{
                      width: `${Math.round(
                        (selectedEvent.currentUsers / selectedEvent.maxUsers) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="action-row">
                {joinedEventIds.has(selectedEvent.id) ? (
                  <button
                    className="primary-button"
                    disabled={leaveMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Точно отменить бронь и выйти из события?')) {
                        leaveMutation.mutate(selectedEvent.id);
                      }
                    }}
                  >
                    {leaveMutation.isPending ? 'Отменяем...' : 'Отменить бронь'}
                  </button>
                ) : (
                  <button
                    className="primary-button"
                    disabled={joinMutation.isPending}
                    onClick={() => joinMutation.mutate(selectedEvent.id)}
                  >
                    {joinMutation.isPending ? 'Сохраняем...' : 'Пойду'}
                  </button>
                )}
                <button
                  className="secondary-button"
                  onClick={() => navigate(`/events/${selectedEvent.id}/chat`)}
                >
                  Чат
                </button>
              </div>
            </div>
          </section>
        )}

        {isLoading && <div className="empty-state">Загружаем события...</div>}
        {!isLoading && events.length === 0 && (
          <div className="empty-state">Событий пока нет. Создайте первое.</div>
        )}
        <div className="event-list">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              compact={event.id !== selectedEvent?.id}
              isSelected={event.id === selectedEvent?.id}
              onSelect={(nextEvent) => {
                setDraftPoint(null);
                setSelectedId(nextEvent.id);
                setIsSheetOpen(true);
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default MapPage;
