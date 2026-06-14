import {
  CalendarDays,
  FileSearch,
  LayoutDashboard,
  MailCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo.jsx'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Drive', path: '/add-drive', icon: PlusCircle },
  { label: 'Email Parser', path: '/email-parser', icon: FileSearch },
  { label: 'Gmail Sync', path: '/gmail-sync', icon: MailCheck },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
]

export default function Sidebar() {
  return (
    <aside className="hidden shrink-0 border-r border-slate-200 bg-white px-3 py-6 transition-all lg:flex lg:min-h-screen lg:w-20 lg:flex-col xl:w-72 xl:px-5">
      <div className="hidden xl:block">
        <BrandLogo />
      </div>
      <div className="flex justify-center xl:hidden">
        <BrandLogo compact />
      </div>

      <nav className="mt-9 space-y-1.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex min-h-11 items-center justify-center gap-3 rounded-lg px-4 text-sm font-semibold transition duration-200 xl:justify-start ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 hidden h-6 w-1 rounded-r-full transition xl:block ${
                      isActive ? 'bg-indigo-600' : 'bg-transparent'
                    }`}
                  />
                  <Icon
                    className={isActive ? 'text-indigo-700' : 'text-slate-400'}
                    size={19}
                    aria-hidden="true"
                  />
                  <span className="sr-only xl:not-sr-only">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto hidden rounded-lg border border-indigo-100 bg-indigo-50 p-4 xl:block">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-950">
          <Sparkles size={17} aria-hidden="true" />
          Placement focus
        </div>
        <p className="mt-2 text-sm leading-6 text-indigo-950/75">
          Keep every drive, deadline, test, and interview visible in one place.
        </p>
      </div>
    </aside>
  )
}
