import { useEffect, createContext, useContext, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores';
import type { ChatMessage } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  joinEventRoom: (eventId: number) => void;
  leaveEventRoom: (eventId: number) => void;
  sendMessage: (content: string, eventId: number) => void;
  messages: Record<number, ChatMessage[]>;
  onlineUsers: Record<number, number>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { accessToken, user } = useAuthStore();
  const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
    auth: { token: accessToken },
    transports: ['websocket'],
  });

  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (accessToken) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => ({
        ...prev,
        [message.event_id]: [...(prev[message.event_id] || []), message],
      }));
    });

    socket.on('room_joined', (data: { event_id: number; users_count: number }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.event_id]: data.users_count,
      }));
    });

    socket.on('room_left', (eventId: number) => {
      setOnlineUsers((prev) => {
        const newCount = (prev[eventId] || 1) - 1;
        return { ...prev, [eventId]: Math.max(0, newCount) };
      });
    });

    socket.on('user_joined', (data: { event_id: number; users_count: number }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.event_id]: data.users_count,
      }));
    });

    socket.on('user_left', (data: { event_id: number; users_count: number }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.event_id]: data.users_count,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, socket]);

  const joinEventRoom = useCallback((eventId: number) => {
    socket.emit('join_event', { event_id: eventId });
  }, [socket]);

  const leaveEventRoom = useCallback((eventId: number) => {
    socket.emit('leave_event', { event_id: eventId });
  }, [socket]);

  const sendMessage = useCallback(
    (content: string, eventId: number) => {
      if (user) {
        socket.emit('send_message', { content, event_id: eventId, sender_id: user.id });
      }
    },
    [socket, user]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinEventRoom,
        leaveEventRoom,
        sendMessage,
        messages,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
