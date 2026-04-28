// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  age: number;
  avatar_url?: string;
  created_events: Event[];
  joined_events: Event[];
}

export interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age: number;
}

export interface LoginData {
  email: string;
  password: string;
}

// Event types
export interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  max_participants: number;
  current_participants: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: EventCategory;
  created_by: number;
  creator: User;
  participants: User[];
  chat_messages: ChatMessage[];
  created_at?: string;
}

export type EventCategory =
  | 'cinema'
  | 'sport'
  | 'cafe'
  | 'theater'
  | 'concert'
  | 'exhibition'
  | 'festival'
  | 'meeting'
  | 'other';

export interface CreateEventData {
  title: string;
  description: string;
  date_time: string;
  max_participants: number;
  address: string;
  coordinates: { lat: number; lng: number };
  category: EventCategory;
}

export interface EventFilter {
  search?: string;
  category?: EventCategory | 'all';
  date_from?: string;
  date_to?: string;
  min_participants?: number;
  max_participants?: number;
}

// Chat types
export interface ChatMessage {
  id: number;
  content: string;
  sender_id: number;
  sender: User;
  event_id: number;
  created_at: string;
}

export interface SendMessageData {
  content: string;
  event_id: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Map types
export interface YandexMapPlace {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  category?: string;
}
