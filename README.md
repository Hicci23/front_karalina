# MapApp Frontend

Интерактивная платформа для поиска и организации событий с картой Яндекс.Карты.

## 🚀 Технологический стек

- **React 18** + **TypeScript** — типобезопасная разработка
- **Vite** — быстрая сборка
- **React Router v6** — клиентская маршрутизация
- **TanStack Query (React Query v5)** — управление серверным состоянием
- **Zustand** — глобальное состояние (аутентификация, фильтры, карта)
- **React Hook Form** — управление формами
- **Axios** — HTTP-клиент с перехватчиками для JWT
- **Socket.io Client** — веб-сокеты для чата в реальном времени
- **Yandex Maps API** — отображение интерактивной карты
- **date-fns** — форматирование дат

## 📁 Структура проекта

```
src/
├── api/                # API клиенты и константы
│   └── index.ts       # Axios инстанс, endpoints, categoryLabels
├── components/         # Переиспользуемые UI компоненты
│   ├── ChatRoom.tsx   # Компонент чата внутри события
│   ├── CategoryBadge.tsx
│   ├── EventCard.tsx
│   ├── EventFilters.tsx
│   ├── Layout.tsx     # Основной макет с сайдбаром
│   ├── ProtectedRoute.tsx
│   ├── YandexMap.tsx  # Обёртка над Яндекс.Картами
│   └── YandexMap.css
├── hooks/             # Кастомные хуки
│   └── useSocket.tsx  # Контекст сокетов для чата
├── pages/             # Страницы приложения
│   ├── ChatPage.tsx
│   ├── CreateEventPage.tsx
│   ├── EventDetailPage.tsx
│   ├── EventsPage.tsx
│   ├── LoginPage.tsx
│   ├── MapPage.tsx    # Главная страница с картой
│   ├── ProfilePage.tsx
│   └── RegisterPage.tsx
├── stores/            # Глобальное состояние (Zustand)
│   └── index.ts       # useAuthStore, useMapStore, useFilterStore, useUIStore
├── types/             # TypeScript типы
│   ├── index.ts
│   └── react-yandex-maps.d.ts
├── utils/             # Утилиты и вспомогательные функции
│   ├── eventActions.ts
│   └── helpers.ts
├── App.tsx            # Основной компонент с роутингом
├── index.css          # Глобальные стили
└── main.tsx           # Точка входа
```

## 🔧 Настройка окружения

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
VITE_YANDEX_MAP_KEY=YOUR_YANDEX_MAPS_API_KEY
```

**Получение API ключа Яндекс.Карт:**
1. Зарегистрируйтесь на [ Яндекс.Разработчиках](https://developer.tech.yandex.ru/)
2. Создайте новый ключ API для «JavaScript API и HTTP-геокодер»
3. Скопируйте ключ в `.env`

### 3. Запуск

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Превью продакшен-сборки
npm run preview

# Линтинг
npm run lint
```

## 🌐 Подключение к бэкенду

Фронтенд ожидает REST API совместимый со спецификацией MapApp:

**Базовый URL:** `VITE_API_URL/api/v1`

**Эндпоинты:**
- `POST /auth/register` — регистрация
- `POST /auth/login` — авторизация
- `GET  /auth/me` — текущий пользователь
- `GET  /events` — список событий (с фильтрацией)
- `GET  /events/:id` — детали события
- `POST /events` — создать событие
- `POST /events/:id/join` — присоединиться
- `DELETE /events/:id/leave` — покинуть
- `GET  /users/:id/events` — события пользователя
- `GET  /messages?event_id=:id` — сообщения чата
- `POST /messages` — отправить сообщение

**WebSocket:** Подключение к `VITE_SOCKET_URL` с JWT токеном в `auth` объекте.

## 🗺️ Работа с картой

Компонент `YandexMap` абстрагирует работу с Яндекс.Картами API:

```tsx
import YandexMap from '@/components/YandexMap';

<YandexMap
  center={[55.751244, 37.618423]}
  zoom={10}
  markers={[
    {
      id: 1,
      coordinates: [55.751244, 37.618423],
      title: 'Москва',
      address: 'г. Москва',
      category: 'cinema'
    }
  ]}
  onMarkerClick={(id) => console.log('Clicked:', id)}
  onMapClick={(coords) => console.log('Map clicked:', coords)}
/>
```

## 🔐 Аутентификация

Состояние аутентификации хранится в `useAuthStore` (Zustand + persist):

```tsx
import { useAuthStore } from '@/stores';

const { user, isAuthenticated, setAuth, logout } = useAuthStore();
```

JWT токены автоматически добавляются в заголовки запросов через Axios interceptor. При истечении токена выполняется автоматический refresh.

## 💬 Чат в реальном времени

Компонент `ChatRoom` использует Socket.io подключение через `SocketProvider`. Все события событий имеют отдельную комнату:

```tsx
import { useSocket } from '@/hooks/useSocket';

const { joinEventRoom, sendMessage, messages } = useSocket();
joinEventRoom(eventId);
```

## 🎯 Основные компоненты

### EventCard
Отображает карточку события на списке.

### EventFilters
Фильтрация событий по поисковому запросу и категории.

### CategoryBadge
Бейдж категории с цветом.

### Layout
Основной макет с фиксированной шапкой и боковой панелью. Адаптивный дизайн с бургер-меню на мобильных.

## 🎨 Стилизация

Глобальные стили в `src/index.css`. Используются CSS переменные:

```css
--color-primary: #3b82f6;
--color-background: #f9fafb;
--color-surface: #ffffff;
```

Классы утилит (`.btn`, `.form-input`, `.card`, `.skeleton`) совместимы с Tailwind, но написаны на чистых CSS.

## 📦 Сборка

Типография проекта настроена на **ES2020**, модули **ESNext**. Aliases:
- `@` → `/src`

## ✅ Текущий статус

✅ Все страницы реализованы
✅ Маршрутизация и защита роутов
✅ Интеграция Яндекс.Карт
✅ Реальное время (чат)
✅ Фильтрация событий
✅ TypeScript без ошибок
✅ Сборка проходит

## 🔮 Будущие улучшения

- [ ] Подключение реального бэкенда
- [ ] Загрузка аватаров
- [ ] Уведомления
- [ ] Пагинация событий
- [ ] Локализация (i18n)
- [ ] Unit и E2E тесты
