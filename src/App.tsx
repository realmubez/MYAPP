import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { SwedishPage } from './pages/SwedishPage';
import { EnglishPage } from './pages/EnglishPage';
import { PythonPage } from './pages/PythonPage';
import { TypingPage } from './pages/TypingPage';
import { TouchTypingPage } from './pages/TouchTypingPage';
import { ProgressPage } from './pages/ProgressPage';
import { ReviewPage } from './pages/ReviewPage';
import { FocusLessonPage } from './pages/FocusLessonPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/swedish" element={<SwedishPage />} />
                <Route path="/english" element={<EnglishPage />} />
                <Route path="/python" element={<PythonPage />} />
                <Route path="/typing" element={<TypingPage />} />
                <Route path="/typing/day-1" element={<TouchTypingPage />} />
                <Route path="/typing/day/:dayNumber" element={<TouchTypingPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/focus/:subject/:lessonId" element={<FocusLessonPage />} />
                <Route path="/focus/:subject" element={<FocusLessonPage />} />
                <Route path="/lesson/:id" element={<FocusLessonPage />} />
                <Route path="/lesson/preview" element={<FocusLessonPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
