import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clear: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'kloket-auth' }
  )
);

interface FilterState {
  query: string;
  category: string;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  category: '',
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  reset: () => set({ query: '', category: '' }),
}));
