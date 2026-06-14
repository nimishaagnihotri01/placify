import { Bell, BellOff } from 'lucide-react'
import { NOTIFICATION_PERMISSION } from '../../utils/notifications.js'

const statusText = {
  [NOTIFICATION_PERMISSION.default]: 'Permission not requested',
  [NOTIFICATION_PERMISSION.denied]: 'Permission denied by browser',
  [NOTIFICATION_PERMISSION.granted]: 'Browser notifications ready',
  [NOTIFICATION_PERMISSION.unsupported]: 'Notifications unavailable',
}

export default function NotificationSettings({
  isEnabled,
  isUpdating = false,
  onToggle,
  permission,
}) {
  const Icon = isEnabled ? Bell : BellOff
  const isUnavailable =
    permission === NOTIFICATION_PERMISSION.denied ||
    permission === NOTIFICATION_PERMISSION.unsupported

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
              isEnabled
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-950">
              Browser Notifications
            </h2>
            <p
              className={`mt-1 text-sm font-semibold ${
                isUnavailable ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              {statusText[permission] || statusText.default}
            </p>
          </div>
        </div>

        <button
          aria-checked={isEnabled}
          className={`flex h-9 w-16 shrink-0 items-center rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
            isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
          disabled={isUpdating || permission === NOTIFICATION_PERMISSION.unsupported}
          onClick={onToggle}
          role="switch"
          type="button"
        >
          <span
            className={`h-7 w-7 rounded-full bg-white shadow-sm transition ${
              isEnabled ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
          <span className="sr-only">
            {isEnabled ? 'Disable notifications' : 'Enable notifications'}
          </span>
        </button>
      </div>
    </section>
  )
}
