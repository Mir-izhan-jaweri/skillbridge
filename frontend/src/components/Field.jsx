export default function Field({ label, name, error, children, hint }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
