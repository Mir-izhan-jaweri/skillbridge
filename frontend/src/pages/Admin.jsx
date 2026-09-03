import { useState } from 'react'
import api, { apiErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'
import useFetch from '../hooks/useFetch'
import { formatDate } from '../utils/formatters'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Field from '../components/Field'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { ListSkeleton, Skeleton } from '../components/Skeleton'
import StatCard from '../components/StatCard'

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'courses', label: 'Courses' },
]

const OPP_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', options: ['freelance', 'job'], required: true },
  { name: 'source', label: 'Source', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'required_skills', label: 'Required skills (comma-separated)', type: 'text' },
]

const COURSE_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'provider', label: 'Provider', type: 'text' },
  { name: 'skill', label: 'Skill', type: 'text' },
  { name: 'duration', label: 'Duration', type: 'text' },
  { name: 'url', label: 'URL', type: 'text' },
]

function EntityFormModal({ onClose, title, fields, initial, onSubmit, submitting }) {
  const [values, setValues] = useState(() => {
    const next = {}
    fields.forEach((f) => {
      const raw = initial?.[f.name]
      next[f.name] = Array.isArray(raw) ? raw.join(', ') : raw ?? ''
    })
    return next
  })
  const [error, setError] = useState('')

  const submit = async () => {
    for (const f of fields) {
      if (f.required && !String(values[f.name] || '').trim()) {
        setError(`${f.label} is required`)
        return
      }
    }
    const payload = { ...values }
    const skillsField = fields.find((f) => f.name === 'required_skills')
    if (skillsField) {
      payload.required_skills = String(values.required_skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(apiErrorMessage(err, 'Save failed'))
    }
  }

  return (
    <Modal open onClose={onClose} title={title} wide>
      <div className="space-y-4">
        {fields.map((f) => (
          <Field key={f.name} label={f.label} name={f.name}>
            {f.type === 'select' ? (
              <select
                id={f.name}
                className="input"
                value={values[f.name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              >
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                id={f.name}
                className="input min-h-24 resize-y"
                value={values[f.name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            ) : (
              <input
                id={f.name}
                type="text"
                className="input"
                value={values[f.name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            )}
          </Field>
        ))}
        {error && (
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function UsersTab() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [confirmUser, setConfirmUser] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { data, loading, error, refetch } = useFetch(async () => {
    const res = await api.get('/admin/users')
    return res.data.users
  }, [])

  const users = (data || []).filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  const deleteUser = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${confirmUser.id}`)
      toast.success('User deleted')
      setConfirmUser(null)
      refetch()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete user'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <input
        type="search"
        className="input mb-4 max-w-md"
        placeholder="Search users by name or email…"
        aria-label="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <ListSkeleton count={3} />
      ) : error ? (
        <EmptyState icon="⚠️" title="Could not load users" action={<Button onClick={refetch}>Retry</Button>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Skills</th>
                <th className="px-5 py-3.5">Saved</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'admin'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">{u.skills}</td>
                  <td className="px-5 py-3.5 tabular-nums">{u.applications}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {u.role !== 'admin' && (
                      <Button variant="danger" size="sm" onClick={() => setConfirmUser(u)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={Boolean(confirmUser)} onClose={() => setConfirmUser(null)} title="Delete user?">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This permanently removes <strong>{confirmUser?.name}</strong> ({confirmUser?.email}) and
          all their data. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmUser(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser} loading={deleting}>
            Delete user
          </Button>
        </div>
      </Modal>
    </>
  )
}

function AnalyticsTab() {
  const { data, loading } = useFetch(async () => {
    const res = await api.get('/admin/analytics')
    return res.data
  }, [])

  if (loading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={data.totals.users} icon="◉" />
        <StatCard label="Opportunities" value={data.totals.opportunities} icon="◎" accent="text-violet-500" />
        <StatCard label="Courses" value={data.totals.courses} icon="▤" accent="text-violet-500" />
        <StatCard label="Saved opportunities" value={data.totals.applications} icon="★" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold">Signups over time</h3>
          <ul className="mt-4 space-y-2">
            {data.signups_over_time.map((row) => (
              <li key={row.date} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{row.date}</span>
                <span className="font-semibold tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold">Most matched skills</h3>
          <ul className="mt-4 space-y-2">
            {data.most_matched_skills.length === 0 && (
              <li className="text-sm text-slate-400">No applications yet.</li>
            )}
            {data.most_matched_skills.map((row) => (
              <li key={row.skill} className="flex items-center justify-between text-sm">
                <span>{row.skill}</span>
                <span className="font-semibold tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-semibold">Most enrolled courses</h3>
          <ul className="mt-4 space-y-2">
            {data.most_enrolled_courses.length === 0 && (
              <li className="text-sm text-slate-400">No enrollments yet.</li>
            )}
            {data.most_enrolled_courses.map((row) => (
              <li key={row.course} className="flex items-center justify-between text-sm">
                <span className="truncate pr-3">{row.course}</span>
                <span className="font-semibold tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

function ResourceTab({ kind }) {
  const toast = useToast()
  const isOpp = kind === 'opportunities'
  const endpoint = isOpp ? '/admin/opportunities' : '/admin/courses'
  const fields = isOpp ? OPP_FIELDS : COURSE_FIELDS
  const [editing, setEditing] = useState(null) // null = closed, {} = new, {id...} = edit
  const [saving, setSaving] = useState(false)

  const { data, loading, refetch } = useFetch(async () => {
    const res = await api.get(endpoint)
    return res.data[isOpp ? 'opportunities' : 'courses']
  }, [kind])

  const save = async (payload) => {
    setSaving(true)
    try {
      if (editing?.id) {
        await api.put(`${endpoint}/${editing.id}`, payload)
        toast.success('Saved')
      } else {
        await api.post(endpoint, payload)
        toast.success('Created')
      }
      refetch()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    try {
      await api.delete(`${endpoint}/${item.id}`)
      toast.success('Deleted')
      refetch()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Delete failed'))
    }
  }

  if (loading) return <ListSkeleton count={3} />

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({})}>Add {isOpp ? 'opportunity' : 'course'}</Button>
      </div>
      <div className="space-y-3">
        {(data || []).map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="truncate text-xs text-slate-400">
                {isOpp
                  ? `${item.type} · ${item.source} · ${(item.required_skills || []).join(', ')}`
                  : `${item.provider} · ${item.skill || 'no skill'} · ${item.duration}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(item)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => remove(item)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
        {(data || []).length === 0 && (
          <EmptyState icon="📭" title="Nothing here yet" message="Create the first entry." />
        )}
      </div>

      {editing !== null && (
        <EntityFormModal
          key={editing.id ?? 'new'}
          onClose={() => setEditing(null)}
          title={editing.id ? `Edit ${isOpp ? 'opportunity' : 'course'}` : `Add ${isOpp ? 'opportunity' : 'course'}`}
          fields={fields}
          initial={editing.id ? editing : null}
          onSubmit={save}
          submitting={saving}
        />
      )}
    </>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('users')

  return (
    <>
      <PageHeader title="Admin panel" subtitle="Manage users, content, and view platform analytics." />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'opportunities' && <ResourceTab kind="opportunities" />}
      {tab === 'courses' && <ResourceTab kind="courses" />}
    </>
  )
}
