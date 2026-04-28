# MapApp Frontend — Documentation

## 📋 Обзор

React-приложение для интерактивной карты событий. MVP включает:

- Авторизация (JWT)
- Карта Яндекс с маркерами событий
- Создание, поиск и фильтрация событий
- Присоединение к событиям
- Профиль пользователя с историей
- Чат в реальном времени

## 🗺️ Карта

**Компонент:** `YandexMap` (`src/components/YandexMap.tsx`)

**Фичи:**
- Динамическая загрузка Яндекс.Карт API по требованию
- Кастомные маркеры с popup-информацией
- Реагирует на клик для создания события
- Автоцентрирование по геолокации

## 📱 Страницы

| Маршрут | Компонент | Описание |
|---------|-----------|----------|
| `/` | `MapPage` | Главная с картой |
| `/events` | `EventsPage` | Список всех событий |
| `/events/:id` | `EventDetailPage` | Детали события |
| `/events/:id/chat` | `ChatPage` | Чат события |
| `/create-event` | `CreateEventPage` | Форма создания |
| `/profile/:userId?` | `ProfilePage` | Профиль пользователя |
| `/login` | `LoginPage` | Вход |
| `/register` | `RegisterPage` | Регистрация |

## 💾 Состояние (Zustand)

| Store | Поля | Назначение |
|-------|------|------------|
| `useAuthStore` | `user`, `isAuthenticated`, `accessToken` | Аутентификация |
| `useMapStore` | `center`, `zoom`, `selectedPlace`, `selectedCoordinates` | Состояние карты |
| `useFilterStore` | `searchQuery`, `category`, `dateFrom`, `dateTo` | Фильтры событий |
| `useUIStore` | `isSidebarOpen`, `isMobileMenuOpen` | UI состояние |

Все сторы сохраняются в localStorage (кроме UI-сторов).

## 🔄 API

**Клиент:** Axios с перехватчиками

- Автоматическое добавление `Authorization: Bearer <token>`
- Авто-обновление токена при 401
- Базовый URL из `.env`

**Эндпоинты** — см. `src/api/index.ts`

## 💬 Сокеты

**Хук:** `useSocket` (`src/hooks/useSocket.tsx`)

Подключение через `SocketProvider` (обёртка вокруг `SocketProvider` в `App.tsx`).

События:
- `join_event` / `leave_event`
- `send_message`
- `new_message` (broadcast)
- `room_joined`, `room_left`, `user_joined`, `user_left`

## 🏗️ Архитектура

```
App
 ├─ Layout (боковая панель, хедер)
 │   └─ Outlet (текущая страница)
 └─ SocketProvider
```

Каждая страница использует:
- `useQuery` для GET-запросов
- `useMutation` для POST/PUT/DELETE
- `useAuthStore` для данных пользователя

## 🎨 Стили

Глобальные CSS переменные в `src/index.css`:

```css
--color-primary: #3b82f6;
--color-background: #f9fafb;
--color-surface: #ffffff;
--color-text: #111827;
```

Утилиты: `.btn`, `.form-input`, `.card`, `.skeleton`.

## ⚙️ Конфигурация

**Vite** (`vite.config.ts`):
- Алиас `@` → `/src`
- TypeScript path mapping

**TypeScript** (`tsconfig.json`):
- Строгий режим
- DOM + ES2020 либы
- Node типы для `vite.config.ts`

## 🚀 Развёртывание

1. Установите зависимости: `npm ci`
2. Создайте `.env` файл
3. Соберите: `npm run build`
4. Раздайте `dist/` через любой HTTP-сервер

## 📝 Примечания

- Yandex Maps API ключ обязателен
- Бэкенд должен корректно CORS-разрешать запросы
- Socket.io сервер должен быть на том же origin, что и API, или настроен на CORS
- В production убедитесь, что `VITE_YANDEX_MAP_KEY` активирован
