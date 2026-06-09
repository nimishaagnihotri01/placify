import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Button from '../components/common/Button.jsx'
import DriveTable from '../components/dashboard/DriveTable.jsx'
import NotificationSettings from '../components/dashboard/NotificationSettings.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
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
        accent: 'bg-teal-50 text-teal-800',
      },
      {
        title: 'Drives Requiring Attention',
        value: String(reminderStats.drivesRequiringAttention),
        icon: AlertTriangle,
        accent: 'bg-rose-50 text-rose-700',
      },
      {
        title: 'Events This Week',
        value: String(reminderStats.eventsThisWeek),
        icon: CalendarDays,
        accent: 'bg-amber-50 text-amber-800',
      },
      {
        title: 'Events Today',
        value: String(reminderStats.eventsToday),
        icon: CalendarClock,
        accent: 'bg-indigo-50 text-indigo-700',
      },
    ],
    [drives.length, reminderStats],
  )

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Placement overview"
        description="Monitor application activity, upcoming assessment dates, interview rounds, and deadlines from one responsive dashboard."
        action={
          <Button as="link" to="/add-drive">
            Add Drive
          </Button>
        }
      />

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
