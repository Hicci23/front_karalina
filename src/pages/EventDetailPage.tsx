import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, eventIcon, eventsApi } from '@/api';
import CategoryBadge from '@/components/CategoryBadge';
import { useAuthStore } from '@/stores';
import type { Event } from '@/types';

const patchEventCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: number,
  joined: boolean
) => {
  queryClient.setQueriesData({ queryKey: ['events'] }, (oldData: unknown) => {
    if (!Array.isArray(oldData)) return oldData;
    return oldData.map((item) => {
      const event = item as Event;
      if (event.id !== eventId) return event;
      return {
        ...event,
        isJoined: joined,
        currentUsers: Math.max(0, Math.min(event.maxUsers, event.currentUsers + (joined ? 1 : -1))),
      };
    });
  });

  queryClient.setQueryData(['event', eventId], (oldData: unknown) => {
    if (!oldData || typeof oldData !== 'object') return oldData;
    const event = oldData as Event;
    return {
      ...event,
      isJoined: joined,
      currentUsers: Math.max(0, Math.min(event.maxUsers, event.currentUsers + (joined ? 1 : -1))),
    };
  });
};

const EventDetailPage = () => {
  const { id } = useParams();
  const eventId = Number(id);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: Number.isFinite(eventId),
  });

  const joinedEventIds = new Set((user?.events || []).map((item) => item.id));
  const isJoined = event ? joinedEventIds.has(event.id) : false;
  const progress = event ? Math.round((event.currentUsers / event.maxUsers) * 100) : 0;

  const joinMutation = useMutation({
    mutationFn: eventsApi.join,
    onSuccess: async (joinedEvent) => {
      patchEventCache(queryClient, joinedEvent.id, true);
      setUser(await authApi.me());
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', joinedEvent.id] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: eventsApi.leave,
    onSuccess: async (leftEvent) => {
      patchEventCache(queryClient, leftEvent.id, false);
      setUser(await authApi.me());
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', leftEvent.id] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });

  if (isLoading || !event) {
    return <main className="phone-shell"><div className="app-loader">Открываем событие...</div></main>;
  }

  return (
    <main className="phone-shell">
      <div className="detail-map">
        <Link className="back-button" to="/">‹</Link>
      </div>
      <section className="detail-sheet">
        <div className="detail-pin">{eventIcon(event.category)}</div>
        <h1>{event.title}</h1>
        <p className="event-card__meta">
          {new Date(event.date).toLocaleString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className="event-card__address">{event.address}</p>
        <CategoryBadge category={event.category} />
        <p className="detail-description">{event.description}</p>
        <div className="detail-progress">
          <span>{event.currentUsers} / {event.maxUsers} уже идут</span>
          <span>{progress}%</span>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="action-row">
          {isJoined ? (
            <button
              className="primary-button"
              disabled={leaveMutation.isPending}
              onClick={() => {
                if (window.confirm('Точно отменить бронь и выйти из события?')) {
                  leaveMutation.mutate(event.id);
                }
              }}
            >
              {leaveMutation.isPending ? 'Отменяем...' : 'Отменить бронь'}
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={joinMutation.isPending}
              onClick={() => joinMutation.mutate(event.id)}
            >
              {joinMutation.isPending ? 'Сохраняем...' : 'Пойду'}
            </button>
          )}
          <Link className="secondary-button" to={`/events/${event.id}/chat`}>Чат</Link>
        </div>
        {isJoined && (
          <div className="map-hint">Вы уже в списке участников.</div>
        )}
      </section>
    </main>
  );
};

export default EventDetailPage;
