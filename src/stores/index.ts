import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, EventCategory } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface MapState {
  center: [number, number];
  zoom: number;
  selectedPlace: string | null;
  selectedCoordinates: [number, number] | null;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedPlace: (place: string | null, coords: [number, number] | null) => void;
  setCoordinatesFromAddress: (address: string) => Promise<void>;
}

export const useMapStore = create<MapState>((set) => ({
  center: [55.751244, 37.618423], // Москва по умолчанию
  zoom: 10,
  selectedPlace: null,
  selectedCoordinates: null,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedPlace: (place, coords) => set({ selectedPlace: place, selectedCoordinates: coords }),
  setCoordinatesFromAddress: async (address) => {
    // Geocoding через Яндекс.Карты API
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${encodeURIComponent(
          address
        )}&apikey=${import.meta.env.VITE_YANDEX_MAP_KEY}`
      );
      const data = await response.json();

      if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
        const coords = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point
          .pos.split(' ')
          .map(Number) as [number, number];
        set({ selectedCoordinates: [coords[1], coords[0]], selectedPlace: address });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  },
}));

interface FilterState {
  searchQuery: string;
  category: EventCategory | 'all';
  dateFrom: string;
  dateTo: string;
  minParticipants: number;
  maxParticipants: number;
  setFilter: (key: string, value: string | number | EventCategory | 'all') => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      searchQuery: '',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      minParticipants: 0,
      maxParticipants: 0,
      setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
      resetFilters: () =>
        set({
          searchQuery: '',
          category: 'all',
          dateFrom: '',
          dateTo: '',
          minParticipants: 0,
          maxParticipants: 0,
        }),
    }),
    {
      name: 'filter-storage',
    }
  )
);

// UI State
interface UIState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));
