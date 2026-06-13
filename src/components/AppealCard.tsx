import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AppealWithDetail } from '../types/db'

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'PENDING', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  approved: { label: 'APPROVED', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.3)' },
  rejected: { label: 'REJECTED', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)' },
}

interface AppealCardProps {
  appeal: AppealWithDetail
  onApprove?: (appealId: string, reviewerNote: string) => Promise<void>
  onReject?: (appealId: string, reviewerNote: string) => Promise<void>
  reviewerName?: string
}

export default function AppealCard({ appeal, onApprove, onReject, reviewerName }: AppealCardProps) {
  const [reviewerNote, setReviewerNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [expanded, setExpanded] = useState(appeal.status === 'pending')

  const s = STATUS_STYLES[appeal.status] ?? STATUS_STYLES.pending

  const handle = async (action: 'approve' | 'reject') => {
    if (!reviewerNote.trim()) return
    setLoading(action)
    try {
      if (action === 'approve') await onApprove?.(appeal.id, reviewerNote)
      else await onReject?.(appeal.id, reviewerNote)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="panel rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-overlay/30 transition-colors"
      >
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded shrink-0"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        >
          {s.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink font-body truncate">
            <span className="text-ink-muted">Student:</span>{' '}
            {appeal.student_name ?? appeal.student_id.slice(-8)}
          </p>
        </div>
        <span className="text-xs text-ink-dim font-mono shrink-0">
          {new Date(appeal.created_at).toLocaleDateString()}
        </span>
        <span className="text-ink-dim ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-parchment-border/40">
              {/* Transaction reference */}
              {appeal.transaction && (
                <div className="mt-3 mb-3 bg-surface rounded p-3">
                  <p className="text-xs text-ink-dim font-mono mb-1">Referenced Transaction</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-red-400">
                      {appeal.transaction.points}pts
                    </span>
                    <span className="text-xs text-ink-dim">—</span>
                    <span className="text-xs text-ink font-body truncate">
                      {appeal.transaction.reason ?? 'No reason provided'}
                    </span>
                  </div>
                </div>
              )}

              {/* Student reason */}
              <div className="mb-3">
                <p className="text-xs text-ink-dim font-mono mb-1">Student's reason for appeal</p>
                <p className="text-sm text-ink font-body bg-surface rounded p-3">{appeal.reason}</p>
              </div>

              {/* Reviewer note (if resolved) */}
              {appeal.reviewer_note && (
                <div className="mb-3">
                  <p className="text-xs text-ink-dim font-mono mb-1">
                    Reviewer note {appeal.reviewed_by_name && `— ${appeal.reviewed_by_name}`}
                  </p>
                  <p className="text-sm text-ink font-body bg-surface rounded p-3">
                    {appeal.reviewer_note}
                  </p>
                </div>
              )}

              {/* Action area — only for pending */}
              {appeal.status === 'pending' && onApprove && onReject && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="label-field">Reviewer note (required)</label>
                    <textarea
                      className="input-field resize-none text-sm"
                      rows={2}
                      placeholder="Add a note explaining the decision..."
                      value={reviewerNote}
                      onChange={e => setReviewerNote(e.target.value)}
                    />
                  </div>
                  {reviewerName && (
                    <p className="text-xs text-ink-dim font-mono">
                      Acting as: <span className="text-parchment-gold">{reviewerName}</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handle('approve')}
                      disabled={!reviewerNote.trim() || loading !== null}
                      className="flex-1 py-2 rounded text-sm font-body font-semibold transition-colors disabled:opacity-40"
                      style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ade80' }}
                    >
                      {loading === 'approve' ? 'Approving…' : '✓ Approve & Restore Points'}
                    </button>
                    <button
                      onClick={() => handle('reject')}
                      disabled={!reviewerNote.trim() || loading !== null}
                      className="flex-1 py-2 rounded text-sm font-body font-semibold transition-colors disabled:opacity-40"
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                    >
                      {loading === 'reject' ? 'Rejecting…' : '✗ Reject Appeal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
