import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Great Hall' },
  { to: '/points-entry', label: 'Points Entry' },
  { to: '/audit-appeals', label: 'Audit & Appeals' },
]

function HogwartsMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14 2 L26 7 L26 16 Q26 23 14 27 Q2 23 2 16 L2 7 Z" fill="rgba(201,168,76,0.12)" stroke="#c9a84c" strokeWidth="1.5" />
      <text x="14" y="17" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#c9a84c" textAnchor="middle" dominantBaseline="middle">H</text>
    </svg>
  )
}

export default function Nav() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10,8,3,0.96)',
        borderBottom: '1px solid rgba(61,46,24,0.55)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 1px 0 rgba(201,168,76,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <HogwartsMark />
          <div className="flex flex-col leading-none">
            <span className="font-display text-parchment-gold font-semibold text-base tracking-wide">
              Hogwarts
            </span>
            <span className="text-ink-dim text-[0.6rem] font-mono uppercase tracking-[0.2em] hidden sm:block">
              House Points
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-parchment-border/70 shrink-0 hidden sm:block" />

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 flex-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-parchment-gold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(201,168,76,0.10)',
                border: '1px solid rgba(201,168,76,0.28)',
                boxShadow: '0 0 12px rgba(201,168,76,0.08)',
              } : undefined}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Year badge */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span
            className="text-xs font-mono text-ink-dim px-2 py-1 rounded"
            style={{ border: '1px solid rgba(61,46,24,0.5)', background: 'rgba(30,21,9,0.6)' }}
          >
            2025–2026
          </span>
        </div>
      </div>
    </header>
  )
}
