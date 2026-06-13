import type { PublicMovement } from '../types/db'

const HOUSE_COLORS: Record<string, string> = {
  gryffindor: '#ef4444',
  slytherin: '#4ade80',
  ravenclaw: '#60a5fa',
  hufflepuff: '#fcd34d',
}

interface TransactionRowProps {
  tx: PublicMovement
  showDetails?: boolean
}

export default function TransactionRow({ tx, showDetails }: TransactionRowProps) {
  const color = HOUSE_COLORS[tx.house_slug] ?? '#c9a84c'
  const isPositive = tx.points > 0
  const isCorrection = tx.transaction_type === 'correction'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-parchment-border/30 last:border-0">
      {/* House color dot */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />

      {/* House + reason */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-body font-medium" style={{ color }}>
            {tx.house_name}
          </span>
          {isCorrection && (
            <span className="text-xs font-mono text-blue-400 border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 rounded">
              CORRECTION
            </span>
          )}
        </div>
        {showDetails && tx.reason && (
          <p className="text-xs text-ink-dim font-body truncate mt-0.5">{tx.reason}</p>
        )}
      </div>

      {/* Time */}
      <span className="text-xs text-ink-dim font-mono shrink-0">
        {new Date(tx.effective_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>

      {/* Points */}
      <span
        className="font-mono text-sm font-medium w-16 text-right shrink-0"
        style={{ color: isPositive ? '#4ade80' : '#f87171' }}
      >
        {isPositive ? '+' : ''}{tx.points}
      </span>
    </div>
  )
}
