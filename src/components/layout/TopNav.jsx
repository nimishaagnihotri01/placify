import { Bell, CalendarDays, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo.jsx'

const mobileNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Add Drive', path: '/add-drive' },
  { label: 'Email Parser', path: '/email-parser' },
  { label: 'Calendar', path: '/calendar' },
]

export default function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <BrandLogo compact />
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 lg:flex">
          <Search size={18} aria-hidden="true" />
          <span className="text-sm">Search drives, companies, or rounds</span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:text-teal-800"
            type="button"
            aria-label="Open calendar"
            title="Open calendar"
          >
            <CalendarDays size={18} aria-hidden="true" />
          </button>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:text-teal-800"
            type="button"
            aria-label="View notifications"
            title="View notifications"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <div className="hidden items-center gap-3 pl-2 sm:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">Student</p>
              <p className="text-xs text-slate-500">Final year</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              S
            </div>
          </div>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
