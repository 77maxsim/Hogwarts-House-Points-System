import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AppealWithDetail } from '../types/db'

const STATUS_STYLES = {
  pending:  { label: 'PENDING',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.30)' },
  approved: { label: 'APPROVED', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.30)' },
  rejected: { label: 'REJECTED', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.30)' },
} as const

interface AppealCardProps {
  appeal: AppealWithDetail
  onApprove?: (appealId: string, reviewerNote: string) => Promise<void>
  onReject?:  (appealId: string, reviewerNote: string) => Promise<void>
  onEscalate?:(appealId: string) => Promise<void>
  reviewerName?: string
}

export default function AppealCard({ appeal, onApprove, onReject, onEscalate, reviewerName }: AppealCardProps) {
  const [reviewerNote, setReviewerNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'escalate' | null>(null)
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

  const handleEscalate = async () => {
    setLoading('escalate')
    try { await onEscalate?.(appeal.id) } finally { setLoading(null) }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(20,14,5,0.80)', border: `1px solid ${s.border}` }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ borderBottom: expanded ? `1px solid rgba(61,46,24,0.35)` : undefined }}
      >
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded shrink-0"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        >
          {s.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink font-body truncate">
            <span className="text-ink-muted">Student: </span>
            {appeal.student_name ?? appeal.student_id.slice(-8)}
          </p>
          {appeal.transaction && (
            <p className="text-xs font-mono mt-0.5 truncate" style={{ color: '#4a3c28' }}>
              Re: {appeal.transaction.reason ?? 'Transaction ' + (appeal.transaction.id ?? '').slice(-8).toUpperCase()}
            </p>
          )}
        </div>
        <span className="text-xs font-mono shrink-0" style={{ color: '#4a3c28' }}>
          {new Date(appeal.created_at).toLocaleDateString('en-GB')}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', color: '#4a3c28' }}
        >
          <path d="M2 5 L7 9 L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">
              {/* Appeal lifecycle */}
              <div className="flex items-start gap-2">
                {/* Lifecycle step dots */}
                <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
                  <div className="w-px flex-1 min-h-[20px]" style={{ background: 'rgba(61,46,24,0.5)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
                  {(appeal.status !== 'pending') && (
                    <>
                      <div className="w-px flex-1 min-h-[20px]" style={{ background: 'rgba(61,46,24,0.5)' }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: appeal.status === 'approved' ? '#4ade80' : '#f87171' }} />
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Step 1: Original transaction */}
                  {appeal.transaction && (
                    <div
                      className="rounded-lg p-3"
                      style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}
                    >
                      <p className="text-xs font-mono mb-1" style={{ color: '#8b3333' }}>Original Deduction</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold" style={{ color: '#f87171' }}>
                          {appeal.transaction.points}pts
                        </span>
                        <span className="text-xs font-body text-ink-muted truncate">
                          {appeal.transaction.reason ?? 'No reason on record'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Student's appeal */}
                  <div
                    className="rounded-lg p-3"
                    style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)' }}
                  >
                    <p className="text-xs font-mono mb-1" style={{ color: '#7a5e1a' }}>Student Appeal</p>
                    <p className="text-sm font-body text-ink">{appeal.reason}</p>
                  </div>

                  {/* Step 3: Review decision */}
                  {appeal.reviewer_note && (
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: appeal.status === 'approved' ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
                        border: `1px solid ${appeal.status === 'approved' ? 'rgba(74,222,128,0.20)' : 'rgba(248,113,113,0.20)'}`,
                      }}
                    >
                      <p className="text-xs font-mono mb-1" style={{ color: appeal.status === 'approved' ? '#2d6e45' : '#8b3333' }}>
                        Head of House Decision
                        {appeal.reviewed_by_name && ` · ${appeal.reviewed_by_name}`}
                      </p>
                      <p className="text-sm font-body text-ink">{appeal.reviewer_note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action area — pending only */}
              {appeal.status === 'pending' && (onApprove || onReject || onEscalate) && (
                <div className="pt-2 space-y-3" style={{ borderTop: '1px solid rgba(61,46,24,0.35)' }}>
                  {(onApprove || onReject) && (
                    <div>
                      <label className="label-field">Reviewer note (required to decide)</label>
                      <textarea
                        className="input-field resize-none text-sm"
                        rows={2}
                        placeholder="Add a note explaining the decision…"
                        value={reviewerNote}
                        onChange={e => setReviewerNote(e.target.value)}
                      />
                    </div>
                  )}
                  {reviewerName && (
                    <p className="text-xs font-mono" style={{ color: '#4a3c28' }}>
                      Acting as: <span className="text-parchment-gold">{reviewerName}</span>
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {onApprove && (
                      <button
                        onClick={() => handle('approve')}
                        disabled={!reviewerNote.trim() || loading !== null}
                        className="flex-1 py-2.5 rounded-lg text-sm font-body font-semibold transition-all disabled:opacity-40"
                        style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.30)', color: '#4ade80' }}
                      >
                        {loading === 'approve' ? 'Approving…' : '✓ Approve & Restore Points'}
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => handle('reject')}
                        disabled={!reviewerNote.trim() || loading !== null}
                        className="flex-1 py-2.5 rounded-lg text-sm font-body font-semibold transition-all disabled:opacity-40"
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                      >
                        {loading === 'reject' ? 'Rejecting…' : '✗ Reject Appeal'}
                      </button>
                    )}
                    {onEscalate && (
                      <button
                        onClick={handleEscalate}
                        disabled={loading !== null}
                        className="flex-1 py-2.5 rounded-lg text-sm font-body font-semibold transition-all disabled:opacity-40"
                        style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', color: '#93c5fd' }}
                      >
                        {loading === 'escalate' ? 'Escalating…' : '↑ Escalate to Headmistress'}
                      </button>
                    )}
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
