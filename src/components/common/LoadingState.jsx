export default function LoadingState({
  rows = 3,
  title = 'Loading',
  className = '',
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{title}</span>
      <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-4">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100 sm:col-span-2" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
