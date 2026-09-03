import { Component, Suspense, lazy, useMemo } from 'react'

const HeroScene = lazy(() => import('./HeroScene'))

function StaticFallback() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden">
      <div className="absolute -left-16 bottom-[-10%] h-80 w-80 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-400/10" />
      <div className="absolute right-[-6%] top-[-12%] h-96 w-96 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-400/10" />
      <div className="absolute left-[45%] top-[35%] h-48 w-48 rounded-full bg-pink-400/15 blur-3xl" />
      <div className="absolute bottom-[16%] left-[-5%] h-[55%] w-[110%] -rotate-[18deg] rounded-full bg-gradient-to-r from-brand-400/30 via-violet-400/30 to-pink-400/30 blur-xl" />
      <div className="absolute bottom-[14%] left-[6%] h-9 w-32 -rotate-[10deg] rounded-2xl bg-gradient-to-r from-brand-400/70 to-teal-300/60 blur-[2px] shadow-lift" />
      <div className="absolute bottom-[32%] left-[28%] h-9 w-32 -rotate-[10deg] rounded-2xl bg-gradient-to-r from-teal-400/70 to-violet-400/60 blur-[2px] shadow-lift" />
      <div className="absolute bottom-[50%] left-[50%] h-9 w-28 -rotate-[10deg] rounded-2xl bg-gradient-to-r from-violet-400/70 to-pink-400/60 blur-[2px] shadow-lift" />
      <div className="absolute bottom-[68%] left-[72%] h-8 w-24 -rotate-[10deg] rounded-2xl bg-gradient-to-r from-pink-400/70 to-pink-300/60 blur-[2px] shadow-lift" />
      <div className="absolute bottom-[24%] left-[22%] h-2.5 w-2.5 rounded-full bg-teal-300 blur-[1px]" />
      <div className="absolute bottom-[42%] left-[45%] h-2.5 w-2.5 rounded-full bg-rose-300 blur-[1px]" />
      <div className="absolute bottom-[60%] left-[66%] h-2.5 w-2.5 rounded-full bg-teal-200 blur-[1px]" />
      <div className="absolute right-[16%] top-[18%] h-12 w-12 rounded-full bg-gradient-to-br from-pink-400/80 to-violet-400/70 blur-[1px] shadow-lift" />
      <div className="absolute left-[14%] top-[16%] h-9 w-9 rotate-12 rounded-xl bg-gradient-to-br from-teal-300/80 to-brand-400/70 blur-[1px] shadow-lift" />
    </div>
  )
}

function GlowBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl dark:bg-brand-400/15" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-400/15" />
      <div className="absolute left-[55%] top-[30%] h-40 w-40 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-400/10" />
    </div>
  )
}

class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('Hero 3D scene failed to render, using static fallback', error)
  }

  render() {
    if (this.state.failed) return <StaticFallback />
    return this.props.children
  }
}

function detectTier() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static'
  if (window.matchMedia('(max-width: 768px)').matches) return 'static'
  if ((navigator.hardwareConcurrency || 8) <= 2) return 'static'
  if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet'
  return 'desktop'
}

export default function Hero3D() {
  const tier = useMemo(detectTier, [])

  if (tier === 'static') return <StaticFallback />

  return (
    <div className="relative h-full w-full">
      <GlowBackdrop />
      <div className="absolute inset-0">
        <SceneErrorBoundary>
          <Suspense fallback={<StaticFallback />}>
            <HeroScene tier={tier} />
          </Suspense>
        </SceneErrorBoundary>
      </div>
    </div>
  )
}
