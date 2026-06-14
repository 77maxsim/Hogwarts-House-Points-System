import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppealCard from '../components/AppealCard'
import AbuseFlag from '../components/AbuseFlag'
import DemoSwitcher from '../components/DemoSwitcher'
import { useDemoIdentity } from '../contexts/DemoIdentity'
import { getHouseTheme } from '../lib/houseTheme'
import type {
  PointTransaction, Appeal, AntiAbuseFlag, User, House, AppealWithDetail,
} from '../types/db'
import type { HouseSlug } from '../types/db'

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

// ─── TX type badge ─────────────────────────────────────────────────────────────

const TX_META = {
  award:      { label: 'AWARD',   color: '#4ade80' },
  deduction:  { label: 'DEDUCT',  color: '#f87171' },
  correction: { label: 'CORRECT', color: '#93c5fd' },
} as Record<string, { label: string; color: string }>

// ─── Ledger Entry ─────────────────────────────────────────────────────────────

interface LedgerEntryProps {
  tx: PointTransaction
  houseName?: string
  houseSlug?: string
  submitterName?: string
  studentName?: string
  appealButton?: { label: string; onClick: () => void } | 'appealed' | null
}

function LedgerEntryHover({ tx, houseName, houseSlug, submitterName, studentName, appealButton }: LedgerEntryProps) {
  const [hovered, setHovered] = useState(false)
  const t = TX_META[tx.transaction_type] ?? { label: tx.transaction_type.toUpperCase(), color: '#a89060' }
  const houseTheme = houseSlug ? getHouseTheme(houseSlug as HouseSlug) : null
  const houseColor = houseTheme?.text ?? '#c9a84c'
  const isPositive = tx.points > 0

  return (
    <div
      className="ledger-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="text-xs font-mono font-semibold px-2 py-1 rounded shrink-0 w-16 text-center"
        style={{ color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}28` }}
      >
        {t.label}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-sm font-medium" style={{ color: houseColor }}>
            {houseName ?? tx.house_id.slice(-8)}
          </span>
          {studentName && <span className="text-xs font-body text-ink-dim">· {studentName}</span>}
          {submitterName && (
            <span className="text-xs font-mono px-1.5 py-0.5 rounded hidden sm:inline"
              style={{ color: '#4a3c28', background: 'rgba(30,21,9,0.6)', border: '1px solid rgba(61,46,24,0.35)' }}>
              {submitterName}
            </span>
          )}
        </div>
        <p className="text-xs font-body mt-0.5 line-clamp-1 text-ink-muted">{tx.reason}</p>
        <p className="text-xs font-mono mt-0.5" style={{ color: '#3d2e18' }}>
          {new Date(tx.effective_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          &nbsp;·&nbsp;{tx.id.slice(-8).toUpperCase()}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono text-base font-semibold" style={{ color: isPositive ? '#4ade80' : '#f87171' }}>
          {isPositive ? '+' : ''}{tx.points}
        </span>
        {appealButton && tx.transaction_type === 'deduction' && (
          <div className="mt-1" style={{ minHeight: '18px' }}>
            {appealButton === 'appealed' ? (
              <span className="text-xs font-mono" style={{ color: '#6b5b3e' }}>Appealed</span>
            ) : (
              <button
                onClick={appealButton.onClick}
                className="text-xs font-mono transition-all duration-150"
                style={{ color: '#c9a84c', opacity: hovered ? 1 : 0 }}
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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="rounded-2xl p-6 w-full max-w-md"
        style={{
          background: 'rgba(22,15,6,0.97)',
          border: '1px solid rgba(201,168,76,0.25)',
          boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(201,168,76,0.08)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute inset-x-6 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />

        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl text-ink font-semibold">Appeal Deduction</h2>
            <p className="text-xs font-mono mt-1" style={{ color: '#4a3c28' }}>
              Transaction: {txId.slice(-12).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink text-xl leading-none transition-colors"
            style={{ marginTop: '2px' }}
          >×</button>
        </div>

        <div className="mb-4">
          <label className="label-field">Your reason for appeal</label>
          <textarea
            autoFocus
            className="input-field resize-none"
            rows={4}
            placeholder="Explain why this deduction was unfair or incorrect…"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <p className="text-xs font-mono mb-4" style={{ color: '#4a3c28' }}>
          Submitting as: <span className="text-parchment-gold">{studentName}</span>
        </p>

        {error && <p className="text-sm font-mono mb-3" style={{ color: '#f87171' }}>Error: {error}</p>}

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
    <motion.div
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3"
      style={{
        background: 'rgba(22,15,6,0.97)',
        border: '1px solid rgba(201,168,76,0.30)',
        boxShadow: '0 0 24px rgba(201,168,76,0.15), 0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p className="text-sm font-body text-ink flex items-center gap-2">
        <span style={{ color: '#4ade80' }}>✓</span>
        {msg}
      </p>
    </motion.div>
  )
}

// ─── Ledger panel wrapper ─────────────────────────────────────────────────────

function LedgerPanel({ title, count, tag, children }: { title: string; count?: number; tag?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(20,14,5,0.80)', border: '1px solid rgba(61,46,24,0.45)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(61,46,24,0.35)' }}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg text-ink font-medium">{title}</h2>
          {count !== undefined && (
            <span className="badge-gold">{count}</span>
          )}
        </div>
        {tag && <span className="tag-immutable">{tag}</span>}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

// ─── Professor restricted view ────────────────────────────────────────────────

function ProfessorRestrictedView() {
  return (
    <div
      className="rounded-xl p-12 text-center"
      style={{ background: 'rgba(20,14,5,0.75)', border: '1px solid rgba(61,46,24,0.4)' }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(61,46,24,0.3)', border: '1px solid rgba(61,46,24,0.5)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6b5b3e" strokeWidth="1.5" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#6b5b3e" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-display text-xl text-ink font-semibold mb-2">
        Full audit access not available in this role
      </h2>
      <p className="text-sm font-body max-w-sm mx-auto" style={{ color: '#6b5b3e' }}>
        Professors submit transactions but cannot view the full audit log or manage appeals.
        That access is granted to Heads of House and above.
      </p>
      <p className="text-xs font-mono mt-4" style={{ color: '#3d2e18' }}>
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
      <LedgerPanel
        title="My Transactions"
        count={myTransactions.length}
        tag="Immutable"
      >
        {myTransactions.length === 0 ? (
          <p className="text-ink-dim text-sm font-body text-center py-8">No transactions recorded for your account yet.</p>
        ) : (
          myTransactions.map(tx => {
            const house = houseMap[tx.house_id]
            const submitter = userMap[tx.submitted_by]
            const alreadyAppealed = appealedTxIds.has(tx.id)
            return (
              <LedgerEntryHover
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
                      : { label: 'Appeal →', onClick: () => onAppeal(tx.id, tx.student_id!) }
                    : null
                }
              />
            )
          })
        )}
      </LedgerPanel>

      {hasAppealPending && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.30)' }}
            >
              <span style={{ color: '#fbbf24', fontSize: '12px' }}>⏳</span>
            </div>
            <div>
              <h3 className="font-body font-semibold text-sm" style={{ color: '#fbbf24' }}>
                Pending Head of House review
              </h3>
              <p className="text-sm font-body mt-0.5" style={{ color: '#6b5b3e' }}>
                Your appeal has been submitted and is awaiting review.
              </p>
            </div>
          </div>
          <button onClick={onContinueDemo} className="btn-gold w-full">
            Continue Demo: Head of House Review →
          </button>
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
  appealedTxIds: Set<string>
  onApprove: (appealId: string, note: string) => Promise<void>
  onReject:  (appealId: string, note: string) => Promise<void>
  onEscalate:(appealId: string) => Promise<void>
}

function HeadOfHouseView({
  auditLog, enrichedAppeals, flags, houseMap, userMap,
  reviewerName, appealedTxIds, onApprove, onReject, onEscalate,
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
    { key: 'audit',   label: 'Gryffindor Audit',   count: gryffindorAudit.length },
    { key: 'appeals', label: 'Appeals',             count: pendingAppeals.filter(a => a.status === 'pending').length },
    { key: 'flags',   label: 'Anti-Abuse Flags',    count: gryffindorFlags.filter(f => f.status === 'open').length },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-0 mb-6 rounded-xl overflow-hidden"
        style={{ background: 'rgba(10,8,3,0.6)', border: '1px solid rgba(61,46,24,0.40)' }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 px-4 py-3 text-sm font-body font-medium transition-all duration-150 relative flex items-center justify-center gap-2"
            style={tab === t.key ? {
              background: 'rgba(201,168,76,0.10)',
              color: '#c9a84c',
              borderBottom: '2px solid #c9a84c',
            } : {
              color: '#6b5b3e',
              borderBottom: '2px solid transparent',
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                style={tab === t.key
                  ? { background: 'rgba(201,168,76,0.20)', color: '#c9a84c' }
                  : { background: 'rgba(61,46,24,0.50)', color: '#4a3c28' }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'audit' && (
          <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LedgerPanel title="Gryffindor Transactions" count={gryffindorAudit.length} tag="Immutable Log">
              {gryffindorAudit.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-8">No Gryffindor transactions yet.</p>
              ) : (
                gryffindorAudit.map(tx => {
                  const house = houseMap[tx.house_id]
                  const hasPendingAppeal = enrichedAppeals.some(a => a.transaction_id === tx.id && a.status === 'pending')
                  return (
                    <LedgerEntryHover
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
                })
              )}
            </LedgerPanel>
          </motion.div>
        )}

        {tab === 'appeals' && (
          <motion.div key="appeals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {pendingAppeals.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(20,14,5,0.75)', border: '1px solid rgba(61,46,24,0.4)' }}>
                <p className="font-body text-sm text-ink-dim">No appeals for Gryffindor.</p>
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
            <LedgerPanel title="Anti-Abuse Flags — Gryffindor" tag="System-Generated">
              {gryffindorFlags.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-6">No flags for Gryffindor.</p>
              ) : (
                <div className="space-y-3 py-3">
                  {gryffindorFlags.map(f => <AbuseFlag key={f.id} flag={f} />)}
                </div>
              )}
            </LedgerPanel>
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
  const houses   = useHouses()
  const users    = useUsers()
  const appeals  = useAppeals()
  const flags    = useFlags()

  const houseMap = Object.fromEntries(houses.data?.map(h => [h.id, h]) ?? []) as Record<string, House>
  const userMap  = Object.fromEntries(users.data?.map(u => [u.id, u]) ?? []) as Record<string, User>
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
    const { error } = await supabase.rpc('create_student_appeal', { transaction_id: txId, student_id: studentId, reason })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    showToast('Appeal submitted successfully')
  }

  const handleApprove = async (appealId: string, reviewerNote: string) => {
    const { error } = await supabase.rpc('approve_appeal_and_create_correction', {
      appeal_id: appealId, reviewed_by: identity.id, reviewer_note: reviewerNote,
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
      appeal_id: appealId, reviewed_by: identity.id, reviewer_note: reviewerNote,
    })
    if (error) throw error
    await qc.invalidateQueries({ queryKey: ['appeals'] })
    showToast('Appeal rejected')
  }

  const handleEscalate = async (appealId: string) => {
    showToast(`Appeal ${appealId.slice(-8).toUpperCase()} escalated to Headmistress A. Rowan`)
  }

  const headingMap = {
    professor: { sub: 'Staff Portal',   title: 'Audit & Appeals' },
    student:   { sub: 'Student Portal', title: 'My Point Records & Appeals' },
    head:      { sub: 'Head of House',  title: `${identity.name} — Gryffindor` },
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
        <p className="section-label mb-2">{heading.sub}</p>
        <h1 className="font-display text-5xl text-parchment-gold font-semibold leading-tight">
          {heading.title}
        </h1>
        <div className="mt-3 gold-line max-w-xs" />
      </motion.div>

      <DemoSwitcher />

      {auditLog.isLoading || houses.isLoading || users.isLoading || appeals.isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div
              key={i}
              className="rounded-xl h-20 animate-pulse"
              style={{ background: 'rgba(20,14,5,0.75)', border: '1px solid rgba(61,46,24,0.4)' }}
            />
          ))}
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
          appealedTxIds={appealedTxIds}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  )
}
