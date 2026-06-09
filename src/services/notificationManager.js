import {
  NOTIFICATION_PERMISSION,
  buildNotificationPayload,
  getNotificationPermission,
  requestNotificationPermission,
  shouldNotifyReminder,
  showBrowserNotification,
} from '../utils/notifications.js'

const PREFERENCE_KEY = 'placify.notifications.enabled'
const SENT_NOTIFICATIONS_KEY = 'placify.notifications.sent'

function readStorageValue(storage, key) {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function writeStorageValue(storage, key, value) {
  try {
    storage.setItem(key, value)
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
}

function getSentNotificationIds() {
  if (typeof window === 'undefined') {
    return new Set()
  }

  const rawIds = readStorageValue(window.sessionStorage, SENT_NOTIFICATIONS_KEY)

  if (!rawIds) {
    return new Set()
  }

  try {
    return new Set(JSON.parse(rawIds))
  } catch {
    return new Set()
  }
}

function saveSentNotificationIds(ids) {
  if (typeof window === 'undefined') {
    return
  }

  writeStorageValue(
    window.sessionStorage,
    SENT_NOTIFICATIONS_KEY,
    JSON.stringify([...ids]),
  )
}

function getNotificationId(reminder) {
  return `${reminder.id}-${reminder.daysUntil}`
}

export function getNotificationPreference() {
  if (typeof window === 'undefined') {
    return false
  }

  return readStorageValue(window.localStorage, PREFERENCE_KEY) === 'true'
}

export function setNotificationPreference(isEnabled) {
  if (typeof window === 'undefined') {
    return
  }

  writeStorageValue(window.localStorage, PREFERENCE_KEY, String(isEnabled))
}

export function getNotificationStatus() {
  return {
    isEnabled: getNotificationPreference(),
    permission: getNotificationPermission(),
  }
}

export async function enableNotifications() {
  const permission = await requestNotificationPermission()
  const isEnabled = permission === NOTIFICATION_PERMISSION.granted

  setNotificationPreference(isEnabled)

  return {
    isEnabled,
    permission,
  }
}

export function disableNotifications() {
  setNotificationPreference(false)

  return {
    isEnabled: false,
    permission: getNotificationPermission(),
  }
}

export async function notifyForReminders(reminders = []) {
  if (typeof window === 'undefined') {
    return getNotificationStatus()
  }

  if (!getNotificationPreference()) {
    return getNotificationStatus()
  }

  let permission = getNotificationPermission()

  if (permission === NOTIFICATION_PERMISSION.default) {
    permission = await requestNotificationPermission()
  }

  if (permission !== NOTIFICATION_PERMISSION.granted) {
    if (
      permission === NOTIFICATION_PERMISSION.denied ||
      permission === NOTIFICATION_PERMISSION.unsupported
    ) {
      setNotificationPreference(false)
    }

    return {
      isEnabled: getNotificationPreference(),
      permission,
    }
  }

  const sentNotificationIds = getSentNotificationIds()
  const remindersToNotify = reminders.filter(shouldNotifyReminder)

  remindersToNotify.forEach((reminder) => {
    const notificationId = getNotificationId(reminder)

    if (sentNotificationIds.has(notificationId)) {
      return
    }

    try {
      showBrowserNotification(buildNotificationPayload(reminder))
    } catch {
      return
    }

    sentNotificationIds.add(notificationId)
  })

  saveSentNotificationIds(sentNotificationIds)

  return {
    isEnabled: getNotificationPreference(),
    permission,
  }
}
