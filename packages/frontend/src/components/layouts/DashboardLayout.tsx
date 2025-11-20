import { Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
