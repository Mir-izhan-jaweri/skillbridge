import { useState } from 'react'
import { motion } from 'framer-motion'
import api, { apiErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'
import Button from './Button'
import Card from './Card'
import SkillTag from './SkillTag'

export default function CourseCard({ course }) {
  const toast = useToast()
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(course.enrolled)

  const enroll = async () => {
    setEnrolling(true)
    try {
      await api.post(`/courses/${course.id}/enroll`)
      setEnrolled(true)
      toast.success(`Enrolled in "${course.title}"`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not enroll'))
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
            {course.provider}
          </span>
          <span className="text-xs text-slate-400">{course.duration}</span>
        </div>
        <h3 className="mt-3 font-semibold leading-snug">{course.title}</h3>
        <div className="mt-2 flex-1">
          {course.skill && <SkillTag name={course.skill} tone="violet" />}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {enrolled ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
              Enrolled
            </span>
          ) : (
            <Button size="sm" onClick={enroll} loading={enrolling}>
              Enroll
            </Button>
          )}
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-500 underline-offset-2 transition hover:text-brand-600 hover:underline dark:text-slate-400"
            >
              Details ↗
            </a>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
