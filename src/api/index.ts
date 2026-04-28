import axios from 'axios';
import type {
  User,
  AuthData,
  RegisterData,
  LoginData,
  Event,
  CreateEventData,
  EventFilter,
  ChatMessage,
  SendMessageData,
  ApiResponse,
  PaginatedResponse,
  EventCategory,
} from '@/types';

// Re-export types
export type { ApiResponse, PaginatedResponse, Event, EventCategory, CreateEventData };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: RegisterData): Promise<ApiResponse<AuthData>> =>
    api.post('/auth/register', data).then((res) => res.data),

  login: (data: LoginData): Promise<ApiResponse<AuthData>> =>
    api.post('/auth/login', data).then((res) => res.data),

  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout').then((res) => res.data),

  refresh: (refresh_token: string): Promise<ApiResponse<AuthData>> =>
    api.post('/auth/refresh', { refresh_token }).then((res) => res.data),

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me').then((res) => res.data),
};

// Users API
export const usersApi = {
  getProfile: (userId: number): Promise<ApiResponse<User>> =>
    api.get(`/users/${userId}`).then((res) => res.data),

  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put('/users/me', data).then((res) => res.data),

  uploadAvatar: (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};

// Events API
export const eventsApi = {
  getAll: (params?: EventFilter): Promise<ApiResponse<PaginatedResponse<Event>>> =>
    api.get('/events', { params }).then((res) => res.data),

  getById: (eventId: number): Promise<ApiResponse<Event>> =>
    api.get(`/events/${eventId}`).then((res) => res.data),

  create: (data: CreateEventData): Promise<ApiResponse<Event>> =>
    api.post('/events', data).then((res) => res.data),

  update: (
    eventId: number,
    data: Partial<CreateEventData>
  ): Promise<ApiResponse<Event>> =>
    api.put(`/events/${eventId}`, data).then((res) => res.data),

  delete: (eventId: number): Promise<ApiResponse> =>
    api.delete(`/events/${eventId}`).then((res) => res.data),

  join: (eventId: number): Promise<ApiResponse> =>
    api.post(`/events/${eventId}/join`).then((res) => res.data),

  leave: (eventId: number): Promise<ApiResponse> =>
    api.delete(`/events/${eventId}/leave`).then((res) => res.data),

  getUserEvents: (userId: number): Promise<ApiResponse<{ created: Event[]; joined: Event[] }>> =>
    api.get(`/users/${userId}/events`).then((res) => res.data),
};

// Chat API
export const chatApi = {
  getMessages: (eventId: number): Promise<ApiResponse<ChatMessage[]>> =>
    api.get(`/events/${eventId}/messages`).then((res) => res.data),

  sendMessage: (data: SendMessageData): Promise<ApiResponse<ChatMessage>> =>
    api.post('/messages', data).then((res) => res.data),
};

// Categories mapping
export const categoryLabels: Record<EventCategory, string> = {
  cinema: 'Кино',
  sport: 'Спорт',
  cafe: 'Кафе',
  theater: 'Театр',
  concert: 'Концерт',
  exhibition: 'Выставка',
  festival: 'Фестиваль',
  meeting: 'Встреча',
  other: 'Другое',
};

export const categoryColors: Record<EventCategory, string> = {
  cinema: '#e50914',
  sport: '#00a651',
  cafe: '#8b4513',
  theater: '#9b59b6',
  concert: '#f39c12',
  exhibition: '#1abc9c',
  festival: '#e74c3c',
  meeting: '#3498db',
  other: '#95a5a6',
};
