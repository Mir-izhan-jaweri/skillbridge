export function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  )
}

export function scoreColor(score) {
  if (score >= 70) return 'bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200'
  if (score >= 40) return 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}
