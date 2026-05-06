export interface BackendEvent {
  id: number;
  title: string;
  descriptions: string | null;
  category: string;
  address: string;
  date: string;
  max_users: number;
  current_users?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  address: string;
  date: string;
  maxUsers: number;
  currentUsers: number;
  isJoined?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CreateEventData {
  title: string;
  descriptions?: string;
  category: string;
  address: string;
  date: string;
  max_users: number;
}

export interface EventFilter {
  title?: string;
  category?: string;
  address?: string;
  date?: string;
  max_users?: number;
}

export interface User {
  id: number;
  name: string;
  sname: string;
  age: number;
  email: string;
  role: string;
  is_active: boolean;
  events?: BackendEvent[];
}

export interface ChatMessage {
  id: string;
  eventId: number;
  author: string;
  text: string;
  createdAt: string;
  isOwn: boolean;
  isSystem?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  sname: string;
  age: number;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
