export default function Card({
  as: Component = 'section',
  children,
  className = '',
  interactive = false,
  ...props
}) {
  const interactiveClasses = interactive
    ? 'transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/70'
    : ''

  return (
    <Component
      className={`rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
