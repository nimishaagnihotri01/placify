import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import DriveTable from '../components/dashboard/DriveTable.jsx'
import NotificationSettings from '../components/dashboard/NotificationSettings.jsx'
import PlacementPipeline from '../components/dashboard/PlacementPipeline.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import UpcomingReminders from '../components/dashboard/UpcomingReminders.jsx'
import {
  disableNotifications,
  enableNotifications,
  getNotificationStatus,
  notifyForReminders,
} from '../services/notificationManager.js'
import { getDrives } from '../services/driveService.js'
import { buildDriveReminders, getReminderStats } from '../utils/reminders.js'

export default function Dashboard() {
  const [drives, setDrives] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notificationStatus, setNotificationStatus] = useState(() =>
    getNotificationStatus(),
  )
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadDrives() {
      try {
        setIsLoading(true)
        setError('')
        const data = await getDrives()

        if (isMounted) {
          setDrives(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDrives()

    return () => {
      isMounted = false
    }
  }, [])

  const reminders = useMemo(() => buildDriveReminders(drives), [drives])
  const reminderStats = useMemo(() => getReminderStats(reminders), [reminders])

  useEffect(() => {
    let isMounted = true

    async function sendDueNotifications() {
      if (isLoading || error) {
        return
      }

      const nextStatus = await notifyForReminders(reminders)

      if (isMounted) {
        setNotificationStatus(nextStatus)
      }
    }

    sendDueNotifications()

    return () => {
      isMounted = false
    }
  }, [error, isLoading, reminders])

  async function handleToggleNotifications() {
    try {
      setIsUpdatingNotifications(true)

      if (notificationStatus.isEnabled) {
        setNotificationStatus(disableNotifications())
        return
      }

      const nextStatus = await enableNotifications()
      setNotificationStatus(nextStatus)

      if (nextStatus.isEnabled && !isLoading && !error) {
        setNotificationStatus(await notifyForReminders(reminders))
      }
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  function handleDriveDeleted(deletedDriveId) {
    setDrives((currentDrives) =>
      currentDrives.filter((drive) => drive._id !== deletedDriveId),
    )
  }

  const stats = useMemo(
    () => [
      {
        title: 'Applied Drives',
        value: String(drives.length),
        icon: BriefcaseBusiness,
        accent: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      },
      {
        title: 'Drives Requiring Attention',
        value: String(reminderStats.drivesRequiringAttention),
        icon: AlertTriangle,
        accent: 'bg-rose-50 text-rose-700 ring-rose-100',
      },
      {
        title: 'Events This Week',
        value: String(reminderStats.eventsThisWeek),
        icon: CalendarDays,
        accent: 'bg-amber-50 text-amber-800 ring-amber-100',
      },
      {
        title: 'Events Today',
        value: String(reminderStats.eventsToday),
        icon: CalendarClock,
        accent: 'bg-sky-50 text-sky-700 ring-sky-100',
      },
    ],
    [drives.length, reminderStats],
  )

  const priorityItems = useMemo(() => reminders.slice(0, 3), [reminders])
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        weekday: 'long',
      }).format(new Date()),
    [],
  )

  return (
    <>
      <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700">
                Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Welcome back, Student
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Track applications, deadlines, online assessments, interviews,
                and priority reminders from one focused placement workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button as="link" to="/add-drive">
                Add Drive
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button as="link" to="/calendar" variant="secondary">
                View Calendar
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Today
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {todayLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Active Events
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {reminders.length} reminders tracked
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Focus
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {reminderStats.drivesRequiringAttention || 0} drives need review
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Today's priorities
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Nearest actions across your drives.
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {priorityItems.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">
                No urgent priorities yet. Add drive dates to build your action
                list.
              </div>
            )}

            {priorityItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.eventLabel}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
                    {item.countdownLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <NotificationSettings
        isEnabled={notificationStatus.isEnabled}
        isUpdating={isUpdatingNotifications}
        onToggle={handleToggleNotifications}
        permission={notificationStatus.permission}
      />

      <PlacementPipeline drives={drives} />

      <UpcomingReminders
        reminders={reminders}
        error={error}
        isLoading={isLoading}
      />

      <div className="mt-6">
        <DriveTable
          drives={drives}
          error={error}
          isLoading={isLoading}
          onDriveDeleted={handleDriveDeleted}
        />
      </div>
    </>
  )
}
