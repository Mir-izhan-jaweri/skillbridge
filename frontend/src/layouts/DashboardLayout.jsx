import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar, { MobileTabBar } from '../components/Sidebar'

export default function DashboardLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:ml-64 lg:pb-8">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <MobileTabBar />
    </div>
  )
}
