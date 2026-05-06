import { eventIcon } from '@/api';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: (event: Event) => void;
}

const EventCard = ({ event, compact = false, isSelected = false, onSelect }: EventCardProps) => {
  const progress = Math.min(100, Math.round((event.currentUsers / event.maxUsers) * 100));

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={`event-card ${compact ? 'event-card--compact' : ''} ${isSelected ? 'event-card--selected' : ''}`}
    >
      <div className="event-card__icon">{eventIcon(event.category)}</div>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p className="event-card__meta">
          {new Date(event.date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className="event-card__address">{event.address}</p>
        <div className="event-card__footer">
          <span>{event.currentUsers} / {event.maxUsers} участников</span>
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
};

export default EventCard;
