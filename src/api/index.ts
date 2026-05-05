import axios from 'axios';
import type {
  AuthData,
  BackendEvent,
  CreateEventData,
  Event,
  EventFilter,
  LoginData,
  RegisterData,
  User,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

let refreshRequest: Promise<unknown> | null = null;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retry && !original?.url?.includes('/auth/')) {
      original._retry = true;

      try {
        refreshRequest ||= api.post('/auth/refresh').finally(() => {
          refreshRequest = null;
        });
        await refreshRequest;
        return api(original);
      } catch (refreshError) {
        refreshRequest = null;
        window.dispatchEvent(new Event('mapapp:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const SPB_CENTER = { lat: 59.9343, lng: 30.3351 };

const hashText = (value: string) =>
  value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const eventIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('коф') || lower.includes('cafe')) return '☕';
  if (lower.includes('спорт') || lower.includes('вел')) return '🚲';
  if (lower.includes('книг')) return '📚';
  if (lower.includes('игр')) return '🎲';
  if (lower.includes('театр')) return '🎭';
  if (lower.includes('кино')) return '🎬';
  return '📍';
};

export const normalizeEvent = (event: BackendEvent): Event => {
  const seed = hashText(`${event.id}-${event.address}-${event.title}`);
  return {
    id: event.id,
    title: event.title,
    description: event.descriptions || 'Описание пока не добавлено.',
    category: event.category,
    address: event.address,
    date: event.date,
    maxUsers: event.max_users,
    currentUsers: Math.max(1, Math.min(event.max_users, (seed % event.max_users) + 1)),
    coordinates: {
      lat: SPB_CENTER.lat + ((seed % 120) - 60) / 10000,
      lng: SPB_CENTER.lng + (((seed / 3) % 140) - 70) / 10000,
    },
  };
};

export const authApi = {
  login: (data: LoginData) => api.post<AuthData>('/auth/login', data).then((res) => res.data),
  register: (data: RegisterData) => api.post<number>('/auth/register', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  me: () => api.get<User>('/auth/me').then((res) => res.data),
};

export const eventsApi = {
  getAll: async (filters?: EventFilter) => {
    const hasFilters = filters && Object.values(filters).some(Boolean);
    const path = hasFilters ? '/events/search' : '/events/all';
    const params = hasFilters ? { page: 1, per_page: 30, ...filters } : undefined;
    const response = await api.get<BackendEvent[]>(path, { params });
    return response.data.map(normalizeEvent);
  },
  getById: async (id: number) => {
    const response = await api.get<BackendEvent>(`/events/one/${id}`);
    return normalizeEvent(response.data);
  },
  create: async (data: CreateEventData) => {
    const response = await api.post<{ data: BackendEvent }>('/events/create', data);
    return normalizeEvent(response.data.data);
  },
  join: async (id: number) => {
    const response = await api.post<{ data: BackendEvent }>(`/events/join/${id}`);
    return normalizeEvent(response.data.data);
  },
  getMine: async () => {
    try {
      const response = await api.get<BackendEvent[]>('/events/me');
      return response.data.map(normalizeEvent);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
};
