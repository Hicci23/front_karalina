import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildChatUrl } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores';
import type { ChatMessage } from '@/types';

const buildStorageKey = (eventId: number) => `kloket-chat-${eventId}`;

const parseSocketMessage = (
  raw: string,
  eventId: number,
  currentUserName: string
): ChatMessage => {
  const separatorIndex = raw.indexOf(': ');
  const hasAuthor = separatorIndex > 0;
  const author = hasAuthor ? raw.slice(0, separatorIndex) : 'Система';
  const text = hasAuthor ? raw.slice(separatorIndex + 2) : raw;

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    eventId,
    author,
    text,
    createdAt: new Date().toISOString(),
    isOwn: author === currentUserName,
    isSystem: !hasAuthor,
  };
};

const ChatPage = () => {
  const { id } = useParams();
  const eventId = Number(id);
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Гость';
  const storageKey = useMemo(() => buildStorageKey(eventId), [eventId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved) as ChatMessage[]);
      }
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!Number.isFinite(eventId)) return;

    const socket = new WebSocket(buildChatUrl(userName));
    socketRef.current = socket;
    socket.onmessage = (event) => {
      setMessages((prev) => {
        const next = [...prev, parseSocketMessage(event.data, eventId, userName)];
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    };

    return () => socket.close();
  }, [eventId, storageKey, userName]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(trimmed);
    } else {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            eventId,
            author: userName,
            text: trimmed,
            createdAt: new Date().toISOString(),
            isOwn: true,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    }

    setText('');
  };

  return (
    <main className="phone-shell phone-shell--form">
      <header className="page-header">
        <Link className="back-button" to="/">‹</Link>
        <h1>Чат события</h1>
      </header>

      <section ref={listRef} className="chat-box">
        {messages.map((message) => (
          <article
            key={message.id}
            className={[
              'chat-message',
              message.isOwn ? 'chat-message--own' : '',
              message.isSystem ? 'chat-message--system' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="chat-message__meta">
              <strong>{message.author}</strong>
              <time>
                {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <div className="chat-message__text">{message.text}</div>
          </article>
        ))}
        {messages.length === 0 && <div className="empty-state">Сообщений пока нет.</div>}
      </section>

      <form className="chat-form" onSubmit={submit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Сообщение"
        />
        <button className="primary-button">Отправить</button>
      </form>
    </main>
  );
};

export default ChatPage;
