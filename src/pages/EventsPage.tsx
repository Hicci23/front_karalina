import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '@/api';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import { useAuthStore, useFilterStore } from '@/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: _user } = useAuthStore();
  const { searchQuery, category } = useFilterStore();

  const { data, isLoading } = useQuery({
    queryKey: ['events', { searchQuery, category }],
    queryFn: () =>
      eventsApi.getAll({
        search: searchQuery || undefined,
        category: category !== 'all' ? category : undefined,
      }),
  });

  const events = data?.data?.items || [];

  const joinMutation = useMutation({
    mutationFn: (eventId: number) => eventsApi.join(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleJoin = (eventId: number) => {
    joinMutation.mutate(eventId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Все события</h1>
        <button
          onClick={() => navigate('/create-event')}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Filters */}
      <div className="mb-6">
        <EventFilters />
      </div>

      {/* Events grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-1/4 mb-3"></div>
              <div className="skeleton h-6 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-full mb-4"></div>
              <div className="skeleton h-20 w-full mb-4"></div>
              <div className="flex gap-2">
                <div className="skeleton h-10 flex-1"></div>
                <div className="skeleton h-10 flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onJoin={handleJoin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Событий не найдено</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить параметры поиска или создайте новое событие
          </p>
          <button onClick={() => navigate('/create-event')} className="btn btn-primary">
            Создать событие
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
