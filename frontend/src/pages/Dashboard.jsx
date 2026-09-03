import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import Button from '../components/Button'
import Card from '../components/Card'
import DemandChart from '../components/DemandChart'
import EmptyState from '../components/EmptyState'
import OpportunityCard from '../components/OpportunityCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import SkillTag from '../components/SkillTag'
import SkillsInputModal from '../components/SkillsInputModal'
import { ListSkeleton, Skeleton } from '../components/Skeleton'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const { user, skills, analysis, analyzeSkills } = useAuth()
  const location = useLocation()
  const [skillModalOpen, setSkillModalOpen] = useState(Boolean(location.state?.onboard))
  const [analyzing, setAnalyzing] = useState(false)

  const demand = useFetch(async () => {
    const res = await api.get('/insights/demand')
    return res.data
  }, [])

  // Refresh recommendations when the user has skills but no analysis in memory.
  useEffect(() => {
    if (skills.length > 0 && !analysis && !analyzing) {
      setAnalyzing(true)
      analyzeSkills({ skills }).catch(() => {}).finally(() => setAnalyzing(false))
    }
  }, [skills, analysis, analyzing, analyzeSkills])

  const matches = analysis?.opportunities || []
  const gaps = analysis?.gaps || []
  const topMatch = matches[0]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Here's how your skills are performing in the market."
        action={
          <Button onClick={() => setSkillModalOpen(true)}>
            {skills.length ? 'Update skills' : 'Add your skills'}
          </Button>
        }
      />

      {skills.length === 0 ? (
        <EmptyState
          icon="🧭"
          title="No opportunities yet — add your skills"
          message="Tell SkillBridge what you're good at and get instant matches, gap analysis, and course picks."
          action={<Button onClick={() => setSkillModalOpen(true)}>Add skills now</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Matched opportunities" value={matches.length} icon="◎" />
            <StatCard label="Your skills" value={skills.length} icon="⚡" accent="text-violet-500" />
            <StatCard label="Skill gaps" value={gaps.length} icon="△" accent="text-rose-500" />
            <StatCard
              label="Top match score"
              value={topMatch ? `${topMatch.match_score}%` : '—'}
              icon="★"
            />
          </div>

          {(analyzing || !analysis) && (
            <div className="mt-6">
              <ListSkeleton count={2} />
            </div>
          )}

          {analysis && (
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Top match */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your top match</h2>
                  <Link
                    to="/opportunities"
                    className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    View all →
                  </Link>
                </div>
                {topMatch ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{topMatch.title}</h3>
                        <p className="mt-0.5 text-sm text-slate-400">
                          {topMatch.source} · {topMatch.type === 'job' ? 'Full-time job' : 'Freelance'}
                        </p>
                      </div>
                      <span className="rounded-2xl bg-brand-100 px-4 py-2 text-lg font-extrabold text-brand-700 dark:bg-brand-900/60 dark:text-brand-200">
                        {topMatch.match_score}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      {topMatch.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {topMatch.required_skills.map((s) => (
                        <SkillTag
                          key={s}
                          name={s}
                          tone={skills.includes(s) ? 'brand' : 'rose'}
                        />
                      ))}
                    </div>
                    {analysis.insight?.insight && (
                      <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:bg-violet-950/50 dark:text-violet-200">
                        <strong>{analysis.insight.headline}.</strong> {analysis.insight.insight}
                      </p>
                    )}
                    <div className="mt-4">
                      <Link to="/opportunities">
                        <Button variant="secondary" size="sm">
                          Explore all matches
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    No strong matches yet — try adding more skills.
                  </p>
                )}
              </Card>

              {/* Skill gap panel */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold">Skill gaps</h2>
                <p className="mt-1 text-xs text-slate-400">
                  What your top matches need that you don't have yet.
                </p>
                {gaps.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No gaps detected — great coverage!</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {gaps.slice(0, 5).map((gap) => (
                      <li key={gap.skill}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{gap.skill}</span>
                          {gap.recommended_course && (
                            <Link
                              to="/courses"
                              className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                            >
                              Course →
                            </Link>
                          )}
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar value={100} tone="rose" label={`${gap.skill} gap`} />
                        </div>
                        {gap.recommended_course && (
                          <p className="mt-1 text-xs text-slate-400">
                            {gap.recommended_course.title} · {gap.recommended_course.duration}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {/* Demand chart */}
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Market demand</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Demand index by skill{demand.data?.period ? ` · ${demand.data.period}` : ''}
                </p>
              </div>
            </div>
            {demand.loading ? (
              <div className="mt-5 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : demand.data ? (
              <div className="mt-5">
                <DemandChart stats={demand.data.demand.slice(0, 8)} />
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">Demand data unavailable.</p>
            )}
          </Card>

          {/* More matches */}
          {matches.length > 1 && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold">More matches for you</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {matches.slice(1, 4).map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <SkillsInputModal
        open={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        redirectAfter={skills.length === 0 ? '/dashboard' : null}
      />
    </>
  )
}
