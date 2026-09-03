export default function SkillTag({ name, tone = 'default', onRemove }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="ml-0.5 rounded-full px-0.5 opacity-60 transition hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  )
}
