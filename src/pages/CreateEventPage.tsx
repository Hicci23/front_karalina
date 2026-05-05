import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { eventsApi, eventIcon } from '@/api';
import { categories } from '@/components/EventFilters';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | {
        address?: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      }
    | null;
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    address: locationState?.address || '',
    date: '',
    max_users: 6,
    descriptions: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await eventsApi.create({
        ...form,
        date: new Date(form.date).toISOString(),
      });
      navigate(`/events/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать событие.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="phone-shell phone-shell--form">
      <header className="page-header">
        <Link className="back-button" to="/">‹</Link>
        <h1>Создание события</h1>
      </header>

      <form className="create-form" onSubmit={submit}>
        {error && <div className="form-alert">{error}</div>}
        <div className="event-title-preview">
          <span>{eventIcon(form.category)}</span>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Название события"
            required
          />
        </div>

        <fieldset>
          <legend>Категории</legend>
          <div className="chips">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={form.category === category ? 'chip chip--active' : 'chip'}
                onClick={() => setForm({ ...form, category })}
              >
                {category}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          Дата
          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            required
          />
        </label>
        <label>
          Местоположение
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="Рубинштейна, 10"
            required
          />
          {locationState?.coordinates && (
            <span className="field-note">
              Точка на карте: {locationState.coordinates.lat.toFixed(5)}, {locationState.coordinates.lng.toFixed(5)}
            </span>
          )}
        </label>
        <label>
          Максимум участников
          <select
            value={form.max_users}
            onChange={(event) => setForm({ ...form, max_users: Number(event.target.value) })}
          >
            {[2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </label>
        <label>
          Описание
          <textarea
            value={form.descriptions}
            onChange={(event) => setForm({ ...form, descriptions: event.target.value })}
            placeholder="Встречаемся, болтаем, знакомимся. Возьмите с собой хорошее настроение."
            rows={5}
          />
        </label>

        <button className="primary-button" disabled={loading}>
          {loading ? 'Создаем...' : 'Создать событие'}
        </button>
      </form>
    </main>
  );
};

export default CreateEventPage;
