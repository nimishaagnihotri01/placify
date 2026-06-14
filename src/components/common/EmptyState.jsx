import { Inbox } from 'lucide-react'

export default function EmptyState({
  action,
  description,
  icon: Icon = Inbox,
  title = 'Nothing here yet',
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-slate-950">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
