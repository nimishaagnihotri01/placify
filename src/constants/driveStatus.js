export const DRIVE_STATUSES = [
  'Applied',
  'OA Scheduled',
  'OA Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
  'Rejected',
]

export const PIPELINE_STATUSES = [
  'Applied',
  'OA Scheduled',
  'Interview Scheduled',
  'Selected',
  'Rejected',
]

export const STATUS_BADGE_CLASSES = {
  Applied: 'bg-slate-100 text-slate-700 ring-slate-200',
  'OA Scheduled': 'bg-sky-50 text-sky-800 ring-sky-200',
  'OA Completed': 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  'Interview Scheduled': 'bg-amber-50 text-amber-800 ring-amber-200',
  'Interview Completed': 'bg-violet-50 text-violet-800 ring-violet-200',
  Selected: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export const DEFAULT_DRIVE_STATUS = 'Applied'
