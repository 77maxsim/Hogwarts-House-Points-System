import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import DemoSwitcher from '../components/DemoSwitcher'
import { useDemoIdentity } from '../contexts/DemoIdentity'
import type { House, RoleLimit, UserRole } from '../types/db'

const SCHOOL_YEAR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useHouses() {
  return useQuery<House[]>({
    queryKey: ['houses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('houses').select('*')
      if (error) throw error
      return ((data ?? []) as House[]).sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

function useRoleLimits() {
  return useQuery<RoleLimit[]>({
    queryKey: ['role_limits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_limits_view').select('*')
      if (error) throw error
      return (data ?? []) as RoleLimit[]
    },
  })
}

function useUserRoles(userId: string) {
  return useQuery<UserRole[]>({
    queryKey: ['user_roles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .is('removed_at', null)
      if (error) throw error
      return (data ?? []) as UserRole[]
    },
    enabled: !!userId,
  })
}

// Returns the set of user IDs that currently hold an active Student role
function useStudentUserIds() {
  return useQuery<Set<string>>({
    queryKey: ['student_user_ids'],
    queryFn: async () => {
      const { data: roleRows, error: roleErr } = await supabase
        .from('roles')
        .select('id')
        .ilike('name', 'student')
      if (roleErr) {
        console.error('[useStudentUserIds] roles query failed:', roleErr)
        throw roleErr
      }
      if (!roleRows?.length) {
        console.warn('[useStudentUserIds] No Student role found in roles table')
        return new Set<string>()
      }
      const roleIds = (roleRows as { id: string }[]).map(r => r.id)
      const { data: urRows, error: urErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role_id', roleIds)
        .is('removed_at', null)
      if (urErr) {
        console.error('[useStudentUserIds] user_roles query failed:', urErr)
        throw urErr
      }
      return new Set((urRows ?? []).map((r: { user_id: string }) => r.user_id))
    },
  })
}

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      return (data ?? []) as { id: string; full_name: string; house_id: string | null }[]
    },
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface SuccessData {
  transactionId: string
  houseName: string
  points: number
}

const HOUSE_COLORS: Record<string, string> = {
  gryffindor: '#ef4444',
  slytherin: '#4ade80',
  ravenclaw: '#60a5fa',
  hufflepuff: '#fcd34d',
}

// ─── Student-blocked view ────────────────────────────────────────────────────

function StudentBlockedView() {
  return (
    <div className="panel rounded-xl p-10 text-center">
      <p className="text-4xl mb-4">🎓</p>
      <h2 className="font-display text-xl text-ink font-semibold mb-2">
        Students don't submit point transactions
      </h2>
      <p className="text-sm text-ink-dim font-body max-w-sm mx-auto">
        Only staff members with an active role (Professor, Head of House, etc.) can award or deduct points.
        Switch to a staff identity above to submit a transaction.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PointsEntry() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { identity, setPersona } = useDemoIdentity()

  const houses = useHouses()
  const roleLimits = useRoleLimits()
  const userRoles = useUserRoles(identity.id)
  const studentUserIds = useStudentUserIds()
  const users = useUsers()

  // Role logic
  const [roleId, setRoleId] = useState('')

  const actorRoleIds = useMemo(
    () => new Set((userRoles.data ?? []).map(ur => ur.role_id)),
    [userRoles.data]
  )
  const actorRoleLimits = useMemo(
    () => (roleLimits.data ?? []).filter(r => r.can_submit_points && actorRoleIds.has(r.id)),
    [roleLimits.data, actorRoleIds]
  )

  useEffect(() => {
    if (!userRoles.data || !roleLimits.data) return
    if (actorRoleLimits.length === 1) {
      setRoleId(actorRoleLimits[0].id)
    } else if (roleId && !actorRoleIds.has(roleId)) {
      setRoleId('')
    }
  }, [identity.id, userRoles.data, roleLimits.data])

  // Form state
  const [houseId, setHouseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [pointsRaw, setPointsRaw] = useState('20')
  const [reason, setReason] = useState('')
  const [txType, setTxType] = useState<'award' | 'deduction'>('deduction')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Reset form when identity changes
  useEffect(() => {
    setRoleId('')
    setHouseId('')
    setStudentId('')
    setSubmitState('idle')
    setSuccessData(null)
  }, [identity.id])

  // Derived
  const selectedRole = actorRoleLimits.find(r => r.id === roleId)
  const pointLimit = selectedRole?.point_limit ?? null
  const pointsNum = parseInt(pointsRaw, 10)
  const absPoints = Math.abs(isNaN(pointsNum) ? 0 : pointsNum)
  const limitExceeded = pointLimit !== null && absPoints > pointLimit

  const selectedHouse = houses.data?.find(h => h.id === houseId)
  const houseColor = selectedHouse ? HOUSE_COLORS[selectedHouse.slug] ?? '#c9a84c' : '#c9a84c'

  const houseStudents = (users.data ?? []).filter(
    u => u.house_id === houseId && (studentUserIds.data?.has(u.id) ?? false)
  )

  const canSubmit =
    roleId && actorRoleIds.has(roleId) && houseId && reason.trim() &&
    !isNaN(pointsNum) && absPoints > 0 && !limitExceeded &&
    submitState !== 'submitting'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitState('submitting')
    setErrorMsg('')
    const finalPoints = txType === 'deduction' ? -absPoints : absPoints
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .insert({
          school_year_id: SCHOOL_YEAR_ID,
          transaction_type: txType,
          house_id: houseId,
          student_id: studentId || null,
          points: finalPoints,
          reason: reason.trim(),
          submitted_by: identity.id,
          submitted_role_id: roleId,
          submitted_at: new Date().toISOString(),
          effective_at: new Date().toISOString(),
          source: 'manual',
          metadata: {},
        })
        .select('id')
        .single()
      if (error) throw error
      setSuccessData({ transactionId: data.id, houseName: selectedHouse?.name ?? '', points: finalPoints })
      setSubmitState('success')
      await qc.invalidateQueries({ queryKey: ['standings'] })
      await qc.invalidateQueries({ queryKey: ['banner'] })
      await qc.invalidateQueries({ queryKey: ['movements'] })
      await qc.invalidateQueries({ queryKey: ['audit_log'] })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed')
      setSubmitState('error')
    }
  }

  const handleReset = () => {
    setSubmitState('idle')
    setSuccessData(null)
    setErrorMsg('')
    setReason('')
    setPointsRaw('20')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-[0.25em] mb-2">Staff Portal</p>
        <h1 className="font-display text-4xl text-parchment-gold font-semibold">Points Entry</h1>
        <div className="mt-3 h-px bg-gradient-to-r from-parchment-gold/40 via-parchment-gold/20 to-transparent" />
      </motion.div>

      <DemoSwitcher />

      {/* Student sees a blocked view */}
      {identity.persona === 'student' ? (
        <StudentBlockedView />
      ) : (
        <AnimatePresence mode="wait">
          {submitState === 'success' && successData ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="panel rounded-xl p-6 text-center" style={{ borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}>
                <div className="text-5xl mb-4">✅</div>
                <h2 className="font-display text-2xl text-ink font-semibold mb-1">Transaction Recorded</h2>
                <p className="text-ink-muted text-sm font-body mb-4">Permanently added to the immutable audit log</p>
                <div className="inline-flex items-center gap-3 bg-surface rounded-lg px-5 py-3">
                  <span className="font-mono text-2xl font-semibold" style={{ color: successData.points < 0 ? '#f87171' : '#4ade80' }}>
                    {successData.points > 0 ? '+' : ''}{successData.points}
                  </span>
                  <span className="text-ink-muted font-body text-sm">pts →</span>
                  <span className="font-display text-lg text-ink">{successData.houseName}</span>
                </div>
                <p className="text-xs font-mono text-ink-dim mt-3">Transaction ID: {successData.transactionId.slice(-12).toUpperCase()}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset} className="btn-ghost flex-1">Submit Another</button>
                <button
                  onClick={() => { setPersona('student'); navigate('/audit-appeals') }}
                  className="btn-gold flex-1"
                >
                  Continue Demo: Student Appeal →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
              {/* Acting Identity */}
              <div className="panel rounded-xl p-5">
                <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                  <span className="text-parchment-gold text-base">①</span> Acting Identity
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Staff Member</label>
                    <div className="input-field flex items-center" style={{ cursor: 'default', opacity: 0.85 }}>
                      <span className="text-ink font-medium">{identity.name}</span>
                    </div>
                    <p className="text-xs text-ink-dim font-mono mt-1">Prototype — no real auth</p>
                  </div>
                  <div>
                    {userRoles.isLoading || roleLimits.isLoading ? (
                      <>
                        <label className="label-field">Acting as</label>
                        <div className="input-field animate-pulse text-ink-dim">Loading…</div>
                      </>
                    ) : actorRoleLimits.length === 1 ? (
                      <>
                        <label className="label-field">Acting as</label>
                        <div className="input-field flex items-center justify-between select-none" style={{ opacity: 0.85, cursor: 'default' }}>
                          <span className="text-ink font-medium">{actorRoleLimits[0].display_name}</span>
                          <span className="text-xs font-mono text-parchment-gold">{actorRoleLimits[0].limit_label}</span>
                        </div>
                        <p className="text-xs text-ink-dim font-mono mt-1">Role assigned · single permission context</p>
                      </>
                    ) : actorRoleLimits.length > 1 ? (
                      <>
                        <label className="label-field">Acting as</label>
                        <select className="select-field" value={roleId} onChange={e => setRoleId(e.target.value)} required>
                          <option value="">— Choose permission context —</option>
                          {actorRoleLimits.map(r => (
                            <option key={r.id} value={r.id}>{r.display_name} ({r.limit_label})</option>
                          ))}
                        </select>
                        <p className="text-xs text-ink-dim font-mono mt-1">Multiple roles — select which to act under</p>
                      </>
                    ) : (
                      <>
                        <label className="label-field">Acting as</label>
                        <div className="input-field text-ink-dim text-sm select-none" style={{ cursor: 'default' }}>
                          No point-submission roles assigned
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {selectedRole && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-surface rounded px-3 py-1.5">
                    <span className="text-xs font-mono text-ink-dim">Limit per transaction:</span>
                    <span className="text-sm font-mono text-parchment-gold font-medium">
                      {pointLimit !== null ? `±${pointLimit} pts` : 'Unlimited'}
                    </span>
                  </div>
                )}
              </div>

              {/* Target */}
              <div className="panel rounded-xl p-5">
                <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                  <span className="text-parchment-gold text-base">②</span> Target
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">House</label>
                    {houses.isLoading ? (
                      <div className="input-field animate-pulse text-ink-dim">Loading houses…</div>
                    ) : (
                      <select
                        className="select-field"
                        value={houseId}
                        onChange={e => { setHouseId(e.target.value); setStudentId('') }}
                        required
                        style={houseId ? { borderColor: `${houseColor}50`, color: houseColor } : {}}
                      >
                        <option value="">— Select house —</option>
                        {houses.data?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="label-field">Student (optional)</label>
                    {studentUserIds.isError && import.meta.env.DEV && (
                      <p className="text-xs text-red-400 font-mono mb-1">[dev] student role query failed — check console</p>
                    )}
                    <select
                      className="select-field"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      disabled={!houseId || studentUserIds.isLoading}
                    >
                      <option value="">— Select student —</option>
                      {houseStudents.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                      {houseId && !studentUserIds.isLoading && !studentUserIds.isError && houseStudents.length === 0 && (
                        <option disabled>No students found for this house</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Transaction */}
              <div className="panel rounded-xl p-5">
                <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                  <span className="text-parchment-gold text-base">③</span> Transaction
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">Type</label>
                    <div className="flex gap-2">
                      {(['deduction', 'award'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTxType(t)}
                          className="flex-1 py-2.5 rounded font-body text-sm font-medium transition-colors"
                          style={txType === t
                            ? t === 'deduction'
                              ? { background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }
                              : { background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' }
                            : { background: 'transparent', border: '1px solid rgba(61,46,24,0.6)', color: '#a89060' }
                          }
                        >
                          {t === 'deduction' ? '− Deduction' : '+ Award'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Points (absolute value)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg font-semibold" style={{ color: txType === 'deduction' ? '#f87171' : '#4ade80' }}>
                        {txType === 'deduction' ? '−' : '+'}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={pointLimit ?? 500}
                        value={Math.abs(parseInt(pointsRaw, 10) || 0)}
                        onChange={e => setPointsRaw(e.target.value)}
                        className="input-field pl-8 font-mono"
                        placeholder="20"
                        required
                      />
                    </div>
                    {limitExceeded && (
                      <p className="text-xs text-red-400 font-mono mt-1">⚠ Exceeds your role limit of {pointLimit} pts</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label-field">Reason <span className="text-red-400">*</span></label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Describe the reason for this point transaction…"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                  <p className="text-xs text-ink-dim font-mono mt-1">Mandatory — permanently recorded in the audit log</p>
                </div>
                {houseId && absPoints > 0 && reason.trim() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg bg-surface p-3 flex items-center gap-3">
                    <span className="font-mono text-xl font-semibold" style={{ color: txType === 'deduction' ? '#f87171' : '#4ade80' }}>
                      {txType === 'deduction' ? '−' : '+'}{absPoints}
                    </span>
                    <span className="text-ink-dim">→</span>
                    <span className="font-display text-base" style={{ color: houseColor }}>{selectedHouse?.name}</span>
                    <span className="text-ink-dim text-xs font-body flex-1 truncate ml-2">"{reason}"</span>
                  </motion.div>
                )}
              </div>

              {submitState === 'error' && (
                <div className="rounded-lg p-3 bg-red-900/20 border border-red-500/30">
                  <p className="text-sm text-red-400 font-mono">Error: {errorMsg}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-dim font-mono">All submissions are permanent and audited</p>
                <button type="submit" disabled={!canSubmit} className="btn-gold px-8 py-3 text-base">
                  {submitState === 'submitting' ? 'Recording…' : 'Record Transaction'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
