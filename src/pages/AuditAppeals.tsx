import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppealCard from '../components/AppealCard'
import AbuseFlag from '../components/AbuseFlag'
import type {
  PointTransaction, Appeal, AntiAbuseFlag, User, House, AppealWithDetail,
} from '../types/db'

// Demo reviewer — actual IDs from the DB
const HEAD_WREN_ID = '00000000-0000-0000-0000-000000000206'
const HEAD_WREN_NAME = 'Head V. Wren'
const STUDENT_ALDRIDGE_ID = '00000000-0000-0000-0000-000000000205'

type TabKey = 'audit' | 'appeals' | 'flags'

// ─── Data hooks ──────────────────────────────────────────────────────────────

function useAuditLog() {
  return useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .limit(50)
      if (error) throw error
      // Sort newest first client-side
      return ((data ?? []) as PointTransaction[]).sort(
        (a, b) => new Date(b.effective_at).getTime() - new Date(a.effective_at).getTime()
      )
    },
    refetchInterval: 10_000,
  })
}

function useHouses() {
  return useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('houses').select('*')
      if (error) throw error
      return (data ?? []) as House[]
    },
  })
}

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      return (data ?? []) as User[]
    },
  })
}

function useAppeals() {
  return useQuery({
    queryKey: ['appeals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appeals')
        .select('*')
      if (error) throw error
      // Sort newest first client-side
      return ((data ?? []) as Appeal[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
    refetchInterval: 10_000,
  })
}

function useFlags() {
  return useQuery({
    queryKey: ['flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anti_abuse_flags')
        .select('*')
      if (error) throw error
      // Sort newest first client-side
      return ((data ?? []) as AntiAbuseFlag[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TX_TYPE_STYLES: Record<string, { label: string; color: string }> = {
  award: { label: 'AWARD', color: '#4ade80' },
  deduction: { label: 'DEDUCT', color: '#f87171' },
  correction: { label: 'CORRECT', color: '#60a5fa' },
}

const HOUSE_COLORS: Record<string, string> = {
  gryffindor: '#ef4444',
  slytherin: '#4ade80',
  ravenclaw: '#60a5fa',
  hufflepuff: '#fcd34d',
}

interface AuditRowProps {
  tx: PointTransaction
  houseName?: string
  houseSlug?: string
  submitterName?: string
  studentName?: string
  onAppeal?: (txId: string, studentId: string | null) => void
  hasExistingAppeal?: boolean
}

function AuditEntry({ tx, houseName, houseSlug, submitterName, studentName, onAppeal, hasExistingAppeal }: AuditRowProps) {
  const t = TX_TYPE_STYLES[tx.transaction_type] ?? { label: tx.transaction_type.toUpperCase(), color: '#a89060' }
  const houseColor = houseSlug ? HOUSE_COLORS[houseSlug] ?? '#c9a84c' : '#c9a84c'
  const isPositive = tx.points > 0

  return (
    <div className="flex items-start gap-3 py-3 border-b border-parchment-border/30 last:border-0 group">
      {/* Type badge */}
      <span
        className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded mt-0.5 shrink-0 w-16 text-center"
        style={{ color: t.color, background: `${t.color}15`, border: `1px solid ${t.color}30` }}
      >
        {t.label}
      </span>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-sm font-medium" style={{ color: houseColor }}>
            {houseName ?? tx.house_id.slice(-8)}
          </span>
          {studentName && (
            <span className="text-xs text-ink-dim font-body">· {studentName}</span>
          )}
        </div>
        <p className="text-xs text-ink-muted font-body mt-0.5 line-clamp-2">{tx.reason}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-ink-dim font-mono">
            {submitterName ?? tx.submitted_by.slice(-8)}
          </span>
          <span className="text-ink-dim">·</span>
          <span className="text-xs text-ink-dim font-mono">
            {new Date(tx.effective_at).toLocaleString([], {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span className="text-xs font-mono text-ink-dim/60">
            {tx.id.slice(-8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Points + appeal */}
      <div className="text-right shrink-0">
        <span
          className="font-mono text-base font-semibold"
          style={{ color: isPositive ? '#4ade80' : '#f87171' }}
        >
          {isPositive ? '+' : ''}{tx.points}
        </span>

        {/* Appeal button — only for deductions with a student */}
        {tx.transaction_type === 'deduction' && tx.student_id && onAppeal && (
          <div className="mt-1">
            {hasExistingAppeal ? (
              <span className="text-xs font-mono text-parchment-gold-dim">Appealed</span>
            ) : (
              <button
                onClick={() => onAppeal(tx.id, tx.student_id)}
                className="text-xs font-mono text-parchment-gold hover:text-parchment-gold-bright transition-colors opacity-0 group-hover:opacity-100"
              >
                Appeal →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appeal submission modal ─────────────────────────────────────────────────

interface AppealModalProps {
  txId: string
  studentId: string | null
  onClose: () => void
  onSubmit: (txId: string, studentId: string, reason: string) => Promise<void>
}

function AppealModal({ txId, studentId, onClose, onSubmit }: AppealModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Default to M. Aldridge if no student_id
  const effectiveStudentId = studentId ?? STUDENT_ALDRIDGE_ID

  const handle = async () => {
    if (!reason.trim()) return
    setLoading(true)
    setError('')
    try {
      await onSubmit(txId, effectiveStudentId, reason)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit appeal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="panel rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-ink font-semibold">Submit Appeal</h2>
            <p className="text-xs font-mono text-ink-dim mt-1">
              Transaction: {txId.slice(-12).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-dim hover:text-ink text-xl">×</button>
        </div>

        <div className="mb-4">
          <label className="label-field">Reason for appeal</label>
          <textarea
            autoFocus
            className="input-field resize-none"
            rows={4}
            placeholder="Explain why this deduction was unfair or incorrect…"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <p className="text-xs text-ink-dim font-mono mb-4">
          Submitting as student: <span className="text-ink">M. Aldridge</span>
        </p>

        {error && (
          <p className="text-sm text-red-400 font-mono mb-3">Error: {error}</p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handle}
            disabled={!reason.trim() || loading}
            className="btn-gold flex-1"
          >
            {loading ? 'Submitting…' : 'Submit Appeal'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuditAppeals() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabKey>('audit')
  const [appealModal, setAppealModal] = useState<{ txId: string; studentId: string | null } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const auditLog = useAuditLog()
  const houses = useHouses()
  const users = useUsers()
  const appeals = useAppeals()
  const flags = useFlags()

  // Build lookup maps
  const houseMap = Object.fromEntries(houses.data?.map(h => [h.id, h]) ?? [])
  const userMap = Object.fromEntries(users.data?.map(u => [u.id, u]) ?? [])

  // Set of appealed transaction IDs
  const appealedTxIds = new Set(appeals.data?.map(a => a.transaction_id) ?? [])

  // Enrich appeals
  const enrichedAppeals: AppealWithDetail[] = (appeals.data ?? []).map(a => ({
    ...a,
    student_name: userMap[a.student_id]?.full_name,
    reviewed_by_name: a.reviewed_by ? userMap[a.reviewed_by]?.full_name : undefined,
    transaction: auditLog.data?.find(t => t.id === a.transaction_id)
      ? {
          ...auditLog.data.find(t => t.id === a.transaction_id),
          house_name: houseMap[auditLog.data.find(t => t.id === a.transaction_id)?.house_id ?? '']?.name,
        }
      : undefined,
  }))

  // Enrich flags
  const enrichedFlags = (flags.data ?? []).map(f => ({
    ...f,
    flagged_user_name: userMap[f.flagged_user_id]?.full_name ?? f.flagged_user_id.slice(-8),
  }))

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreateAppeal = async (txId: string, studentId: string, reason: string) => {
    const { error } = await supabase.rpc('create_student_appeal', {
      transaction_id: txId,
      student_id: studentId,
      reason,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    showToast('Appeal submitted successfully')
  }

  const handleApprove = async (appealId: string, reviewerNote: string) => {
    const { error } = await supabase.rpc('approve_appeal_and_create_correction', {
      appeal_id: appealId,
      reviewed_by: HEAD_WREN_ID,
      reviewer_note: reviewerNote,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    await qc.invalidateQueries({ queryKey: ['audit_log'] })
    await qc.invalidateQueries({ queryKey: ['standings'] })
    await qc.invalidateQueries({ queryKey: ['banner'] })
    await qc.invalidateQueries({ queryKey: ['movements'] })
    showToast('Appeal approved — correction transaction created')
  }

  const handleReject = async (appealId: string, reviewerNote: string) => {
    const { error } = await supabase.rpc('reject_appeal', {
      appeal_id: appealId,
      reviewed_by: HEAD_WREN_ID,
      reviewer_note: reviewerNote,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    showToast('Appeal rejected')
  }

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: 'audit', label: 'Audit Log', count: auditLog.data?.length },
    { key: 'appeals', label: 'Appeals', count: enrichedAppeals.filter(a => a.status === 'pending').length },
    { key: 'flags', label: 'Anti-Abuse Flags', count: enrichedFlags.filter(f => f.status === 'open').length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-raised border border-parchment-gold/30 rounded-xl px-5 py-3 shadow-gold-glow"
          >
            <p className="text-sm font-body text-ink">✓ {toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appeal modal */}
      <AnimatePresence>
        {appealModal && (
          <AppealModal
            txId={appealModal.txId}
            studentId={appealModal.studentId}
            onClose={() => setAppealModal(null)}
            onSubmit={handleCreateAppeal}
          />
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-[0.25em] mb-2">
          Staff Portal
        </p>
        <h1 className="font-display text-4xl text-parchment-gold font-semibold">
          Audit & Appeals
        </h1>
        <div className="mt-3 h-px bg-gradient-to-r from-parchment-gold/40 via-parchment-gold/20 to-transparent" />
        <p className="text-xs text-ink-dim font-mono mt-2">
          Immutable transaction log · Appeal queue · Anti-abuse monitoring
        </p>
      </motion.div>

      {/* Reviewer identity note */}
      <div className="mb-6 inline-flex items-center gap-3 panel rounded-lg px-4 py-2.5">
        <span className="text-parchment-gold text-sm">👤</span>
        <div>
          <span className="text-xs text-ink-dim font-mono">Reviewing as:</span>{' '}
          <span className="text-sm text-ink font-body font-medium">{HEAD_WREN_NAME}</span>{' '}
          <span className="text-xs text-ink-dim font-mono">(Head of House · Gryffindor)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-parchment-border/40">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-body font-medium transition-colors relative ${
              tab === t.key
                ? 'text-parchment-gold'
                : 'text-ink-dim hover:text-ink-muted'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded"
                style={tab === t.key
                  ? { background: 'rgba(201,168,76,0.2)', color: '#c9a84c' }
                  : { background: 'rgba(61,46,24,0.5)', color: '#6b5b3e' }
                }
              >
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-parchment-gold"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {tab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink font-medium">Transaction Log</h2>
                <div className="flex items-center gap-2">
                  {auditLog.isFetching && (
                    <span className="text-xs font-mono text-ink-dim animate-pulse">↻ Refreshing</span>
                  )}
                  <span className="text-xs font-mono text-ink-dim border border-parchment-border/50 rounded px-2 py-0.5">
                    Immutable
                  </span>
                </div>
              </div>

              {auditLog.isLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-16 bg-surface rounded animate-pulse" />
                  ))}
                </div>
              ) : auditLog.error ? (
                <p className="text-red-400 text-sm font-mono">Could not load audit log</p>
              ) : auditLog.data?.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-8">No transactions recorded yet.</p>
              ) : (
                <div>
                  {auditLog.data?.map(tx => (
                    <AuditEntry
                      key={tx.id}
                      tx={tx}
                      houseName={houseMap[tx.house_id]?.name}
                      houseSlug={houseMap[tx.house_id]?.slug}
                      submitterName={userMap[tx.submitted_by]?.full_name}
                      studentName={tx.student_id ? userMap[tx.student_id]?.full_name : undefined}
                      onAppeal={(txId, sId) => setAppealModal({ txId, studentId: sId })}
                      hasExistingAppeal={appealedTxIds.has(tx.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'appeals' && (
          <motion.div
            key="appeals"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {appeals.isLoading ? (
              <div className="panel rounded-xl p-5 animate-pulse h-32" />
            ) : enrichedAppeals.length === 0 ? (
              <div className="panel rounded-xl p-8 text-center">
                <p className="text-ink-dim font-body text-sm">No appeals submitted yet.</p>
                <p className="text-xs text-ink-dim font-mono mt-1">
                  Appeals appear here when students contest a deduction.
                </p>
              </div>
            ) : (
              enrichedAppeals.map(a => (
                <AppealCard
                  key={a.id}
                  appeal={a}
                  onApprove={a.status === 'pending' ? handleApprove : undefined}
                  onReject={a.status === 'pending' ? handleReject : undefined}
                  reviewerName={HEAD_WREN_NAME}
                />
              ))
            )}
          </motion.div>
        )}

        {tab === 'flags' && (
          <motion.div
            key="flags"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink font-medium">Anti-Abuse Flags</h2>
                <span className="text-xs font-mono text-ink-dim">System-generated · Requires review</span>
              </div>

              {flags.isLoading ? (
                <div className="animate-pulse h-24 bg-surface rounded" />
              ) : enrichedFlags.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-6">No flags raised.</p>
              ) : (
                <div className="space-y-3">
                  {enrichedFlags.map(f => (
                    <AbuseFlag key={f.id} flag={f} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
