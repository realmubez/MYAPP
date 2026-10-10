import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { LearnPage } from './pages/LearnPage';
import { LibraryPage } from './pages/LibraryPage';
import { NotesPage } from './pages/NotesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SpacePlaceholderPage } from './pages/SpacePlaceholderPage';
import { SwedishPage } from './pages/SwedishPage';
import { EnglishPage } from './pages/EnglishPage';
import { GermanPage } from './pages/GermanPage';
import { PythonPage } from './pages/PythonPage';
import { MathematicsPage } from './pages/MathematicsPage';
import { TypingPage } from './pages/TypingPage';
import { TouchTypingPage } from './pages/TouchTypingPage';
import { ProgressPage } from './pages/ProgressPage';
import { ReviewPage } from './pages/ReviewPage';
import { FocusLessonPage } from './pages/FocusLessonPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminUserDetailPage } from './pages/AdminUserDetailPage';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';
import { SubjectProtectedRoute } from './components/auth/SubjectProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicTypingPage } from './pages/PublicTypingPage';

import { ExamPreparePage } from './pages/ExamPreparePage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes (No Login Required) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/exam-prepare" element={<ExamPreparePage />} />
            <Route path="/exam-prep" element={<ExamPreparePage />} />
            <Route path="/exam" element={<ExamPreparePage />} />
            <Route path="/math" element={<MathematicsPage />} />
            <Route path="/mathe" element={<MathematicsPage />} />
            <Route path="/mathematics-public" element={<MathematicsPage />} />
            <Route path="/practice" element={<PublicTypingPage />} />
            <Route path="/read" element={<PublicTypingPage />} />
            <Route path="/lesen" element={<PublicTypingPage />} />
            <Route path="/file-reader" element={<PublicTypingPage />} />
            <Route path="/study" element={<PublicTypingPage />} />
            <Route path="/public-typing" element={<PublicTypingPage />} />
            <Route path="/quick-practice" element={<PublicTypingPage />} />
            <Route path="/public" element={<PublicTypingPage />} />

            {/* Protected Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Personal Learning OS Core Hubs */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/home" element={<Dashboard />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/exam-prepare" element={<ExamPreparePage />} />
                <Route path="/exam-prep" element={<ExamPreparePage />} />
                <Route path="/exam" element={<ExamPreparePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/projects" element={<ProjectsPage />} />

                {/* Managed Learning Spaces Shell */}
                <Route path="/spaces/:spaceSlug" element={<SpacePlaceholderPage />} />

                {/* Individual Subject Learning Curriculums */}
                <Route
                  path="/swedish"
                  element={
                    <SubjectProtectedRoute subjectId="swedish">
                      <SwedishPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/english"
                  element={
                    <SubjectProtectedRoute subjectId="english">
                      <EnglishPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/german"
                  element={
                    <SubjectProtectedRoute subjectId="german">
                      <GermanPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/mathematics"
                  element={
                    <SubjectProtectedRoute subjectId="mathematics">
                      <MathematicsPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/python"
                  element={
                    <SubjectProtectedRoute subjectId="python">
                      <PythonPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/typing"
                  element={
                    <SubjectProtectedRoute subjectId="typing">
                      <TypingPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/typing/day-1"
                  element={
                    <SubjectProtectedRoute subjectId="typing">
                      <TouchTypingPage />
                    </SubjectProtectedRoute>
                  }
                />
                <Route
                  path="/typing/day/:dayNumber"
                  element={
                    <SubjectProtectedRoute subjectId="typing">
                      <TouchTypingPage />
                    </SubjectProtectedRoute>
                  }
                />

                {/* Review, Metrics, Account & Settings */}
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Distraction-Free Focus Mode */}
                <Route path="/focus/:subject/:lessonId" element={<FocusLessonPage />} />
                <Route path="/focus/:subject" element={<FocusLessonPage />} />
                <Route path="/lesson/:id" element={<FocusLessonPage />} />
                <Route path="/lesson/preview" element={<FocusLessonPage />} />

                {/* Admin Control Center Protected Routes */}
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
