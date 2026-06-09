import { Bell, CalendarDays } from 'lucide-react'
import {
  REMINDER_CATEGORIES,
  groupRemindersByCategory,
} from '../../utils/reminders.js'
import ReminderCard from './ReminderCard.jsx'

const categoryMeta = [
  {
    key: REMINDER_CATEGORIES.urgent.key,
    title: REMINDER_CATEGORIES.urgent.label,
    description: 'Within 24 hours',
  },
  {
    key: REMINDER_CATEGORIES.upcoming.key,
    title: REMINDER_CATEGORIES.upcoming.label,
    description: 'Within 7 days',
  },
  {
    key: REMINDER_CATEGORIES.future.key,
    title: REMINDER_CATEGORIES.future.label,
    description: 'More than 7 days away',
  },
]

export default function UpcomingReminders({
  reminders = [],
  error = '',
  isLoading = false,
}) {
  const groupedReminders = groupRemindersByCategory(reminders)

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-50 text-teal-800">
              <Bell size={18} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold tracking-normal text-slate-950">
              Upcoming Reminders
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Sorted by nearest registration deadline, test, and interview date.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
          <CalendarDays size={16} aria-hidden="true" />
          {reminders.length} active events
        </span>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-500 shadow-sm">
          Loading reminders...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-8 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && reminders.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-500 shadow-sm">
          No upcoming reminders yet. Add dates to your placement drives to see
          countdowns here.
        </div>
      )}

      {!isLoading && !error && reminders.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {categoryMeta.map((category) => {
            const categoryReminders = groupedReminders[category.key]

            return (
              <div key={category.key} className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {category.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {categoryReminders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryReminders.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-400">
                      No {category.title.toLowerCase()} reminders.
                    </div>
                  )}

                  {categoryReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
