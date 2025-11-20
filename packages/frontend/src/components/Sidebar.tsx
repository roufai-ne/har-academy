import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Home, BookOpen, User, Settings, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useAuthStore()

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'

  const navigation = [
    {
      name: t('nav.dashboard'),
      href: '/dashboard',
      icon: Home,
    },
    {
      name: t('nav.courses'),
      href: '/courses',
      icon: BookOpen,
    },
    {
      name: t('nav.profile'),
      href: '/profile',
      icon: User,
    },
  ]

  const instructorNavigation = [
    {
      name: 'Instructor Dashboard',
      href: '/instructor/dashboard',
      icon: BarChart,
    },
    {
      name: 'Create Course',
      href: '/instructor/create',
      icon: Settings,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        {isInstructor && (
          <>
            <div className="pt-4 mt-4 border-t">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Instructor
              </p>
            </div>
            {instructorNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
