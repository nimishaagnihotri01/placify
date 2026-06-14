export default function SectionHeader({
  action,
  description,
  eyebrow,
  icon: Icon,
  title,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              <Icon size={18} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                {eyebrow}
              </p>
            )}
            <h2 className="text-lg font-bold tracking-normal text-slate-950 sm:text-xl">
              {title}
            </h2>
          </div>
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
