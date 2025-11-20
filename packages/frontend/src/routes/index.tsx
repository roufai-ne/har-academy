import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'

// Public Pages
import { LandingPage } from '@/pages/Landing'
import { LoginPage } from '@/pages/auth/Login'
import { SignupPage } from '@/pages/auth/Signup'
import { CoursesPage } from '@/pages/Courses'
import { CourseDetailPage } from '@/pages/CourseDetail'

// Protected Pages
import { DashboardPage } from '@/pages/Dashboard'
import { ProfilePage } from '@/pages/Profile'
import { LearningSpacePage } from '@/pages/LearningSpace'

// Instructor Pages
import { InstructorDashboard } from '@/pages/instructor/Dashboard'
import { CreateCoursePage } from '@/pages/instructor/CreateCourse'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

// Instructor Route Component
function InstructorRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/learn/:courseId" element={<LearningSpacePage />} />
      </Route>

      {/* Instructor Routes */}
      <Route
        element={
          <InstructorRoute>
            <DashboardLayout />
          </InstructorRoute>
        }
      >
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/create" element={<CreateCoursePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
