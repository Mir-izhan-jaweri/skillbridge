import { useMemo, useState } from 'react'
import api, { apiErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import OpportunityCard from '../components/OpportunityCard'
import PageHeader from '../components/PageHeader'
import { ListSkeleton } from '../components/Skeleton'
import SkillsInputModal from '../components/SkillsInputModal'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'job', label: 'Jobs' },
]

export default function Opportunities() {
  const { hasSkills } = useAuth()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [skillModalOpen, setSkillModalOpen] = useState(false)

  const { data, loading, error, refetch } = useFetch(async () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (search.trim()) params.set('search', search.trim())
    const res = await api.get(`/opportunities?${params}`)
    return res.data.opportunities
  }, [type])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.required_skills.some((s) => s.toLowerCase().includes(q)),
    )
  }, [data, search])

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle={
          hasSkills
            ? 'Ranked by your match score — save the ones worth pursuing.'
            : 'Add your skills to unlock personalized match scores.'
        }
        action={
          !hasSkills && (
            <Button onClick={() => setSkillModalOpen(true)}>Add skills for matches</Button>
          )
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            className="input pl-10"
            placeholder="Search by title, skill, or keyword…"
            aria-label="Search opportunities"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter by type">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setType(f.key)}
              aria-pressed={type === f.key}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                type === f.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load opportunities"
          message={apiErrorMessage(error)}
          action={<Button variant="secondary" onClick={refetch}>Try again</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No opportunities found"
          message="Try a different search or filter — new listings are added regularly."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      <SkillsInputModal open={skillModalOpen} onClose={() => setSkillModalOpen(false)} />
    </>
  )
}
