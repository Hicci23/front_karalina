import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api';
import ChatRoom from '@/components/ChatRoom';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: !!id,
  });

  const event = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="skeleton h-8 w-1/3 mb-6"></div>
        <div className="card h-[600px]">
          <div className="skeleton h-full"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Событие не найдено</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-500">
            {event.participants?.length || 0} участников в чате
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Онлайн
          </span>
        </div>
      </div>

      {/* Chat room */}
      <div className="flex-1 min-h-0">
        <ChatRoom eventId={eventId} />
      </div>
    </div>
  );
};

export default ChatPage;
