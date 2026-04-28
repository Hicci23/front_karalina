import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, categoryLabels, categoryColors } from '@/api';
import { useAuthStore } from '@/stores';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Event, User } from '@/types';
import type { ApiResponse } from '@/api';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const eventId = Number(id);

  const { data, isLoading } = useQuery<ApiResponse<Event>>({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: !!id,
  });

  const event = data?.data;

  const joinMutation = useMutation({
    mutationFn: () => eventsApi.join(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => eventsApi.leave(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const isParticipant = event?.participants?.some((p: User) => p.id === user?.id);
  const isCreator = event?.created_by === user?.id;
  const isFull = (event?.current_participants || 0) >= (event?.max_participants || 0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="skeleton h-8 w-1/4 mb-6"></div>
        <div className="card">
          <div className="skeleton h-64 w-full mb-4"></div>
          <div className="skeleton h-6 w-3/4 mb-2"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Событие не найдено</h2>
        <Link to="/events" className="btn btn-primary">
          Назад к событиям
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/events" className="text-blue-600 hover:underline flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад к событиям
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Map placeholder - would integrate Yandex Maps here */}
            <div className="h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 5m0 13V7m0 0L9.553 6.276A1 1 0 009 6.382v11.236a1 1 0 001.447.894L15 13"
                  />
                </svg>
                <p className="text-gray-600">Карта события</p>
                <p className="text-sm text-gray-500">{event.address}</p>
              </div>
            </div>

            {/* Category badge */}
            <div className="mb-4">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: categoryColors[event.category as keyof typeof categoryColors] }}
              >
                {categoryLabels[event.category as keyof typeof categoryLabels]}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>{event.address}</span>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h3 className="text-lg font-semibold mb-3">Описание</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {event.description || 'Описание отсутствует'}
              </p>
            </div>

            {/* Participants section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Участники ({event.current_participants}/{event.max_participants})
              </h3>

               {event.participants && event.participants.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {event.participants.map((participant: User) => (
                    <Link
                      key={participant.id}
                      to={`/profile/${participant.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <img
                        src={participant.avatar_url || '/default-avatar.png'}
                        alt={participant.first_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {participant.first_name} {participant.last_name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Пока нет участников</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="space-y-4">
              {/* Organizer info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <img
                  src={event.creator.avatar_url || '/default-avatar.png'}
                  alt={event.creator.first_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">
                    <Link to={`/profile/${event.creator.id}`} className="hover:underline">
                      {event.creator.first_name} {event.creator.last_name}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500">Организатор</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {isCreator ? (
                  <>
                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className="btn btn-outline w-full"
                    >
                      Редактировать
                    </button>
                    <button className="btn btn-danger w-full">Отменить событие</button>
                  </>
                ) : isParticipant ? (
                  <>
                    <button
                      onClick={() => navigate(`/events/${event.id}/chat`)}
                      className="btn btn-primary w-full"
                    >
                      Открыть чат
                    </button>
                    <button
                      onClick={() => leaveMutation.mutate()}
                      className="btn btn-outline w-full"
                      disabled={leaveMutation.isPending}
                    >
                      {leaveMutation.isPending ? 'Отмена...' : 'Покинуть событие'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => joinMutation.mutate()}
                    disabled={isFull || joinMutation.isPending}
                    className={`btn w-full ${
                      isFull ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'
                    }`}
                  >
                    {joinMutation.isPending
                      ? 'Загрузка...'
                      : isFull
                      ? 'Места закончились'
                      : 'Присоединиться'}
                  </button>
                )}
              </div>

              {/* Event stats */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Категория</span>
                  <span className="font-medium">
                    {categoryLabels[event.category as keyof typeof categoryLabels]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Осталось мест</span>
                  <span className={`font-medium ${event.max_participants - event.current_participants === 0 ? 'text-red-600' : ''}`}>
                    {event.max_participants - event.current_participants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Создано</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(event.created_at || new Date()), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
