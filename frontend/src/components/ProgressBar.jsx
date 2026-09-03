import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, tone = 'brand', label }) {
  const tones = {
    brand: 'bg-brand-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
  }
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      <motion.div
        className={`h-full rounded-full ${tones[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
