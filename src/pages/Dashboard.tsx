import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import HouseCard from '../components/HouseCard'
import WinnerBanner from '../components/WinnerBanner'
import TransactionRow from '../components/TransactionRow'
import type { HouseStanding, WinnerBanner as WinnerBannerType, PublicMovement } from '../types/db'
import { getHouseTheme } from '../lib/houseTheme'
import type { HouseSlug } from '../types/db'

function useStandings() {
  return useQuery<HouseStanding[]>({
    queryKey: ['standings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('public_house_standings').select('*')
      if (error) throw error
      return ((data ?? []) as HouseStanding[]).sort((a, b) => b.total_points - a.total_points)
    },
    refetchInterval: 8000,
  })
}

function useBanner() {
  return useQuery<WinnerBannerType | null>({
    queryKey: ['banner'],
    queryFn: async () => {
      const { data, error } = await supabase.from('current_winner_banner').select('*').maybeSingle()
      if (error) throw error
      return data
    },
    refetchInterval: 8000,
  })
}

function useRecentMovements() {
  return useQuery<PublicMovement[]>({
    queryKey: ['movements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recent_public_movements').select('*').limit(20)
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 8000,
  })
}

function LoadingCard() {
  return (
    <div
      className="rounded-xl animate-pulse"
      style={{
        height: '260px',
        background: 'rgba(30,21,9,0.7)',
        border: '1px solid rgba(61,46,24,0.4)',
      }}
    />
  )
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="panel p-4 text-center">
      <p className="text-red-400 font-mono text-sm">{message}</p>
    </div>
  )
}

