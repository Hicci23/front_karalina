import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api';
import { useAuthStore } from '@/stores';
import EventCard from '@/components/EventCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const isOwnProfile = !userId || Number(userId) === currentUser?.id;
  const profileUserId = Number(userId) || currentUser?.id || 0;

  const { data, isLoading } = useQuery({
    queryKey: ['user', profileUserId],
    queryFn: () => usersApi.getProfile(profileUserId),
    enabled: !!profileUserId && profileUserId > 0,
  });

  const { data: userEvents } = useQuery({
    queryKey: ['userEvents', profileUserId],
    queryFn: () => eventsApi.getUserEvents(profileUserId),
    enabled: !!profileUserId && profileUserId > 0,
  });

  const user = data?.data;
  const createdEvents = userEvents?.data?.created || [];
  const joinedEvents = userEvents?.data?.joined || [];

  const joinMutation = useMutation({
    mutationFn: (eventId: number) => eventsApi.join(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', profileUserId] });
      queryClient.invalidateQueries({ queryKey: ['userEvents', profileUserId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleJoin = (eventId: number) => {
    joinMutation.mutate(eventId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-6 mb-8">
          <div className="skeleton w-32 h-32 rounded-full"></div>
          <div className="space-y-2">
            <div className="skeleton h-8 w-48"></div>
            <div className="skeleton h-4 w-32"></div>
          </div>
        </div>
        <div className="skeleton h-64 w-full mb-6"></div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Пользователь не найден</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <p className="text-gray-600">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {user.age} лет
              </span>
            </p>
            {isOwnProfile && (
              <button className="btn btn-outline mt-4">Редактировать профиль</button>
            )}
          </div>
        </div>
      </div>

      {/* Created events */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Созданные события ({createdEvents.length})
        </h2>

        {createdEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdEvents.map((event) => (
              <EventCard key={event.id} event={event} onJoin={handleJoin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">Нет созданных событий</p>
          </div>
        )}
      </div>

      {/* Joined events */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Участие в событиях ({joinedEvents.length})
        </h2>

        {joinedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedEvents.map((event) => (
              <EventCard key={event.id} event={event} onJoin={handleJoin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">Нет событий, в которых вы участвуете</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
