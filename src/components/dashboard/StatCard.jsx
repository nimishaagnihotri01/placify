export default function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <span
          className={`grid h-11 w-11 place-items-center rounded-lg ring-1 ring-inset ${accent}`}
        >
          <Icon size={21} aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
