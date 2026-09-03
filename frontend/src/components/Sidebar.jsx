import { NavLink, useNavigate } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { initials } from '../utils/formatters'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/opportunities', label: 'Opportunities', icon: '◎' },
  { to: '/courses', label: 'Courses', icon: '▤' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const items = isAdmin ? [...NAV_ITEMS, { to: '/admin', label: 'Admin', icon: '⬡' }] : NAV_ITEMS

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex dark:border-slate-800 dark:bg-slate-900">
      <div className="px-2 py-2">
        <Logo />
      </div>

      <nav className="mt-6 flex-1 space-y-1" aria-label="Dashboard">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkCls} end={item.to === '/dashboard'}>
            <span aria-hidden="true" className="w-5 text-center">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-200"
            aria-hidden="true"
          >
            {initials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={signOut}>
          Log out
        </Button>
      </div>
    </aside>
  )
}

export function MobileTabBar() {
  const { isAdmin } = useAuth()
  const items = isAdmin ? [...NAV_ITEMS, { to: '/admin', label: 'Admin', icon: '⬡' }] : NAV_ITEMS
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95"
      aria-label="Dashboard mobile"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <span aria-hidden="true" className="text-base leading-none">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
