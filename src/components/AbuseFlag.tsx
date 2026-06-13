import type { AntiAbuseFlag } from '../types/db'

const SEVERITY_STYLES: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  high: { label: 'HIGH', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '⚠️' },
  medium: { label: 'MEDIUM', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', icon: '⚡' },
  low: { label: 'LOW', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', icon: 'ℹ️' },
}

interface AbuseFlagProps {
  flag: AntiAbuseFlag & { flagged_user_name?: string }
  compact?: boolean
}

export default function AbuseFlag({ flag, compact }: AbuseFlagProps) {
  const s = SEVERITY_STYLES[flag.severity] ?? SEVERITY_STYLES.medium

  return (
    <div
      className="rounded-lg p-3 flex gap-3"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{ color: s.color, background: `${s.bg}`, border: `1px solid ${s.border}` }}
          >
            {s.label} RISK
          </span>
          <span className="text-xs font-mono text-ink-dim">
            {flag.status.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-ink font-body">{flag.reason}</p>
        {!compact && flag.flagged_user_name && (
          <p className="text-xs text-ink-dim font-body mt-1">
            Flagged actor: <span className="text-ink">{flag.flagged_user_name}</span>
          </p>
        )}
        <p className="text-xs text-ink-dim font-mono mt-1">
          {new Date(flag.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
