import { BriefcaseBusiness } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BrandLogo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Placify home">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-900/20">
        <BriefcaseBusiness size={22} aria-hidden="true" />
      </span>
      {!compact && (
        <span>
          <span className="block text-xl font-bold tracking-normal text-slate-950">
            Placify
          </span>
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Placement tracker
          </span>
        </span>
      )}
    </Link>
  )
}
