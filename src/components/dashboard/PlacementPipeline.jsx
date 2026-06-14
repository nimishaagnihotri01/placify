import { CheckCircle2, ClipboardList, FileCheck, Trophy, XCircle } from 'lucide-react'
import Card from '../common/Card.jsx'
import SectionHeader from '../common/SectionHeader.jsx'
import { PIPELINE_STATUSES } from '../../constants/driveStatus.js'

const pipelineMeta = {
  Applied: {
    icon: ClipboardList,
    accent: 'bg-slate-100 text-slate-700 ring-slate-200',
    bar: 'bg-slate-500',
  },
  'OA Scheduled': {
    icon: FileCheck,
    accent: 'bg-sky-50 text-sky-800 ring-sky-100',
    bar: 'bg-sky-500',
  },
  'OA Completed': {
    icon: CheckCircle2,
    accent: 'bg-cyan-50 text-cyan-800 ring-cyan-100',
    bar: 'bg-cyan-500',
  },
  'Interview Scheduled': {
    icon: CheckCircle2,
    accent: 'bg-amber-50 text-amber-800 ring-amber-100',
    bar: 'bg-amber-500',
  },
  'Interview Completed': {
    icon: FileCheck,
    accent: 'bg-violet-50 text-violet-800 ring-violet-100',
    bar: 'bg-violet-500',
  },
  Selected: {
    icon: Trophy,
    accent: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    bar: 'bg-emerald-500',
  },
  Rejected: {
    icon: XCircle,
    accent: 'bg-rose-50 text-rose-700 ring-rose-100',
    bar: 'bg-rose-500',
  },
}

export default function PlacementPipeline({ drives = [] }) {
  const counts = PIPELINE_STATUSES.reduce((result, status) => {
    result[status] = drives.filter((drive) => drive.status === status).length
    return result
  }, {})
  const total = drives.length || 0

  return (
    <section className="mt-6">
      <SectionHeader
        title="Placement Pipeline"
        description="Visual progress across application stages, from applied to final result."
        icon={ClipboardList}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PIPELINE_STATUSES.map((status) => {
          const meta = pipelineMeta[status]
          const Icon = meta.icon
          const count = counts[status]
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <Card
              key={status}
              className="p-4"
              interactive
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{status}</p>
                  <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
                    {count}
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-lg ring-1 ${meta.accent}`}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{percentage}% of drives</span>
                  <span>{total} total</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${meta.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
