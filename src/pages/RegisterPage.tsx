import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { authApi } from '@/api';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  age: number;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authApi.register(registerData);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.access_token);
        navigate('/', { replace: true });
      } else {
        setError(response.error || 'Ошибка регистрации');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Создайте аккаунт</h1>
          <p className="mt-2 text-gray-600">Присоединяйтесь к MapApp</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  Имя
                </label>
                <input
                  type="text"
                  id="first_name"
                  className={`form-input ${errors.first_name ? 'border-red-500' : ''}`}
                  {...register('first_name', {
                    required: 'Имя обязательно',
                    minLength: { value: 2, message: 'Минимум 2 символа' },
                  })}
                />
                {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Фамилия
                </label>
                <input
                  type="text"
                  id="last_name"
                  className={`form-input ${errors.last_name ? 'border-red-500' : ''}`}
                  {...register('last_name', {
                    required: 'Фамилия обязательна',
                    minLength: { value: 2, message: 'Минимум 2 символа' },
                  })}
                />
                {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="example@mail.com"
                {...register('email', {
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный email',
                  },
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Возраст
              </label>
              <input
                type="number"
                id="age"
                className={`form-input ${errors.age ? 'border-red-500' : ''}`}
                min={6}
                max={120}
                {...register('age', {
                  required: 'Возраст обязателен',
                  min: { value: 6, message: 'Минимальный возраст 6 лет' },
                  max: { value: 120, message: 'Максимальный возраст 120 лет' },
                  valueAsNumber: true,
                })}
              />
              {errors.age && <p className="form-error">{errors.age.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Минимум 6 символов"
                {...register('password', {
                  required: 'Пароль обязателен',
                  minLength: { value: 6, message: 'Минимум 6 символов' },
                })}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Подтвердите пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword', {
                  required: 'Подтвердите пароль',
                  validate: (value) => value === password || 'Пароли не совпадают',
                })}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-2.5"
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
