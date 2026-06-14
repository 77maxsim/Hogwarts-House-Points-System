import type { AntiAbuseFlag } from '../types/db'

const SEVERITY = {
  high:   { label: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.28)',   icon: '▲' },
  medium: { label: 'MEDIUM', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.28)',  icon: '◆' },
  low:    { label: 'LOW',    color: '#93c5fd', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.28)',  icon: '●' },
} as const

interface AbuseFlagProps {
  flag: AntiAbuseFlag & { flagged_user_name?: string }
  compact?: boolean
}

export default function AbuseFlag({ flag, compact }: AbuseFlagProps) {
  const s = SEVERITY[flag.severity] ?? SEVERITY.medium

  return (
    <div
      className="rounded-lg p-3.5 flex gap-3"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold"
        style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}30` }}
      >
        {s.icon}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span
            className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}35` }}
          >
            {s.label} RISK
          </span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ color: '#6b5b3e', background: 'rgba(61,46,24,0.3)', border: '1px solid rgba(61,46,24,0.4)' }}
          >
            {flag.status.toUpperCase()}
          </span>
        </div>

        {/* Reason */}
        <p className="text-sm font-body text-ink leading-snug">{flag.reason}</p>

        {!compact && flag.flagged_user_name && (
          <p className="text-xs font-mono mt-1.5" style={{ color: '#4a3c28' }}>
            Flagged actor: <span className="text-ink-muted">{flag.flagged_user_name}</span>
          </p>
        )}

        <p className="text-xs font-mono mt-1" style={{ color: '#3d2e18' }}>
          {new Date(flag.created_at).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
