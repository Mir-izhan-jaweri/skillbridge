import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 p-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"
        />
        <Link to="/" className="relative z-10 w-fit rounded-lg">
          <Logo />
        </Link>
        <blockquote className="relative z-10 max-w-md">
          <p className="text-2xl font-semibold leading-relaxed">
            “I typed in my skills and within a minute I had a ranked list of freelance gigs I could
            actually win — plus the one course that closes my biggest gap.”
          </p>
          <footer className="mt-4 text-sm text-brand-200">— Aisha K., freelance designer</footer>
        </blockquote>
        <p className="relative z-10 text-sm text-brand-200/80">
          Built for the Alibaba Cloud AI Hackathon 2026 · Bano Qabil / Alkhidmat Foundation
        </p>
      </div>

      <div className="flex w-full flex-col px-6 py-6 lg:w-1/2">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
