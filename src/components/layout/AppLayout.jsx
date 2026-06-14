import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNav from './TopNav.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <TopNav />
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
