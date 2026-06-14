import {
  Bell,
  CalendarDays,
  FileSearch,
  LayoutDashboard,
  MailCheck,
  PlusCircle,
  Search,
} from 'lucide-react'
import {
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import BrandLogo from '../common/BrandLogo.jsx'

const mobileNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Drive', path: '/add-drive', icon: PlusCircle },
  { label: 'Parser', path: '/email-parser', icon: FileSearch },
  { label: 'Gmail', path: '/gmail-sync', icon: MailCheck },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
]

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  function updateSearch(event) {
    const value = event.target.value
    const nextParams = new URLSearchParams(searchParams)

    if (value.trim()) {
      nextParams.set('q', value)
    } else {
      nextParams.delete('q')
    }

    if (location.pathname !== '/dashboard') {
      navigate({
        pathname: '/dashboard',
        search: nextParams.toString(),
      })
      return
    }

    setSearchParams(nextParams, { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <BrandLogo compact />
        </div>

        <label className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 lg:flex">
          <span className="sr-only">Search placement drives</span>
          <Search size={18} aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            onChange={updateSearch}
            placeholder="Search companies or roles"
            type="search"
            value={searchQuery}
          />
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => navigate('/calendar')}
            type="button"
            aria-label="Open calendar"
            title="Open calendar"
          >
            <CalendarDays size={18} aria-hidden="true" />
          </button>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
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
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-900/20">
              S
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
        <label className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
          <span className="sr-only">Search placement drives</span>
          <Search size={17} aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            onChange={updateSearch}
            placeholder="Search drives"
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}