// ── Movement Ticker ────────────────────────────────────────────────────────────
function MovementTicker({ movements }: { movements: PublicMovement[] }) {
  if (!movements.length) return null

  // Duplicate for seamless loop
  const items = [...movements, ...movements]

  return (
    <div
      className="border-t overflow-hidden"
      style={{
        borderColor: 'rgba(61,46,24,0.45)',
        background: 'rgba(6,4,1,0.8)',
      }}
    >
      <div className="flex items-center">
        {/* Label */}
        <div
          className="shrink-0 px-4 py-2 border-r"
          style={{ borderColor: 'rgba(61,46,24,0.45)' }}
        >
          <span className="section-label" style={{ whiteSpace: 'nowrap' }}>Live Feed</span>
        </div>
        {/* Scrolling items */}
        <div className="flex-1 overflow-hidden py-2 px-2">
          <div className="ticker-track">
            {items.map((tx, i) => {
              const theme = getHouseTheme(tx.house_slug as HouseSlug)
              const isPos = tx.points > 0
              return (
                <span key={i} className="flex items-center gap-1.5 text-xs font-mono" style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ color: theme.text, fontWeight: 600 }}>{tx.house_name}</span>
                  <span style={{ color: isPos ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                    {isPos ? '+' : ''}{tx.points}
                  </span>
                  {tx.reason && (
                    <span style={{ color: '#4a3c28' }}>· {tx.reason.length > 32 ? tx.reason.slice(0, 32) + '…' : tx.reason}</span>
                  )}
                  <span style={{ color: '#2e2215', margin: '0 0.5rem' }}>◆</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Hero section ───────────────────────────────────────────────────────────────
function DashboardHero({ isFetching }: { isFetching: boolean }) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="text-center mb-10"
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.35))' }} />
        <span className="section-label">The Great Hall · Live Standings</span>
        <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.35), transparent)' }} />
      </div>

      {/* Title */}
      <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight"
        style={{ color: '#c9a84c', textShadow: '0 0 40px rgba(201,168,76,0.25)' }}>
        House Points
      </h1>

      {/* Public display badge */}
      <div className="flex items-center justify-center gap-2.5 mt-4">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono"
          style={{
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.22)',
            color: '#4ade80',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#4ade80', animation: 'pulse-live 2s infinite' }}
          />
          Public Display
        </div>
        {isFetching && (
          <span className="text-xs font-mono" style={{ color: '#3d2e18', animation: 'candle-flicker 2s infinite' }}>
            ↻ Updating
          </span>
        )}
      </div>

      {/* Date */}
      <p className="text-xs font-mono mt-3" style={{ color: '#4a3c28' }}>{today}</p>

      {/* Gold divider */}
      <div className="mt-6 gold-line max-w-sm mx-auto" />
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const standings = useStandings()
  const banner    = useBanner()
  const movements = useRecentMovements()

  const leadingHouse = standings.data?.[0]

  return (
    <div className="min-h-screen">
      {/* Page content */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-0">
        <DashboardHero isFetching={standings.isFetching} />

        {/* Winner banner */}
        {banner.data && <WinnerBanner banner={banner.data} />}
        {banner.error && <ErrorPanel message="Could not load banner." />}

        {/* Standings section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-ink font-medium">Current Standings</h2>
          </div>

          {standings.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
            </div>
          ) : standings.error ? (
            <ErrorPanel message="Could not load standings." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {standings.data?.map((s, i) => (
                <HouseCard
                  key={s.house_id}
                  standing={s}
                  rank={i + 1}
                  isLeading={s.house_id === leadingHouse?.house_id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent activity + public note */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-0">
          {/* Activity feed */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{
            background: 'rgba(20,14,5,0.75)',
            border: '1px solid rgba(61,46,24,0.45)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(61,46,24,0.35)' }}
            >
              <h2 className="font-display text-lg text-ink font-medium">Recent Activity</h2>
              <span className="badge-live">LIVE</span>
            </div>

            <div className="px-5 py-2">
              {movements.isLoading ? (
                <div className="space-y-3 py-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'rgba(30,21,9,0.8)' }} />
                  ))}
                </div>
              ) : movements.error ? (
                <ErrorPanel message="Could not load activity." />
              ) : movements.data?.length === 0 ? (
                <p className="text-ink-dim text-sm font-body text-center py-8">No transactions yet.</p>
              ) : (
                <div>
                  {movements.data?.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} showDetails />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Public notice panel */}
          <div className="rounded-xl p-5 flex flex-col gap-4" style={{
            background: 'rgba(20,14,5,0.75)',
            border: '1px solid rgba(61,46,24,0.45)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            <div>
              <h2 className="font-display text-lg text-ink font-medium mb-0.5">Public Information</h2>
              <p className="text-xs font-mono" style={{ color: '#4a3c28' }}>Great Hall transparency notice</p>
            </div>

            <div
              className="rounded-lg p-3.5"
              style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}
            >
              <p className="section-label mb-2" style={{ color: '#2d6e45' }}>Displayed Here</p>
              <ul className="space-y-1.5">
                {['House totals & rankings', 'Point movements (house + amount)', 'Deduction / award / correction types'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs font-body text-ink-muted">
                    <span style={{ color: '#4ade80', fontSize: '8px' }}>◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-lg p-3.5"
              style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}
            >
              <p className="section-label mb-2" style={{ color: '#8b3333' }}>Not Public</p>
              <ul className="space-y-1.5">
                {['Student names', 'Staff identity', 'Appeal details', 'Anti-abuse flags'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs font-body text-ink-muted">
                    <span style={{ color: '#f87171', fontSize: '8px' }}>◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-auto rounded-lg px-3.5 py-3 text-center"
              style={{ background: 'rgba(10,8,3,0.5)', border: '1px solid rgba(61,46,24,0.30)' }}
            >
              <p className="text-xs font-mono" style={{ color: '#4a3c28' }}>
                School Year 2025–2026
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#3d2e18' }}>
                Hogwarts School of Witchcraft & Wizardry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker — full width at bottom */}
      <div className="mt-6 sticky bottom-0 z-10">
        {!movements.isLoading && movements.data && movements.data.length > 0 && (
          <MovementTicker movements={movements.data} />
        )}
      </div>
    </div>
  )
}
