import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LoadingScreen } from './components/LoadingScreen'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { ClassroomPage } from './pages/ClassroomPage'
import { ClassesPage } from './pages/ClassesPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { QuizResultsPage } from './pages/QuizResultsPage'
import { TakeQuizPage } from './pages/TakeQuizPage'

function HomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return <Navigate to={profile ? `/${profile.role}` : '/student/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/student/login" element={<AuthPage role="student" />} />
      <Route path="/teacher/login" element={<AuthPage role="teacher" />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><DashboardPage /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute role="teacher"><ClassesPage /></ProtectedRoute>} />
        <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><ProfilePage /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><DashboardPage /></ProtectedRoute>} />
        <Route path="/student/classes" element={<ProtectedRoute role="student"><ClassesPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />
        <Route path="/class/:classroomId" element={<ClassroomPage />} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute role="student"><TakeQuizPage /></ProtectedRoute>} />
        <Route path="/quiz/:quizId/results" element={<ProtectedRoute role="teacher"><QuizResultsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
