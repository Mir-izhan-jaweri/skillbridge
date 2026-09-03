import Card from './Card'

export default function StatCard({ label, value, hint, icon, accent = 'text-brand-600' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
        {icon && <span className={`text-2xl ${accent}`} aria-hidden="true">{icon}</span>}
      </div>
    </Card>
  )
}
