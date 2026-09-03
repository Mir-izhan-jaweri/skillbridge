import { motion } from 'framer-motion'

export default function DemandChart({ stats = [], max = 100 }) {
  if (!stats.length) return null
  return (
    <div className="space-y-3" role="img" aria-label="Skill demand chart">
      {stats.map((stat, i) => (
        <div key={stat.skill} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
            {stat.skill}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className={`h-full rounded-full ${i < 3 ? 'bg-brand-500' : 'bg-violet-400 dark:bg-violet-500'}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(stat.demand_score / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.04 }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">
            {stat.demand_score}
          </span>
        </div>
      ))}
    </div>
  )
}
