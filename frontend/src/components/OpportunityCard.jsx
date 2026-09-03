import { useState } from 'react'
import { motion } from 'framer-motion'
import api, { apiErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'
import { scoreColor } from '../utils/formatters'
import Button from './Button'
import Card from './Card'
import SkillTag from './SkillTag'

export default function OpportunityCard({ opportunity, onSaved }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(opportunity.saved)
  const { title, description, type, source, required_skills: requiredSkills, match_score: score } = opportunity

  const save = async () => {
    setSaving(true)
    try {
      await api.post(`/opportunities/${opportunity.id}/save`)
      setSaved(true)
      onSaved?.(opportunity)
      toast.success('Opportunity saved to your list')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save opportunity'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold leading-snug">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {source} · {type === 'job' ? 'Full-time job' : 'Freelance'}
            </p>
          </div>
          {typeof score === 'number' && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${scoreColor(score)}`}
              title="Match score based on your skills"
            >
              {score}% match
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {requiredSkills.map((skill) => (
            <SkillTag key={skill} name={skill} />
          ))}
        </div>

        <div className="mt-4">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
              Saved
            </span>
          ) : (
            <Button variant="secondary" size="sm" onClick={save} loading={saving}>
              Save opportunity
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
