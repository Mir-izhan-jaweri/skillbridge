export default function Card({ className = '', glass = false, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        glass ? 'glass' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
