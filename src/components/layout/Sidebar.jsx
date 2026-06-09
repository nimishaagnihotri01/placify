import {
  CalendarDays,
  FileSearch,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo.jsx'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Drive', path: '/add-drive', icon: PlusCircle },
  { label: 'Email Parser', path: '/email-parser', icon: FileSearch },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:min-h-screen lg:flex-col">
      <BrandLogo />

      <nav className="mt-10 space-y-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`
              }
            >
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
          <Sparkles size={17} aria-hidden="true" />
          Placement focus
        </div>
        <p className="mt-2 text-sm leading-6 text-teal-900/80">
          Keep every drive, deadline, test, and interview visible in one place.
        </p>
      </div>
    </aside>
  )
}
