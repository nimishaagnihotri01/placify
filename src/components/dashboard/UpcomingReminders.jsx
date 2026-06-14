import { Bell, CalendarDays } from 'lucide-react'
import EmptyState from '../common/EmptyState.jsx'
import LoadingState from '../common/LoadingState.jsx'
import SectionHeader from '../common/SectionHeader.jsx'
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
      <SectionHeader
        title="Upcoming Reminders"
        description="Sorted by nearest registration deadline, test, and interview date."
        icon={Bell}
        action={
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
          <CalendarDays size={16} aria-hidden="true" />
          {reminders.length} active events
        </span>
        }
      />

      {isLoading && <LoadingState rows={2} title="Loading reminders" />}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-8 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && reminders.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming reminders"
          description="Add dates to your placement drives to see registration, test, and interview countdowns here."
        />
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      category.key === REMINDER_CATEGORIES.urgent.key
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {categoryReminders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryReminders.length === 0 && (
                    <EmptyState
                      title={`No ${category.title.toLowerCase()} reminders`}
                      description={category.description}
                    />
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
