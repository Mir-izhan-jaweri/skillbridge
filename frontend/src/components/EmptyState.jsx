export default function EmptyState({ icon = '🔍', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
