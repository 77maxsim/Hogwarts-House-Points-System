import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppealCard from '../components/AppealCard'
import AbuseFlag from '../components/AbuseFlag'
import DemoSwitcher from '../components/DemoSwitcher'
import { useDemoIdentity } from '../contexts/DemoIdentity'
import type {
  PointTransaction, Appeal, AntiAbuseFlag, User, House, AppealWithDetail,
} from '../types/db'

const GRYFFINDOR_ID = '11111111-1111-1111-1111-111111111111'

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useAuditLog() {
  return useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase.from('point_transactions').select('*').limit(100)
      if (error) throw error
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
      const { data, error } = await supabase.from('appeals').select('*')
      if (error) throw error
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
      const { data, error } = await supabase.from('anti_abuse_flags').select('*')
      if (error) throw error
      return ((data ?? []) as AntiAbuseFlag[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },
  })
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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

interface AuditEntryProps {
  tx: PointTransaction
  houseName?: string
  houseSlug?: string
  submitterName?: string
  studentName?: string
  appealButton?: { label: string; onClick: () => void } | 'appealed' | null
}

function AuditEntry({ tx, houseName, houseSlug, submitterName, studentName, appealButton }: AuditEntryProps) {
  const t = TX_TYPE_STYLES[tx.transaction_type] ?? { label: tx.transaction_type.toUpperCase(), color: '#a89060' }
  const houseColor = houseSlug ? HOUSE_COLORS[houseSlug] ?? '#c9a84c' : '#c9a84c'
  const isPositive = tx.points > 0
  return (
    <div className="flex items-start gap-3 py-3 border-b border-parchment-border/30 last:border-0 group">
      <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded mt-0.5 shrink-0 w-16 text-center"
        style={{ color: t.color, background: `${t.color}15`, border: `1px solid ${t.color}30` }}>
        {t.label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-sm font-medium" style={{ color: houseColor }}>
            {houseName ?? tx.house_id.slice(-8)}
          </span>
          {studentName && <span className="text-xs text-ink-dim font-body">· {studentName}</span>}
        </div>
        <p className="text-xs text-ink-muted font-body mt-0.5 line-clamp-2">{tx.reason}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-ink-dim font-mono">{submitterName ?? tx.submitted_by.slice(-8)}</span>
          <span className="text-ink-dim">·</span>
          <span className="text-xs text-ink-dim font-mono">
            {new Date(tx.effective_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs font-mono text-ink-dim/60">{tx.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono text-base font-semibold" style={{ color: isPositive ? '#4ade80' : '#f87171' }}>
          {isPositive ? '+' : ''}{tx.points}
        </span>
        {appealButton && tx.transaction_type === 'deduction' && (
          <div className="mt-1">
            {appealButton === 'appealed' ? (
              <span className="text-xs font-mono text-parchment-gold-dim">Appealed</span>
            ) : (
              <button
                onClick={appealButton.onClick}
                className="text-xs font-mono text-parchment-gold hover:text-parchment-gold-bright transition-colors opacity-0 group-hover:opacity-100"
              >
                {appealButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appeal modal ─────────────────────────────────────────────────────────────

interface AppealModalProps {
  txId: string
  studentId: string
  studentName: string
  onClose: () => void
  onSubmit: (txId: string, studentId: string, reason: string) => Promise<void>
}

function AppealModal({ txId, studentId, studentName, onClose, onSubmit }: AppealModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    if (!reason.trim()) return
    setLoading(true)
    setError('')
    try {
      await onSubmit(txId, studentId, reason)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit appeal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="panel rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-ink font-semibold">Appeal Deduction</h2>
            <p className="text-xs font-mono text-ink-dim mt-1">Transaction: {txId.slice(-12).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-ink-dim hover:text-ink text-xl">×</button>
        </div>
        <div className="mb-4">
          <label className="label-field">Reason for appeal</label>
          <textarea autoFocus className="input-field resize-none" rows={4}
            placeholder="Explain why this deduction was unfair or incorrect…"
            value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <p className="text-xs text-ink-dim font-mono mb-4">
          Submitting as student: <span className="text-ink">{studentName}</span>
        </p>
        {error && <p className="text-sm text-red-400 font-mono mb-3">Error: {error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handle} disabled={!reason.trim() || loading} className="btn-gold flex-1">
            {loading ? 'Submitting…' : 'Submit Appeal'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-raised border border-parchment-gold/30 rounded-xl px-5 py-3 shadow-gold-glow">
      <p className="text-sm font-body text-ink">✓ {msg}</p>
    </motion.div>
  )
}

// ─── Professor restricted view ────────────────────────────────────────────────

function ProfessorRestrictedView() {
  return (
    <div className="panel rounded-xl p-10 text-center">
      <p className="text-4xl mb-4">📋</p>
      <h2 className="font-display text-xl text-ink font-semibold mb-2">
        Full audit access not available in this role
      </h2>
      <p className="text-sm text-ink-dim font-body max-w-sm mx-auto">
        Professors submit transactions but cannot view the full audit log or manage appeals.
        That access is granted to Heads of House and above.
      </p>
      <p className="text-xs text-ink-dim font-mono mt-4">
        Switch to "Head V. Wren" above to view the Gryffindor audit and pending appeals.
      </p>
    </div>
  )
}

// ─── Student view ─────────────────────────────────────────────────────────────

interface StudentViewProps {
  auditLog: PointTransaction[]
  appeals: Appeal[]
  houseMap: Record<string, House>
  userMap: Record<string, User>
  studentId: string
  studentName: string
  onAppeal: (txId: string, studentId: string) => void
  appealedTxIds: Set<string>
  onContinueDemo: () => void
}

function StudentView({ auditLog, appeals, houseMap, userMap, studentId, studentName, onAppeal, appealedTxIds, onContinueDemo }: StudentViewProps) {
  const myTransactions = auditLog.filter(tx => tx.student_id === studentId)
  const myPendingAppeals = appeals.filter(a => a.student_id === studentId && a.status === 'pending')
  const hasAppealPending = myPendingAppeals.length > 0

  return (
    <div className="space-y-4">
      <div className="panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-ink font-medium">My Transactions</h2>
          <span className="text-xs font-mono text-ink-dim border border-parchment-border/50 rounded px-2 py-0.5">Immutable</span>
        </div>

        {myTransactions.length === 0 ? (
          <p className="text-ink-dim text-sm font-body text-center py-8">
            No transactions recorded for your account yet.
          </p>
        ) : (
          <div>
            {myTransactions.map(tx => {
              const house = houseMap[tx.house_id]
              const submitter = userMap[tx.submitted_by]
              const alreadyAppealed = appealedTxIds.has(tx.id)
              return (
                <AuditEntry
                  key={tx.id}
                  tx={tx}
                  houseName={house?.name}
                  houseSlug={house?.slug}
                  submitterName={submitter?.full_name}
                  studentName={studentName}
                  appealButton={
                    tx.transaction_type === 'deduction' && tx.student_id
                      ? alreadyAppealed
                        ? 'appealed'
                        : { label: 'Appeal Deduction', onClick: () => onAppeal(tx.id, tx.student_id!) }
                      : null
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Pending appeal status */}
      {hasAppealPending && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="panel rounded-xl p-5" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.04)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⏳</span>
            <div className="flex-1">
              <h3 className="font-body font-semibold text-amber-300 mb-1">Pending Head of House review</h3>
              <p className="text-sm text-ink-muted font-body">
                Your appeal has been submitted and is awaiting review by your Head of House.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={onContinueDemo} className="btn-gold w-full">
              Continue Demo: Head of House Review →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Head of House view ───────────────────────────────────────────────────────

type HeadTabKey = 'audit' | 'appeals' | 'flags'

interface HeadOfHouseViewProps {
  auditLog: PointTransaction[]
  enrichedAppeals: AppealWithDetail[]
  flags: AntiAbuseFlag[]
  houseMap: Record<string, House>
  userMap: Record<string, User>
  reviewerName: string
  reviewerId: string
  onAppeal: (txId: string, studentId: string | null) => void
  appealedTxIds: Set<string>
  onApprove: (appealId: string, note: string) => Promise<void>
  onReject: (appealId: string, note: string) => Promise<void>
  onEscalate: (appealId: string) => Promise<void>
}

function HeadOfHouseView({
  auditLog, enrichedAppeals, flags, houseMap, userMap,
  reviewerName, onAppeal, appealedTxIds, onApprove, onReject, onEscalate,
}: HeadOfHouseViewProps) {
  const [tab, setTab] = useState<HeadTabKey>('audit')

  const gryffindorAudit = auditLog.filter(tx => tx.house_id === GRYFFINDOR_ID)
  const gryffindorFlags = (flags as (AntiAbuseFlag & { flagged_user_name?: string })[]).filter(
    f => f.house_id === GRYFFINDOR_ID || !f.house_id
  )
  const pendingAppeals = enrichedAppeals.filter(a => {
    const tx = a.transaction
    return !tx || tx.house_id === GRYFFINDOR_ID || a.status === 'pending'
  })

  const TABS: { key: HeadTabKey; label: string; count?: number }[] = [
    { key: 'audit', label: 'Gryffindor Audit', count: gryffindorAudit.length },
    { key: 'appeals', label: 'Appeals', count: pendingAppeals.filter(a => a.status === 'pending').length },
    { key: 'flags', label: 'Anti-Abuse Flags', count: gryffindorFlags.filter(f => f.status === 'open').length },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-parchment-border/40">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-body font-medium transition-colors relative ${tab === t.key ? 'text-parchment-gold' : 'text-ink-dim hover:text-ink-muted'}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded"
                style={tab === t.key
                  ? { background: 'rgba(201,168,76,0.2)', color: '#c9a84c' }
                  : { background: 'rgba(61,46,24,0.5)', color: '#6b5b3e' }}>
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <motion.div layoutId="head-tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-parchment-gold" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'audit' && (
          <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink font-medium">Gryffindor Transactions</h2>
                <span className="text-xs font-mono text-ink-dim border border-parchment-border/50 rounded px-2 py-0.5">Immutable</span>
              </div>
              {gryffindorAudit.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-8">No Gryffindor transactions yet.</p>
              ) : (
                <div>
                  {gryffindorAudit.map(tx => {
                    const house = houseMap[tx.house_id]
                    const hasPendingAppeal = enrichedAppeals.some(a => a.transaction_id === tx.id && a.status === 'pending')
                    return (
                      <AuditEntry
                        key={tx.id}
                        tx={tx}
                        houseName={house?.name}
                        houseSlug={house?.slug}
                        submitterName={userMap[tx.submitted_by]?.full_name}
                        studentName={tx.student_id ? userMap[tx.student_id]?.full_name : undefined}
                        appealButton={
                          tx.transaction_type === 'deduction' && hasPendingAppeal
                            ? { label: 'Review Appeal →', onClick: () => setTab('appeals') }
                            : appealedTxIds.has(tx.id)
                              ? 'appealed'
                              : null
                        }
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'appeals' && (
          <motion.div key="appeals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {pendingAppeals.length === 0 ? (
              <div className="panel rounded-xl p-8 text-center">
                <p className="text-ink-dim font-body text-sm">No appeals for Gryffindor.</p>
              </div>
            ) : (
              pendingAppeals.map(a => (
                <AppealCard
                  key={a.id}
                  appeal={a}
                  onApprove={a.status === 'pending' ? onApprove : undefined}
                  onReject={a.status === 'pending' ? onReject : undefined}
                  onEscalate={a.status === 'pending' ? onEscalate : undefined}
                  reviewerName={reviewerName}
                />
              ))
            )}
          </motion.div>
        )}

        {tab === 'flags' && (
          <motion.div key="flags" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-ink font-medium">Anti-Abuse Flags — Gryffindor</h2>
                <span className="text-xs font-mono text-ink-dim">System-generated · Requires review</span>
              </div>
              {gryffindorFlags.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-6">No flags for Gryffindor.</p>
              ) : (
                <div className="space-y-3">
                  {gryffindorFlags.map(f => <AbuseFlag key={f.id} flag={f} />)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuditAppeals() {
  const qc = useQueryClient()
  const { identity, setPersona } = useDemoIdentity()

  const [appealModal, setAppealModal] = useState<{ txId: string; studentId: string | null } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const auditLog = useAuditLog()
  const houses = useHouses()
  const users = useUsers()
  const appeals = useAppeals()
  const flags = useFlags()

  const houseMap = Object.fromEntries(houses.data?.map(h => [h.id, h]) ?? []) as Record<string, House>
  const userMap = Object.fromEntries(users.data?.map(u => [u.id, u]) ?? []) as Record<string, User>
  const appealedTxIds = new Set(appeals.data?.map(a => a.transaction_id) ?? [])

  const enrichedAppeals: AppealWithDetail[] = (appeals.data ?? []).map(a => ({
    ...a,
    student_name: userMap[a.student_id]?.full_name,
    reviewed_by_name: a.reviewed_by ? userMap[a.reviewed_by]?.full_name : undefined,
    transaction: auditLog.data?.find(t => t.id === a.transaction_id)
      ? {
          ...auditLog.data!.find(t => t.id === a.transaction_id)!,
          house_name: houseMap[auditLog.data!.find(t => t.id === a.transaction_id)!.house_id]?.name,
        }
      : undefined,
  }))

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
      reviewed_by: identity.id,
      reviewer_note: reviewerNote,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    await qc.invalidateQueries({ queryKey: ['audit_log'] })
    await qc.invalidateQueries({ queryKey: ['standings'] })
    await qc.invalidateQueries({ queryKey: ['banner'] })
    await qc.invalidateQueries({ queryKey: ['movements'] })
    showToast('Appeal approved — +20 correction transaction created')
  }

  const handleReject = async (appealId: string, reviewerNote: string) => {
    const { error } = await supabase.rpc('reject_appeal', {
      appeal_id: appealId,
      reviewed_by: identity.id,
      reviewer_note: reviewerNote,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    showToast('Appeal rejected')
  }

  const handleEscalate = async (appealId: string) => {
    showToast(`Appeal ${appealId.slice(-8).toUpperCase()} escalated to Headmistress A. Rowan for review`)
  }

  // Role-specific page header
  const headingMap = {
    professor: { sub: 'Staff Portal', title: 'Audit & Appeals' },
    student:   { sub: 'Student Portal', title: 'My Point Records & Appeals' },
    head:      { sub: 'Staff Portal', title: `Reviewing as ${identity.name} — Head of House, Gryffindor` },
  }
  const heading = headingMap[identity.persona]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AnimatePresence>{toast && <Toast key="toast" msg={toast} />}</AnimatePresence>

      <AnimatePresence>
        {appealModal && (
          <AppealModal
            key="appeal-modal"
            txId={appealModal.txId}
            studentId={appealModal.studentId ?? identity.id}
            studentName={identity.name}
            onClose={() => setAppealModal(null)}
            onSubmit={handleCreateAppeal}
          />
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-[0.25em] mb-2">
          {heading.sub}
        </p>
        <h1 className="font-display text-4xl text-parchment-gold font-semibold leading-tight">
          {heading.title}
        </h1>
        <div className="mt-3 h-px bg-gradient-to-r from-parchment-gold/40 via-parchment-gold/20 to-transparent" />
      </motion.div>

      <DemoSwitcher />

      {/* Role-based content */}
      {auditLog.isLoading || houses.isLoading || users.isLoading || appeals.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="panel rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : identity.persona === 'professor' ? (
        <ProfessorRestrictedView />
      ) : identity.persona === 'student' ? (
        <StudentView
          auditLog={auditLog.data ?? []}
          appeals={appeals.data ?? []}
          houseMap={houseMap}
          userMap={userMap}
          studentId={identity.id}
          studentName={identity.name}
          onAppeal={(txId, studentId) => setAppealModal({ txId, studentId })}
          appealedTxIds={appealedTxIds}
          onContinueDemo={() => setPersona('head')}
        />
      ) : (
        <HeadOfHouseView
          auditLog={auditLog.data ?? []}
          enrichedAppeals={enrichedAppeals}
          flags={enrichedFlags}
          houseMap={houseMap}
          userMap={userMap}
          reviewerName={identity.name}
          reviewerId={identity.id}
          onAppeal={(txId, studentId) => setAppealModal({ txId, studentId })}
          appealedTxIds={appealedTxIds}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  )
}
