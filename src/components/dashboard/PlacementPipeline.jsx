import { CheckCircle2, ClipboardList, FileCheck, Trophy, XCircle } from 'lucide-react'
import { PIPELINE_STATUSES } from '../../constants/driveStatus.js'

const pipelineMeta = {
  Applied: {
    icon: ClipboardList,
    accent: 'bg-slate-100 text-slate-700',
  },
  'OA Scheduled': {
    icon: FileCheck,
    accent: 'bg-sky-50 text-sky-800',
  },
  'Interview Scheduled': {
    icon: CheckCircle2,
    accent: 'bg-amber-50 text-amber-800',
  },
  Selected: {
    icon: Trophy,
    accent: 'bg-emerald-50 text-emerald-800',
  },
  Rejected: {
    icon: XCircle,
    accent: 'bg-rose-50 text-rose-700',
  },
}

export default function PlacementPipeline({ drives = [] }) {
  const counts = PIPELINE_STATUSES.reduce((result, status) => {
    result[status] = drives.filter((drive) => drive.status === status).length
    return result
  }, {})

  return (
    <section className="mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-normal text-slate-950">
          Placement Pipeline
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Count active applications across the key pipeline stages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {PIPELINE_STATUSES.map((status) => {
          const meta = pipelineMeta[status]
          const Icon = meta.icon

          return (
            <article
              key={status}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{status}</p>
                  <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
                    {counts[status]}
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-lg ${meta.accent}`}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
