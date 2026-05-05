import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api';
import EventCard from '@/components/EventCard';
import { useAuthStore } from '@/stores';

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  const { data: events = [] } = useQuery({
    queryKey: ['my-events'],
    queryFn: eventsApi.getMine,
  });

  return (
    <main className="phone-shell phone-shell--form">
      <header className="page-header">
        <Link className="back-button" to="/">‹</Link>
        <h1>Профиль</h1>
      </header>
      <section className="profile-card">
        <div className="profile-avatar">{user?.name?.slice(0, 1) || 'К'}</div>
        <h2>{user?.name} {user?.sname}</h2>
        <p>{user?.email}</p>
        <span>{user?.age} лет</span>
      </section>
      <section className="profile-events">
        <h2>Мои события</h2>
        {events.length === 0 && <div className="empty-state">Вы пока не присоединились к событиям.</div>}
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </section>
    </main>
  );
};

export default ProfilePage;
