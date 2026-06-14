import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import DemoSwitcher from '../components/DemoSwitcher'
import HouseCrest from '../components/HouseCrest'
import { useDemoIdentity } from '../contexts/DemoIdentity'
import type { House, RoleLimit, UserRole } from '../types/db'
import { getHouseTheme } from '../lib/houseTheme'
import type { HouseSlug } from '../types/db'

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
        .from('user_roles').select('*').eq('user_id', userId).is('removed_at', null)
      if (error) throw error
      return (data ?? []) as UserRole[]
    },
    enabled: !!userId,
  })
}

function useStudentUserIds() {
  return useQuery<Set<string>>({
    queryKey: ['student_user_ids'],
    queryFn: async () => {
      const { data: roleRows, error: roleErr } = await supabase.from('roles').select('id').ilike('name', 'student')
      if (roleErr) throw roleErr
      if (!roleRows?.length) return new Set<string>()
      const roleIds = (roleRows as { id: string }[]).map(r => r.id)
      const { data: urRows, error: urErr } = await supabase
        .from('user_roles').select('user_id').in('role_id', roleIds).is('removed_at', null)
      if (urErr) throw urErr
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

// ─── Role Limit Panel ─────────────────────────────────────────────────────────

interface RoleLimitPanelProps {
  actorRoleLimits: RoleLimit[]
  roleId: string
  onSelectRole: (id: string) => void
  staffName: string
}

function RoleLimitPanel({ actorRoleLimits, roleId, onSelectRole, staffName }: RoleLimitPanelProps) {
  const ROLE_ICONS: Record<string, string> = {
    prefect:     'P',
    professor:   'Pr',
    head:        'HH',
    headmistress:'HM',
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Staff identity */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(10,8,3,0.5)', border: '1px solid rgba(61,46,24,0.4)' }}
      >
        <p className="section-label mb-2">Acting Identity</p>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg font-semibold shrink-0"
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.30)',
              color: '#c9a84c',
            }}
          >
            {staffName.charAt(0)}
          </div>
          <div>
            <p className="font-body font-medium text-sm text-ink leading-none">{staffName}</p>
            <p className="text-xs font-mono mt-1" style={{ color: '#4a3c28' }}>Prototype · no real auth</p>
          </div>
        </div>
      </div>

      {/* Role selection */}
      <div>
        <p className="section-label mb-2">Permission Context</p>
        <div className="space-y-2">
          {actorRoleLimits.map(r => {
            const isActive = roleId === r.id
            const iconKey = Object.keys(ROLE_ICONS).find(k => r.name.toLowerCase().includes(k)) ?? 'professor'
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className="role-pill"
                style={isActive ? {
                  borderColor: 'rgba(201,168,76,0.55)',
                  background: 'rgba(201,168,76,0.10)',
                  boxShadow: '0 0 12px rgba(201,168,76,0.15)',
                } : undefined}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-semibold"
                  style={{
                    background: isActive ? 'rgba(201,168,76,0.20)' : 'rgba(30,21,9,0.8)',
                    border: `1px solid ${isActive ? 'rgba(201,168,76,0.45)' : 'rgba(61,46,24,0.5)'}`,
                    color: isActive ? '#c9a84c' : '#6b5b3e',
                  }}
                >
                  {ROLE_ICONS[iconKey] ?? r.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-body text-sm font-medium ${isActive ? 'text-ink' : 'text-ink-dim'} leading-none`}>
                    {r.display_name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: isActive ? '#c9a84c' : '#4a3c28' }}>
                    {r.limit_label}
                  </p>
                </div>
                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#c9a84c' }}
                  />
                )}
              </button>
            )
          })}

          {actorRoleLimits.length === 0 && (
            <div
              className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(10,8,3,0.4)', border: '1px dashed rgba(61,46,24,0.4)' }}
            >
              <p className="text-xs font-mono text-ink-dim">No point-submission roles assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Active limit display */}
      {roleId && actorRoleLimits.find(r => r.id === roleId) && (() => {
        const role = actorRoleLimits.find(r => r.id === roleId)!
        return (
          <div
            className="rounded-xl p-4 mt-auto"
            style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.25)',
            }}
          >
            <p className="section-label mb-1">Transaction Limit</p>
            <p className="font-mono text-3xl font-semibold" style={{ color: '#c9a84c' }}>
              {role.point_limit !== null ? `±${role.point_limit}` : '∞'}
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#6b5b3e' }}>
              {role.point_limit !== null ? 'points per transaction' : 'unlimited authority'}
            </p>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Student blocked view ─────────────────────────────────────────────────────

function StudentBlockedView() {
  return (
    <div
      className="rounded-xl p-12 text-center"
      style={{
        background: 'rgba(20,14,5,0.7)',
        border: '1px solid rgba(61,46,24,0.4)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.20)' }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M14 3 L26 8 L26 18 Q26 24 14 27 Q2 24 2 18 L2 8 Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
          <text x="14" y="17" fontFamily="Georgia, serif" fontSize="11" fill="#c9a84c" textAnchor="middle" dominantBaseline="middle" fontWeight="700">S</text>
        </svg>
      </div>
      <h2 className="font-display text-2xl text-ink font-semibold mb-2">
        Students don't submit point transactions
      </h2>
      <p className="text-sm font-body max-w-sm mx-auto" style={{ color: '#6b5b3e' }}>
        Only staff members with an active role (Professor, Head of House, etc.) can award or
        deduct points. Switch to a staff identity above to submit a transaction.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PointsEntry() {
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const { identity, setPersona } = useDemoIdentity()

  const houses           = useHouses()
  const roleLimits       = useRoleLimits()
  const userRoles        = useUserRoles(identity.id)
  const studentUserIds   = useStudentUserIds()
  const users            = useUsers()

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
  const [houseId,     setHouseId]     = useState('')
  const [studentId,   setStudentId]   = useState('')
  const [pointsRaw,   setPointsRaw]   = useState('20')
  const [reason,      setReason]      = useState('')
  const [txType,      setTxType]      = useState<'award' | 'deduction'>('deduction')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [errorMsg,    setErrorMsg]    = useState('')

  useEffect(() => {
    setRoleId('')
    setHouseId('')
    setStudentId('')
    setSubmitState('idle')
    setSuccessData(null)
  }, [identity.id])

  const selectedRole  = actorRoleLimits.find(r => r.id === roleId)
  const pointLimit    = selectedRole?.point_limit ?? null
  const pointsNum     = parseInt(pointsRaw, 10)
  const absPoints     = Math.abs(isNaN(pointsNum) ? 0 : pointsNum)
  const limitExceeded = pointLimit !== null && absPoints > pointLimit

  const selectedHouse = houses.data?.find(h => h.id === houseId)
  const houseTheme    = selectedHouse ? getHouseTheme(selectedHouse.slug as HouseSlug) : null

  const houseStudents = (users.data ?? []).filter(
    u => u.house_id === houseId && (studentUserIds.data?.has(u.id) ?? false)
  )

  const missingReason = !reason.trim() && submitState !== 'idle'

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

  const isStudent = identity.persona === 'student'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="section-label mb-2">Staff Portal · Private Chamber</p>
        <h1 className="font-display text-5xl text-parchment-gold font-semibold">Points Entry</h1>
        <div className="mt-3 gold-line max-w-xs" />
      </motion.div>

      <DemoSwitcher />

      {/* Student blocked */}
      {isStudent ? (
        <StudentBlockedView />
      ) : (
        <AnimatePresence mode="wait">
          {submitState === 'success' && successData ? (
            // ── Success screen ─────────────────────────────────────────────────
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div
                className="rounded-xl p-8 text-center"
                style={{
                  border: '1px solid rgba(74,222,128,0.30)',
                  background: 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(20,14,5,0.9) 60%)',
                  boxShadow: '0 0 40px rgba(74,222,128,0.08)',
                }}
              >
                {/* Checkmark */}
                <div className="flex items-center justify-center mb-5">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)' }}
                  >
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 15 L12 21 L24 9" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <h2 className="font-display text-3xl text-ink font-semibold mb-1">Transaction Sealed</h2>
                <p className="font-mono text-sm mb-6" style={{ color: '#4a3c28' }}>
                  Permanently recorded in the immutable audit ledger
                </p>

                {/* Transaction summary */}
                <div
                  className="inline-flex items-center gap-4 rounded-xl px-6 py-4 mb-4"
                  style={{ background: 'rgba(10,8,3,0.7)', border: '1px solid rgba(61,46,24,0.45)' }}
                >
                  <span className="font-mono text-3xl font-semibold" style={{ color: successData.points < 0 ? '#f87171' : '#4ade80' }}>
                    {successData.points > 0 ? '+' : ''}{successData.points}
                  </span>
                  <div className="w-px h-8" style={{ background: 'rgba(61,46,24,0.5)' }} />
                  <span className="font-display text-xl text-ink">{successData.houseName}</span>
                </div>

                <p className="text-xs font-mono" style={{ color: '#4a3c28' }}>
                  Transaction ID: {successData.transactionId.slice(-12).toUpperCase()}
                </p>
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
            // ── Form ──────────────────────────────────────────────────────────
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Role panel */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'rgba(20,14,5,0.75)',
                    border: '1px solid rgba(61,46,24,0.45)',
                  }}
                >
                  {userRoles.isLoading || roleLimits.isLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(30,21,9,0.8)' }} />)}
                    </div>
                  ) : (
                    <RoleLimitPanel
                      actorRoleLimits={actorRoleLimits}
                      roleId={roleId}
                      onSelectRole={setRoleId}
                      staffName={identity.name}
                    />
                  )}
                </div>

                {/* RIGHT: Transaction form */}
                <div className="lg:col-span-2 space-y-5">
                  {/* ① Target */}
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(20,14,5,0.75)', border: '1px solid rgba(61,46,24,0.45)' }}
                  >
                    <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.30)' }}
                      >1</span>
                      Target
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-field">House {!houseId && <span className="text-red-400/70">*</span>}</label>
                        {houses.isLoading ? (
                          <div className="input-field animate-pulse text-ink-dim">Loading…</div>
                        ) : (
                          <select
                            className="select-field"
                            value={houseId}
                            onChange={e => { setHouseId(e.target.value); setStudentId('') }}
                            required
                            style={houseId && houseTheme ? {
                              borderColor: houseTheme.border,
                              color: houseTheme.text,
                            } : undefined}
                          >
                            <option value="">— Select house —</option>
                            {houses.data?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="label-field">Student (optional)</label>
                        <select
                          className="select-field"
                          value={studentId}
                          onChange={e => setStudentId(e.target.value)}
                          disabled={!houseId || studentUserIds.isLoading}
                        >
                          <option value="">— Select student —</option>
                          {houseStudents.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                          {houseId && !studentUserIds.isLoading && houseStudents.length === 0 && (
                            <option disabled>No students found</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* House identity preview — shown when house is selected */}
                    <AnimatePresence>
                      {houseId && houseTheme && selectedHouse && (
                        <motion.div
                          key={houseId}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="mt-3"
                        >
                          <div
                            className="rounded-lg p-3 flex items-center gap-3"
                            style={{
                              background: houseTheme.gradient,
                              border: `1px solid ${houseTheme.border}`,
                              boxShadow: `0 0 20px ${houseTheme.glow}`,
                            }}
                          >
                            <HouseCrest house={selectedHouse.slug as HouseSlug} size={52} />
                            <div>
                              <p className="font-display text-base font-semibold leading-none" style={{ color: houseTheme.text }}>
                                {selectedHouse.name}
                              </p>
                              <p className="text-xs font-mono mt-0.5" style={{ color: houseTheme.textDim }}>
                                Points will affect this house
                              </p>
                              <div
                                className="mt-1.5 h-0.5 rounded-full w-10"
                                style={{ background: `linear-gradient(90deg, ${houseTheme.secondary}, transparent)` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ② Transaction */}
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(20,14,5,0.75)', border: '1px solid rgba(61,46,24,0.45)' }}
                  >
                    <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.30)' }}
                      >2</span>
                      Transaction
                    </h2>

                    {/* Type toggle + Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="label-field">Type</label>
                        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(61,46,24,0.5)' }}>
                          {(['deduction', 'award'] as const).map(t => {
                            const isActive = txType === t
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTxType(t)}
                                className="flex-1 py-2.5 font-body text-sm font-semibold transition-all duration-150"
                                style={isActive
                                  ? t === 'deduction'
                                    ? { background: 'rgba(248,113,113,0.15)', color: '#f87171', borderRight: t === 'deduction' ? '1px solid rgba(61,46,24,0.4)' : undefined }
                                    : { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
                                  : { background: 'transparent', color: '#4a3c28' }
                                }
                              >
                                {t === 'deduction' ? '− Deduction' : '+ Award'}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="label-field">Points</label>
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg font-semibold"
                            style={{ color: txType === 'deduction' ? '#f87171' : '#4ade80' }}
                          >
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
                          <p className="text-xs font-mono mt-1.5" style={{ color: '#f87171' }}>
                            ⚠ Exceeds role limit of {pointLimit} pts
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                      <label className="label-field">
                        Reason <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        className="input-field resize-none"
                        rows={3}
                        placeholder="Describe the reason for this point transaction…"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        style={missingReason ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined}
                      />
                      <p className="text-xs font-mono mt-1" style={{ color: '#3d2e18' }}>
                        Mandatory — permanently recorded in the audit ledger
                      </p>
                    </div>

                    {/* Preview */}
                    <AnimatePresence>
                      {houseId && absPoints > 0 && reason.trim() && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-lg overflow-hidden mb-4"
                          style={{
                            background: houseTheme ? houseTheme.bg : 'rgba(30,21,9,0.6)',
                            border: houseTheme ? `1px solid ${houseTheme.border}` : '1px solid rgba(61,46,24,0.4)',
                          }}
                        >
                          <div className="flex items-center gap-3 p-3">
                            <span
                              className="font-mono text-xl font-semibold"
                              style={{ color: txType === 'deduction' ? '#f87171' : '#4ade80' }}
                            >
                              {txType === 'deduction' ? '−' : '+'}{absPoints}
                            </span>
                            <span style={{ color: '#3d2e18' }}>→</span>
                            <span className="font-display text-base" style={{ color: houseTheme?.text ?? '#c9a84c' }}>
                              {selectedHouse?.name}
                            </span>
                            <span className="text-xs font-body truncate flex-1 ml-1" style={{ color: '#4a3c28' }}>
                              "{reason}"
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error */}
                    {submitState === 'error' && (
                      <div
                        className="rounded-lg p-3 mb-4"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.30)' }}
                      >
                        <p className="text-sm font-mono" style={{ color: '#f87171' }}>Error: {errorMsg}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-mono" style={{ color: '#3d2e18' }}>
                        All submissions are permanent and audited
                      </p>
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="btn-seal"
                      >
                        {submitState === 'submitting' ? 'Sealing…' : 'Seal Transaction'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
