import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiErrorMessage from '../utils/apiError'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { parseSkillInput, profileSchema } from '../utils/validators'
import { initials } from '../utils/formatters'
import Button from '../components/Button'
import Card from '../components/Card'
import Field from '../components/Field'
import PageHeader from '../components/PageHeader'
import SkillTag from '../components/SkillTag'
import SkillsInputModal from '../components/SkillsInputModal'

export default function Profile() {
  const { user, skills, updateProfile } = useAuth()
  const toast = useToast()
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update profile'))
    }
  }

  const addSkill = async (e) => {
    e.preventDefault()
    const added = parseSkillInput(newSkill)
    if (!added.length) return
    try {
      await updateProfile({ skills: [...new Set([...skills, ...added])] })
      setNewSkill('')
      toast.success(`Added ${added.join(', ')}`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update skills'))
    }
  }

  const removeSkill = async (name) => {
    try {
      await updateProfile({ skills: skills.filter((s) => s !== name) })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove skill'))
    }
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your identity and skill set." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <span
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-200"
            aria-hidden="true"
          >
            {initials(user?.name)}
          </span>
          <h2 className="mt-4 text-lg font-bold">{user?.name}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-300">
            {user?.role}
          </p>

          <div className="mt-6 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Skills ({skills.length})</h3>
              <button
                type="button"
                onClick={() => setSkillModalOpen(true)}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Bulk edit / resume
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.length === 0 && (
                <p className="text-sm text-slate-400">No skills yet.</p>
              )}
              {skills.map((s) => (
                <SkillTag key={s} name={s} tone="brand" onRemove={() => removeSkill(s)} />
              ))}
            </div>
            <form className="mt-4 flex gap-2" onSubmit={addSkill}>
              <input
                className="input"
                placeholder="Add a skill…"
                aria-label="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="md">
                Add
              </Button>
            </form>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Edit details</h2>
          <form className="mt-5 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Full name" name="name" error={errors.name?.message}>
              <input id="name" className="input" {...register('name')} />
            </Field>
            <Field label="Location" name="location" error={errors.location?.message}>
              <input id="location" className="input" placeholder="City, Country" {...register('location')} />
            </Field>
            <Field label="Bio" name="bio" error={errors.bio?.message}>
              <textarea
                id="bio"
                className="input min-h-28 resize-y"
                placeholder="Tell the world what you do…"
                {...register('bio')}
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <SkillsInputModal open={skillModalOpen} onClose={() => setSkillModalOpen(false)} />
    </>
  )
}
