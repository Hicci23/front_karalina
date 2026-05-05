import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import BrandLogo from '@/components/BrandLogo';
import { useAuthStore } from '@/stores';

const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login({ email, password });
      const user = await authApi.me();
      setUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось войти. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="splash-panel">
        <BrandLogo />
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>Вход</h2>
        <p>Найдите компанию рядом и договоритесь о встрече.</p>
        {error && <div className="form-alert">{error}</div>}
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Пароль
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </label>
        <button className="primary-button" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <Link to="/register">Создать аккаунт</Link>
      </form>
    </main>
  );
};

export default LoginPage;
