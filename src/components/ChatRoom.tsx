import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores';

interface ChatRoomProps {
  eventId: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ eventId }) => {
  const { messages, joinEventRoom, leaveEventRoom, sendMessage } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const eventMessages = messages[eventId] || [];

  useEffect(() => {
    joinEventRoom(eventId);
    return () => {
      leaveEventRoom(eventId);
    };
  }, [eventId, joinEventRoom, leaveEventRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), eventId);
      setInputValue('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {eventMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p>Нет сообщений</p>
            <p className="text-sm">Напишите первое сообщение!</p>
          </div>
        ) : (
          eventMessages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {message.sender.first_name} {message.sender.last_name}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напечатайте сообщение..."
            className="form-input flex-1"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="btn btn-primary px-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">
          {inputValue.length}/500
        </p>
      </form>
    </div>
  );
};

export default ChatRoom;
