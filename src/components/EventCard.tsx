import { Link } from 'react-router-dom';
import { categoryLabels, categoryColors } from '@/api';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: number) => void;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onJoin, showActions = true }) => {
  const isFull = event.current_participants >= event.max_participants;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        {/* Header with category and date */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: categoryColors[event.category] }}
          >
            {categoryLabels[event.category]}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(event.date_time).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>

        {/* Title and description */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {event.description || 'Описание отсутствует'}
        </p>

        {/* Event details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="truncate">{event.address || 'Адрес не указан'}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {new Date(event.date_time).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className={isFull ? 'text-red-500 font-medium' : ''}>
              {event.current_participants}/{event.max_participants} участников
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
            <Link to={`/events/${event.id}`} className="btn btn-outline flex-1">
              Подробнее
            </Link>
            <button
              onClick={() => onJoin?.(event.id)}
              disabled={isFull}
              className={`btn flex-1 ${
                isFull ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
              }`}
            >
              {isFull ? 'Места закончились' : 'Присоединиться'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
