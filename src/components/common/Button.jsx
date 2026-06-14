import { Link } from 'react-router-dom'

const baseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-900/20 hover:bg-indigo-700 focus:ring-indigo-600',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-600',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-indigo-600',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-900/20 hover:bg-rose-700 focus:ring-rose-600',
}

export default function Button({
  as = 'button',
  children,
  className = '',
  variant = 'primary',
  to,
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant]} ${className}`

  if (as === 'link') {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
