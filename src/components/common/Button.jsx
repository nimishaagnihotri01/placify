import { Link } from 'react-router-dom'

const baseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2'

const variants = {
  primary:
    'bg-teal-700 text-white shadow-sm shadow-teal-900/10 hover:bg-teal-800 focus:ring-teal-700',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:border-teal-200 hover:bg-teal-50 focus:ring-teal-700',
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
