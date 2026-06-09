const MS_PER_DAY = 24 * 60 * 60 * 1000
const URGENT_DAY_LIMIT = 1
const UPCOMING_DAY_LIMIT = 7

export const REMINDER_CATEGORIES = {
  urgent: {
    key: 'urgent',
    label: 'Urgent',
    indicator: 'Critical',
  },
  upcoming: {
    key: 'upcoming',
    label: 'Upcoming',
    indicator: 'Warning',
  },
  future: {
    key: 'future',
    label: 'Future',
    indicator: 'Normal',
  },
}

const REMINDER_EVENTS = [
  {
    field: 'registrationDeadline',
    label: 'Registration Deadline',
  },
  {
    field: 'testDate',
    label: 'Test',
  },
  {
    field: 'interviewDate',
    label: 'Interview',
  },
]

function getDriveId(drive) {
  return drive._id || drive.id || `${drive.companyName}-${drive.role}`
}

function parseDateValue(dateValue) {
  if (!dateValue) {
    return null
  }

  if (dateValue instanceof Date) {
    return new Date(dateValue.getTime())
  }

  if (typeof dateValue === 'string') {
    const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
  }

  return new Date(dateValue)
}

function startOfDay(dateValue) {
  const date = parseDateValue(dateValue)

  if (!date || Number.isNaN(date.getTime())) {
    return null
  }

  date.setHours(0, 0, 0, 0)
  return date
}

export function getDaysUntil(dateValue, referenceDate = new Date()) {
  const targetDate = startOfDay(dateValue)
  const today = startOfDay(referenceDate)

  if (!targetDate || !today) {
    return null
  }

  return Math.round((targetDate.getTime() - today.getTime()) / MS_PER_DAY)
}

export function getReminderCategory(daysUntil) {
  if (daysUntil === null || daysUntil < 0) {
    return null
  }

  if (daysUntil <= URGENT_DAY_LIMIT) {
    return REMINDER_CATEGORIES.urgent
  }

  if (daysUntil <= UPCOMING_DAY_LIMIT) {
    return REMINDER_CATEGORIES.upcoming
  }

  return REMINDER_CATEGORIES.future
}

export function getCountdownLabel(daysUntil) {
  if (daysUntil === 0) {
    return 'Today'
  }

  if (daysUntil === 1) {
    return 'Tomorrow'
  }

  return `in ${daysUntil} Days`
}

export function calculateDriveReminderDays(drive, referenceDate = new Date()) {
  return {
    registrationDeadline: getDaysUntilRegistrationDeadline(
      drive,
      referenceDate,
    ),
    testDate: getDaysUntilTestDate(drive, referenceDate),
    interviewDate: getDaysUntilInterviewDate(drive, referenceDate),
  }
}

export function getDaysUntilRegistrationDeadline(
  drive,
  referenceDate = new Date(),
) {
  return getDaysUntil(drive.registrationDeadline, referenceDate)
}

export function getDaysUntilTestDate(drive, referenceDate = new Date()) {
  return getDaysUntil(drive.testDate, referenceDate)
}

export function getDaysUntilInterviewDate(drive, referenceDate = new Date()) {
  return getDaysUntil(drive.interviewDate, referenceDate)
}

export function buildDriveReminders(drives = [], referenceDate = new Date()) {
  return drives
    .flatMap((drive) =>
      REMINDER_EVENTS.map((event) => {
        const dateValue = drive[event.field]
        const daysUntil = getDaysUntil(dateValue, referenceDate)
        const category = getReminderCategory(daysUntil)

        if (!dateValue || !category) {
          return null
        }

        const countdownLabel = getCountdownLabel(daysUntil)

        return {
          id: `${getDriveId(drive)}-${event.field}`,
          driveId: getDriveId(drive),
          companyName: drive.companyName,
          role: drive.role,
          field: event.field,
          eventLabel: event.label,
          eventDate: dateValue,
          daysUntil,
          category: category.key,
          categoryLabel: category.label,
          indicator: category.indicator,
          countdownLabel,
          title: `${drive.companyName} ${event.label} ${countdownLabel}`,
        }
      }),
    )
    .filter(Boolean)
    .sort((first, second) => {
      if (first.daysUntil !== second.daysUntil) {
        return first.daysUntil - second.daysUntil
      }

      return first.eventLabel.localeCompare(second.eventLabel)
    })
}

export function groupRemindersByCategory(reminders = []) {
  return {
    urgent: reminders.filter(
      (reminder) => reminder.category === REMINDER_CATEGORIES.urgent.key,
    ),
    upcoming: reminders.filter(
      (reminder) => reminder.category === REMINDER_CATEGORIES.upcoming.key,
    ),
    future: reminders.filter(
      (reminder) => reminder.category === REMINDER_CATEGORIES.future.key,
    ),
  }
}

export function getReminderStats(reminders = []) {
  const attentionDriveIds = new Set(
    reminders
      .filter((reminder) => reminder.daysUntil <= 7)
      .map((reminder) => reminder.driveId),
  )

  return {
    drivesRequiringAttention: attentionDriveIds.size,
    eventsThisWeek: reminders.filter((reminder) => reminder.daysUntil <= 7).length,
    eventsToday: reminders.filter((reminder) => reminder.daysUntil === 0).length,
  }
}
