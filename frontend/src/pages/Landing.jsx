import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import Card from '../components/Card'
import Hero3D from '../components/Hero3D'
import Navbar from '../components/Navbar'
import SkillTag from '../components/SkillTag'
import { scoreColor } from '../utils/formatters'

const STEPS = [
  {
    icon: '⌨️',
    title: 'Share your skills',
    text: 'Type them in or upload your resume — our AI parses and structures them instantly.',
  },
  {
    icon: '🎯',
    title: 'Get matched',
    text: 'Receive ranked freelance and job opportunities with a match score for each one.',
  },
  {
    icon: '📈',
    title: 'Close the gap',
    text: 'See exactly which skills to learn next, with course picks and live demand data.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'SkillBridge told me SQL was my missing piece. Two weeks later I landed my first data gig.',
    name: 'Omar R.',
    role: 'Aspiring data analyst',
  },
  {
    quote: 'The match scores are scary accurate. It felt like a recruiter who actually read my resume.',
    name: 'Fatima S.',
    role: 'Frontend developer',
  },
  {
    quote: 'I went from zero direction to a concrete learning plan in one sitting.',
    name: 'Daniyal A.',
    role: 'CS student',
  },
]

function OpportunityPreview({ opp }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{opp.title}</h3>
        {typeof opp.match_score === 'number' && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor(opp.match_score)}`}>
            {opp.match_score}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {opp.source} · {opp.type === 'job' ? 'Job' : 'Freelance'}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {opp.required_skills.slice(0, 4).map((s) => (
          <SkillTag key={s} name={s} />
        ))}
      </div>
    </Card>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    api
      .get('/opportunities')
      .then((res) => setPreviews(res.data.opportunities.slice(0, 3)))
      .catch(() => setPreviews([]))
  }, [])

  const primaryCta = () => navigate(user ? '/dashboard' : '/signup')

  return (
    <div className="overflow-x-clip">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center pt-16">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute right-[-10%] top-[-10%] h-[32rem] w-[32rem] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/30" />
          <div className="absolute bottom-[-15%] left-[-5%] h-[28rem] w-[28rem] rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/20" />
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Hero3D />
        </motion.div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-10 -inset-y-8 bg-gradient-to-br from-white/75 via-white/40 to-transparent dark:from-slate-950/75 dark:via-slate-950/45 dark:to-transparent"
            />
            <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              AI-powered career matchmaking
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Turn your skills into {' '}
              <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-violet-600 bg-clip-text text-transparent dark:from-brand-300 dark:via-teal-200 dark:to-violet-300">
                Real opportunities 
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Tell SkillBridge what you can do. Get matched freelance and job opportunities, a
              personalized skill-gap plan, and live market demand insights — in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={primaryCta}>
                {user ? 'Go to dashboard' : 'Get started free'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/opportunities')}>
                Browse opportunities
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              No credit card · Resume upload optional · AI-guided
            </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Three steps between you and your next opportunity.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full p-6 text-center transition-shadow hover:shadow-lift">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl dark:bg-brand-900/50" aria-hidden="true">
                  {step.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold">
                  <span className="mr-1.5 text-brand-600 dark:text-brand-400">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Opportunity preview */}
      <section id="opportunities" className="bg-white py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Live opportunities</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                A taste of what's waiting — sign in to see your match scores.
              </p>
            </div>
            <Link
              to={user ? '/opportunities' : '/signup'}
              className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              See all →
            </Link>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {previews.length === 0 && (
              <p className="text-sm text-slate-400">
                Opportunities are loading — or the API is offline. Sign up to explore.
              </p>
            )}
            {previews.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <OpportunityPreview opp={opp} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + testimonials */}
      <section id="why-us" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['14+', 'live opportunities tracked'],
            ['22', 'in-demand skills analyzed'],
            ['<60s', 'from signup to first match'],
          ].map(([value, label]) => (
            <Card key={label} className="p-6 text-center">
              <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </Card>
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="h-full p-6">
                <blockquote className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-slate-400"> · {t.role}</span>
                </figcaption>
              </Card>
            </motion.figure>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-violet-700 p-10 text-center text-white sm:p-14"
        >
          <h2 className="text-3xl font-bold">Ready to bridge the gap?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Join free, add your skills, and see where the market wants you.
          </p>
          <Button size="lg" variant="light" className="mt-6" onClick={primaryCta}>
            {user ? 'Open dashboard' : 'Create free account'}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-400 sm:flex-row sm:px-6">
          <p>© 2026 SkillBridge · Alibaba Cloud AI Hackathon</p>
          <p>Bano Qabil · Alkhidmat Foundation</p>
        </div>
      </footer>
    </div>
  )
}
