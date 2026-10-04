import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/types'
import { LoadingScreen } from './LoadingScreen'

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: UserRole }) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  if (!profile) {
    const target = role === 'teacher' ? '/teacher/login' : '/student/login'
    return <Navigate to={target} replace state={{ from: location.pathname }} />
  }

  if (role && profile.role !== role) {
    // A user who was created while email confirmation was enabled may still have
    // the default student profile. Send them to the teacher activation screen
    // instead of silently bouncing them back to /student.
    if (role === 'teacher' && profile.role === 'student') {
      return <Navigate to="/teacher/login" replace state={{ activateTeacher: true, from: location.pathname }} />
    }

    return <Navigate to={`/${profile.role}`} replace />
  }

  return <>{children}</>
}
