import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { User, House, RoleLimit } from '../types/db'

// Demo cast — actual IDs from the DB
const DEMO_ACTORS = [
  { id: '00000000-0000-0000-0000-000000000201', name: 'Prof. E. Mallory', roleHint: 'Professor' },
  { id: '00000000-0000-0000-0000-000000000206', name: 'Head V. Wren', roleHint: 'Head of House' },
  { id: '00000000-0000-0000-0000-000000000207', name: 'Headmistress A. Rowan', roleHint: 'Head of School' },
  { id: '00000000-0000-0000-0000-000000000203', name: 'Prefect L. Quill', roleHint: 'Prefect' },
]

const SCHOOL_YEAR_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

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

function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      return ((data ?? []) as User[]).sort((a, b) => a.full_name.localeCompare(b.full_name))
    },
  })
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface SuccessData {
  transactionId: string
  houseName: string
  points: number
  hasFlag: boolean
}

const HOUSE_COLORS: Record<string, string> = {
  gryffindor: '#ef4444',
  slytherin: '#4ade80',
  ravenclaw: '#60a5fa',
  hufflepuff: '#fcd34d',
}

export default function PointsEntry() {
  const qc = useQueryClient()
  const houses = useHouses()
  const roleLimits = useRoleLimits()
  const users = useUsers()

  // Form state
  const [actorId, setActorId] = useState(DEMO_ACTORS[0].id)
  const [roleId, setRoleId] = useState('')
  const [houseId, setHouseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [pointsRaw, setPointsRaw] = useState('-20')
  const [reason, setReason] = useState('')
  const [txType, setTxType] = useState<'award' | 'deduction'>('deduction')

  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Derived
  const selectedRole = roleLimits.data?.find(r => r.id === roleId)
  const pointLimit = selectedRole?.point_limit ?? null
  const pointsNum = parseInt(pointsRaw, 10)
  const absPoints = Math.abs(isNaN(pointsNum) ? 0 : pointsNum)
  const limitExceeded = pointLimit !== null && absPoints > pointLimit

  const selectedHouse = houses.data?.find(h => h.id === houseId)
  const houseColor = selectedHouse ? HOUSE_COLORS[selectedHouse.slug] ?? '#c9a84c' : '#c9a84c'

  // Students for the selected house
  const houseStudents = users.data?.filter(u => u.house_id === houseId) ?? []

  const handleRoleChange = (id: string) => {
    setRoleId(id)
  }

  const canSubmit =
    actorId && roleId && houseId && studentId && reason.trim() &&
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
          submitted_by: actorId,
          submitted_role_id: roleId,
          submitted_at: new Date().toISOString(),
          effective_at: new Date().toISOString(),
          source: 'manual',
          metadata: {},
        })
        .select('id')
        .single()

      if (error) throw error

      // Check if there's an existing anti-abuse flag for this actor
      const { data: flags } = await supabase
        .from('anti_abuse_flags')
        .select('id')
        .eq('flagged_user_id', actorId)
        .eq('status', 'open')

      setSuccessData({
        transactionId: data.id,
        houseName: selectedHouse?.name ?? '',
        points: finalPoints,
        hasFlag: (flags?.length ?? 0) > 0,
      })
      setSubmitState('success')

      // Invalidate standings + activity feed
      await qc.invalidateQueries({ queryKey: ['standings'] })
      await qc.invalidateQueries({ queryKey: ['banner'] })
      await qc.invalidateQueries({ queryKey: ['movements'] })
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
    setPointsRaw('-20')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
          Points Entry
        </h1>
        <div className="mt-3 h-px bg-gradient-to-r from-parchment-gold/40 via-parchment-gold/20 to-transparent" />
      </motion.div>

      <AnimatePresence mode="wait">
        {submitState === 'success' && successData ? (
          // Success state
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Success panel */}
            <div
              className="panel rounded-xl p-6 text-center"
              style={{ borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display text-2xl text-ink font-semibold mb-1">
                Transaction Recorded
              </h2>
              <p className="text-ink-muted text-sm font-body mb-4">
                Permanently added to the immutable audit log
              </p>
              <div className="inline-flex items-center gap-3 bg-surface rounded-lg px-5 py-3">
                <span
                  className="font-mono text-2xl font-semibold"
                  style={{ color: successData.points < 0 ? '#f87171' : '#4ade80' }}
                >
                  {successData.points > 0 ? '+' : ''}{successData.points}
                </span>
                <span className="text-ink-muted font-body text-sm">pts →</span>
                <span className="font-display text-lg text-ink">{successData.houseName}</span>
              </div>
              <p className="text-xs font-mono text-ink-dim mt-3">
                Transaction ID: {successData.transactionId.slice(-12).toUpperCase()}
              </p>
            </div>

            {/* Anti-abuse warning */}
            {successData.hasFlag && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl p-5 border"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <div className="flex gap-3 items-start">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <h3 className="font-body font-semibold text-red-400 mb-1">
                      Anti-Abuse Pattern Detected
                    </h3>
                    <p className="text-sm text-ink-muted font-body">
                      This staff member has an existing open flag for repeated Gryffindor deductions.
                      This transaction has been recorded but is flagged for Headmistress review.
                    </p>
                    <p className="text-xs font-mono text-ink-dim mt-2">
                      View details in Audit & Appeals → Anti-Abuse Flags
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-ghost flex-1">
                Submit Another Transaction
              </button>
              <a href="/audit-appeals" className="btn-gold flex-1 text-center inline-block py-2.5 px-6 rounded font-semibold">
                View in Audit Log →
              </a>
            </div>
          </motion.div>
        ) : (
          // Entry form
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Role & Actor panel */}
            <div className="panel rounded-xl p-5">
              <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                <span className="text-parchment-gold text-base">①</span> Acting Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Actor selector */}
                <div>
                  <label className="label-field">Staff Member</label>
                  <select
                    className="select-field"
                    value={actorId}
                    onChange={e => setActorId(e.target.value)}
                  >
                    {DEMO_ACTORS.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.roleHint})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-ink-dim font-mono mt-1">Demo role switcher — no auth</p>
                </div>

                {/* Role selector */}
                <div>
                  <label className="label-field">Acting Role</label>
                  {roleLimits.isLoading ? (
                    <div className="input-field animate-pulse text-ink-dim">Loading roles…</div>
                  ) : (
                    <select
                      className="select-field"
                      value={roleId}
                      onChange={e => handleRoleChange(e.target.value)}
                      required
                    >
                      <option value="">— Select role —</option>
                      {roleLimits.data?.filter(r => r.can_submit_points).map(r => (
                        <option key={r.id} value={r.id}>
                          {r.display_name} ({r.limit_label})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Role limit badge */}
              {selectedRole && (
                <div className="mt-3 inline-flex items-center gap-2 bg-surface rounded px-3 py-1.5">
                  <span className="text-xs font-mono text-ink-dim">Point limit:</span>
                  <span className="text-sm font-mono text-parchment-gold font-medium">
                    {pointLimit !== null ? `±${pointLimit} pts` : 'Unlimited'}
                  </span>
                </div>
              )}
            </div>

            {/* House & Student panel */}
            <div className="panel rounded-xl p-5">
              <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                <span className="text-parchment-gold text-base">②</span> Target
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House */}
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
                      {houses.data?.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Student */}
                <div>
                  <label className="label-field">Student (optional)</label>
                  <select
                    className="select-field"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    disabled={!houseId}
                  >
                    <option value="">— Select student —</option>
                    {houseStudents.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                    {houseId && houseStudents.length === 0 && (
                      <option disabled>No students found for this house</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Points panel */}
            <div className="panel rounded-xl p-5">
              <h2 className="font-display text-lg text-ink font-medium mb-4 flex items-center gap-2">
                <span className="text-parchment-gold text-base">③</span> Transaction
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
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

                {/* Points value */}
                <div>
                  <label className="label-field">Points (absolute value)</label>
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
                    <p className="text-xs text-red-400 font-mono mt-1">
                      ⚠ Exceeds your role limit of {pointLimit} pts
                    </p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="mt-4">
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
                />
                <p className="text-xs text-ink-dim font-mono mt-1">
                  Mandatory — permanently recorded in the audit log
                </p>
              </div>

              {/* Preview */}
              {houseId && absPoints > 0 && reason.trim() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-lg bg-surface p-3 flex items-center gap-3"
                >
                  <span
                    className="font-mono text-xl font-semibold"
                    style={{ color: txType === 'deduction' ? '#f87171' : '#4ade80' }}
                  >
                    {txType === 'deduction' ? '−' : '+'}{absPoints}
                  </span>
                  <span className="text-ink-dim">→</span>
                  <span className="font-display text-base" style={{ color: houseColor }}>
                    {selectedHouse?.name}
                  </span>
                  <span className="text-ink-dim text-xs font-body flex-1 truncate ml-2">
                    "{reason}"
                  </span>
                </motion.div>
              )}
            </div>

            {/* Error */}
            {submitState === 'error' && (
              <div className="rounded-lg p-3 bg-red-900/20 border border-red-500/30">
                <p className="text-sm text-red-400 font-mono">Error: {errorMsg}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-dim font-mono">
                All submissions are permanent and audited
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-gold px-8 py-3 text-base"
              >
                {submitState === 'submitting' ? 'Recording…' : 'Record Transaction'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
