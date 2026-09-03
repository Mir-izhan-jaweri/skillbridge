export default function Logo({ size = 'md' }) {
  const cls = size === 'lg' ? 'h-9 w-9' : 'h-8 w-8'
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg className={cls} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#0d9488" />
        <path
          d="M8 20 L14 14 L18 18 L24 12"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="12" r="2.4" fill="#5eead4" />
      </svg>
      <span className={`font-bold tracking-tight ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>
        Skill<span className="text-brand-600 dark:text-brand-400">Bridge</span>
      </span>
    </span>
  )
}
