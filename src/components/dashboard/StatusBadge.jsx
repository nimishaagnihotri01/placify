import { STATUS_BADGE_CLASSES } from '../../constants/driveStatus.js'

export default function StatusBadge({ status = 'Applied' }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
        STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.Applied
      }`}
    >
      {status}
    </span>
  )
}
