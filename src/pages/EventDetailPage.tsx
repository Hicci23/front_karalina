import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, eventIcon } from '@/api';
import CategoryBadge from '@/components/CategoryBadge';

const EventDetailPage = () => {
  const { id } = useParams();
  const eventId = Number(id);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: Number.isFinite(eventId),
  });

  if (isLoading || !event) {
    return <main className="phone-shell"><div className="app-loader">Открываем событие...</div></main>;
  }

  const progress = Math.round((event.currentUsers / event.maxUsers) * 100);

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
          <button className="primary-button">Пойду</button>
          <Link className="secondary-button" to={`/events/${event.id}/chat`}>Чат</Link>
        </div>
      </section>
    </main>
  );
};

export default EventDetailPage;
