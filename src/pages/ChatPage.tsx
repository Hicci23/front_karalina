import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildChatUrl } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores';

const ChatPage = () => {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(buildChatUrl(user?.name || 'Гость'));
    socketRef.current = socket;
    socket.onmessage = (event) => setMessages((prev) => [...prev, event.data]);
    return () => socket.close();
  }, [user?.name]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.send(text.trim());
    setText('');
  };

  return (
    <main className="phone-shell phone-shell--form">
      <header className="page-header">
        <Link className="back-button" to={`/events/${id}`}>‹</Link>
        <h1>Чат события</h1>
      </header>
      <section className="chat-box">
        {messages.map((message, index) => (
          <div key={`${message}-${index}`} className="chat-message">{message}</div>
        ))}
        {messages.length === 0 && <div className="empty-state">Сообщений пока нет.</div>}
      </section>
      <form className="chat-form" onSubmit={submit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Сообщение" />
        <button className="primary-button">Отправить</button>
      </form>
    </main>
  );
};

export default ChatPage;
