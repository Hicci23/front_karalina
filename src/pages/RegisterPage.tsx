import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import BrandLogo from '@/components/BrandLogo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', sname: '', age: 18, email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось зарегистрироваться.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="splash-panel splash-panel--small">
        <BrandLogo />
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>Регистрация</h2>
        {error && <div className="form-alert">{error}</div>}
        <div className="two-col">
          <label>
            Имя
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Фамилия
            <input value={form.sname} onChange={(event) => setForm({ ...form, sname: event.target.value })} required />
          </label>
        </div>
        <label>
          Возраст
          <input
            value={form.age}
            onChange={(event) => setForm({ ...form, age: Number(event.target.value) })}
            type="number"
            min={1}
            required
          />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
        </label>
        <label>
          Пароль
          <input
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            type="password"
            minLength={8}
            required
          />
        </label>
        <button className="primary-button" disabled={loading}>
          {loading ? 'Создаем...' : 'Зарегистрироваться'}
        </button>
        <Link to="/login">Уже есть аккаунт</Link>
      </form>
    </main>
  );
};

export default RegisterPage;
