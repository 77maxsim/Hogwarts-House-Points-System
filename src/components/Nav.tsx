import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Great Hall' },
  { to: '/points-entry', label: 'Points Entry' },
  { to: '/audit-appeals', label: 'Audit & Appeals' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-parchment-border/60 bg-parchment/95 backdrop-blur-sm"
      style={{ background: 'rgba(10,8,3,0.95)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-8 h-14">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-parchment-gold text-xl" aria-hidden>⚡</span>
          <span className="font-display text-parchment-gold font-semibold text-lg tracking-wide">
            Hogwarts
          </span>
          <span className="text-ink-dim text-xs font-mono uppercase tracking-widest hidden sm:block">
            House Points
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-body font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-parchment-gold/15 text-parchment-gold border border-parchment-gold/30'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Year badge */}
        <span className="hidden md:block text-xs font-mono text-ink-dim border border-parchment-border rounded px-2 py-1">
          2025–2026
        </span>
      </div>
    </header>
  )
}
