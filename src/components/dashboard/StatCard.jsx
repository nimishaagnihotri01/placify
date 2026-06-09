export default function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-lg ${accent}`}>
          <Icon size={21} aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
