import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiErrorMessage from '../utils/apiError'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { parseSkillInput } from '../utils/validators'
import Button from './Button'
import Modal from './Modal'

export default function SkillsInputModal({ open, onClose, redirectAfter = null }) {
  const { analyzeSkills } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = parseSkillInput(text).length > 0 || file

  const submit = async () => {
    if (!canSubmit) {
      setError('Add at least one skill or upload a resume')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await analyzeSkills({ skills: parseSkillInput(text), resumeFile: file })
      toast.success('Skills analyzed — recommendations updated')
      setText('')
      setFile(null)
      onClose?.()
      if (redirectAfter) navigate(redirectAfter)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not analyze skills'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add your skills" wide>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="skills-text">
            Type your skills (comma-separated)
          </label>
          <textarea
            id="skills-text"
            className="input min-h-24 resize-y"
            placeholder="e.g. Python, SQL, Data Analysis, Figma"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Or upload your resume (PDF)</span>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
          >
            <span>{file ? file.name : 'Choose a PDF or TXT file…'}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">Browse</span>
          </button>
        </div>

        {error && (
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
            Analyze skills
          </Button>
        </div>
      </div>
    </Modal>
  )
}
