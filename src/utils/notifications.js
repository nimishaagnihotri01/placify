export const NOTIFICATION_PERMISSION = {
  default: 'default',
  denied: 'denied',
  granted: 'granted',
  unsupported: 'unsupported',
}

const EVENT_DISPLAY_LABELS = {
  registrationDeadline: 'Deadline',
  testDate: 'Test',
  interviewDate: 'Interview',
}

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) {
    return NOTIFICATION_PERMISSION.unsupported
  }

  return window.Notification.permission
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return NOTIFICATION_PERMISSION.unsupported
  }

  if (window.Notification.permission !== NOTIFICATION_PERMISSION.default) {
    return window.Notification.permission
  }

  try {
    return await window.Notification.requestPermission()
  } catch {
    return window.Notification.permission
  }
}

export function shouldNotifyReminder(reminder) {
  if (!reminder || typeof reminder.daysUntil !== 'number') {
    return false
  }

  if (reminder.field === 'registrationDeadline') {
    return reminder.daysUntil === 0
  }

  return reminder.daysUntil === 0 || reminder.daysUntil === 1
}

export function buildNotificationTitle(reminder) {
  const eventLabel = EVENT_DISPLAY_LABELS[reminder.field] || reminder.eventLabel

  if (reminder.daysUntil === 0) {
    return `${reminder.companyName} ${eventLabel} Today`
  }

  if (reminder.field === 'interviewDate') {
    return `${reminder.companyName} ${eventLabel} in 24 Hours`
  }

  return `${reminder.companyName} ${eventLabel} Tomorrow`
}

export function buildNotificationBody(reminder) {
  const roleText = reminder.role ? ` for ${reminder.role}` : ''

  if (reminder.field === 'registrationDeadline') {
    if (reminder.daysUntil === 0) {
      return `Registration closes today${roleText}. Review the drive before the deadline.`
    }

    return `Registration deadline${roleText} is coming up soon. Open Placify to review details.`
  }

  if (reminder.daysUntil === 0) {
    return `${reminder.eventLabel}${roleText} is scheduled today. Open Placify to review details.`
  }

  return `${reminder.eventLabel}${roleText} is coming up tomorrow. Open Placify to prepare.`
}

export function buildNotificationPayload(reminder) {
  return {
    title: buildNotificationTitle(reminder),
    options: {
      body: buildNotificationBody(reminder),
      icon: '/favicon.svg',
      tag: `placify-${reminder.id}`,
      renotify: false,
    },
  }
}

export function showBrowserNotification(payload) {
  if (getNotificationPermission() !== NOTIFICATION_PERMISSION.granted) {
    return null
  }

  return new window.Notification(payload.title, payload.options)
}
