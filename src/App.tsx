import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MapPage from '@/pages/MapPage';
import CreateEventPage from '@/pages/CreateEventPage';
import EventDetailPage from '@/pages/EventDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import ChatPage from '@/pages/ChatPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <MapPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/events/:id"
      element={
        <ProtectedRoute>
          <EventDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/events/:id/chat"
      element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-event"
      element={
        <ProtectedRoute>
          <CreateEventPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
