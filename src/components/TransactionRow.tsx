import type { PublicMovement } from '../types/db'
import { getHouseTheme } from '../lib/houseTheme'
import type { HouseSlug } from '../types/db'

const TX_TYPE: Record<string, { abbr: string; color: string }> = {
  award:      { abbr: '+',  color: '#4ade80' },
  deduction:  { abbr: '−',  color: '#f87171' },
  correction: { abbr: '↺', color: '#93c5fd' },
}

interface TransactionRowProps {
  tx: PublicMovement
  showDetails?: boolean
}

export default function TransactionRow({ tx, showDetails }: TransactionRowProps) {
  const theme = getHouseTheme(tx.house_slug as HouseSlug)
  const isPositive = tx.points > 0
  const typeInfo = TX_TYPE[tx.transaction_type] ?? TX_TYPE.award

  return (
    <div className="ledger-row group">
      {/* House color stripe */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: theme.text, opacity: 0.6 }}
      />

      {/* House + reason */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-sm font-medium" style={{ color: theme.text }}>
            {tx.house_name}
          </span>
          {tx.transaction_type === 'correction' && (
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ color: '#93c5fd', background: 'rgba(147,197,253,0.10)', border: '1px solid rgba(147,197,253,0.25)' }}
            >
              CORRECTION
            </span>
          )}
        </div>
        {showDetails && tx.reason && (
          <p className="text-xs font-body mt-0.5 truncate" style={{ color: '#6b5b3e' }}>
            {tx.reason}
          </p>
        )}
      </div>

      {/* Time */}
      <span className="text-xs font-mono shrink-0" style={{ color: '#4a3c28' }}>
        {new Date(tx.effective_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>

      {/* Points */}
      <span
        className="font-mono text-sm font-semibold w-14 text-right shrink-0"
        style={{ color: isPositive ? '#4ade80' : '#f87171' }}
      >
        {typeInfo.abbr}{Math.abs(tx.points)}
      </span>
    </div>
  )
}
