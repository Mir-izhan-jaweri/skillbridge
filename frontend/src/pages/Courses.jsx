import { useState } from 'react'
import api, { apiErrorMessage } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import Card from '../components/Card'
import CourseCard from '../components/CourseCard'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { CardSkeleton } from '../components/Skeleton'
import Button from '../components/Button'

export default function Courses() {
  const { analysis, hasSkills } = useAuth()
  const [search, setSearch] = useState('')

  const { data, loading, error, refetch } = useFetch(async () => {
    const res = await api.get('/courses')
    return res.data.courses
  }, [])

  const gapSkills = new Set((analysis?.gaps || []).map((g) => g.skill))
  const recommended = (data || []).filter((c) => gapSkills.has(c.skill))

  const visible = (data || []).filter((c) =>
    c.title.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <>
      <PageHeader
        title="Courses"
        subtitle="Level up the exact skills the market is asking for."
      />

      {hasSkills && recommended.length > 0 && (
        <Card className="mb-8 border-violet-200 bg-violet-50/60 p-6 dark:border-violet-900 dark:bg-violet-950/40">
          <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
            Recommended for your skill gaps
          </h2>
          <p className="mt-1 text-sm text-violet-700/80 dark:text-violet-300/80">
            Based on what your top-matched opportunities require.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Card>
      )}

      <div className="mb-6">
        <input
          type="search"
          className="input max-w-md"
          placeholder="Search courses…"
          aria-label="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load courses"
          message={apiErrorMessage(error)}
          action={<Button variant="secondary" onClick={refetch}>Try again</Button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState icon="📚" title="No courses found" message="Try a different search term." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  )
}
