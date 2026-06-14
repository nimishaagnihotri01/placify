import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Clock,
} from 'lucide-react'

const indicatorClasses = {
  Critical: {
    card: 'border-rose-200 bg-rose-50/80',
    icon: 'bg-rose-100 text-rose-700',
    badge: 'bg-rose-700 text-white',
    label: 'text-rose-700',
    Icon: AlertTriangle,
  },
  Warning: {
    card: 'border-amber-200 bg-amber-50/80',
    icon: 'bg-amber-100 text-amber-800',
    badge: 'bg-amber-100 text-amber-900',
    label: 'text-amber-800',
    Icon: CalendarClock,
  },
  Normal: {
    card: 'border-slate-200 bg-white',
    icon: 'bg-indigo-50 text-indigo-700',
    badge: 'bg-slate-100 text-slate-700',
    label: 'text-slate-500',
    Icon: CalendarCheck,
  },
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

export default function ReminderCard({ reminder }) {
  const classes = indicatorClasses[reminder.indicator] || indicatorClasses.Normal
  const Icon = classes.Icon

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${classes.card}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${classes.icon}`}
        >
          <Icon size={19} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-5 text-slate-950">
                {reminder.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {reminder.role}
              </p>
            </div>
            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${classes.badge}`}
            >
              <Clock size={13} aria-hidden="true" />
              {reminder.countdownLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={classes.label}>{reminder.indicator}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{reminder.eventLabel}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{formatDate(reminder.eventDate)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
