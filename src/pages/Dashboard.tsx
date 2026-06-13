import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import HouseCard from '../components/HouseCard'
import WinnerBanner from '../components/WinnerBanner'
import TransactionRow from '../components/TransactionRow'
import type { HouseStanding, WinnerBanner as WinnerBannerType, PublicMovement } from '../types/db'

function useStandings() {
  return useQuery<HouseStanding[]>({
    queryKey: ['standings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_house_standings')
        .select('*')
      if (error) throw error
      // Sort client-side descending by total_points
      return ((data ?? []) as HouseStanding[]).sort(
        (a, b) => b.total_points - a.total_points
      )
    },
    refetchInterval: 8000,
  })
}

function useBanner() {
  return useQuery<WinnerBannerType | null>({
    queryKey: ['banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_winner_banner')
        .select('*')
        .maybeSingle()
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
      const { data, error } = await supabase
        .from('recent_public_movements')
        .select('*')
        .limit(20)
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 8000,
  })
}

function LoadingCard() {
  return (
    <div className="rounded-xl border border-parchment-border/40 bg-surface-raised animate-pulse h-40" />
  )
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="panel rounded-xl p-4 text-center">
      <p className="text-red-400 font-mono text-sm">{message}</p>
    </div>
  )
}

export default function Dashboard() {
  const standings = useStandings()
  const banner = useBanner()
  const movements = useRecentMovements()

  const leadingHouse = standings.data?.[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-[0.25em] mb-2">
          The Great Hall
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-parchment-gold font-semibold">
          House Points Standings
        </h1>
        <div className="mt-3 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-parchment-gold/40 to-transparent" />
      </motion.div>

      {/* Winner banner */}
      {banner.data && <WinnerBanner banner={banner.data} />}
      {banner.error && <ErrorPanel message="Could not load banner." />}

      {/* House standings grid */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink font-medium">Current Standings</h2>
          {standings.isFetching && (
            <span className="text-xs font-mono text-ink-dim animate-pulse">↻ Updating…</span>
          )}
        </div>

        {standings.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
          </div>
        ) : standings.error ? (
          <ErrorPanel message="Could not load standings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink font-medium">Recent Activity</h2>
            <span className="text-xs font-mono text-ink-dim border border-parchment-border/50 rounded px-2 py-0.5">
              Live
            </span>
          </div>

          {movements.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 bg-surface rounded animate-pulse" />
              ))}
            </div>
          ) : movements.error ? (
            <ErrorPanel message="Could not load activity." />
          ) : movements.data?.length === 0 ? (
            <p className="text-ink-dim text-sm font-body text-center py-6">No transactions yet.</p>
          ) : (
            <div>
              {movements.data?.map(tx => (
                <TransactionRow key={tx.id} tx={tx} showDetails />
              ))}
            </div>
          )}
        </div>

        {/* Public notice panel */}
        <div className="panel rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-display text-lg text-ink font-medium">Public Information</h2>

          <div className="rounded-lg bg-surface p-3 border border-parchment-border/30">
            <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-widest mb-1">
              Displayed Here
            </p>
            <ul className="text-xs text-ink-muted font-body space-y-1">
              <li>• House totals & rankings</li>
              <li>• Point movements (house + amount)</li>
              <li>• Deduction/award/correction types</li>
            </ul>
          </div>

          <div className="rounded-lg bg-surface p-3 border border-parchment-border/30">
            <p className="text-xs font-mono text-red-400/70 uppercase tracking-widest mb-1">
              Not Public
            </p>
            <ul className="text-xs text-ink-muted font-body space-y-1">
              <li>• Student names</li>
              <li>• Staff identity</li>
              <li>• Appeal details</li>
              <li>• Anti-abuse flags</li>
            </ul>
          </div>

          <div className="mt-auto text-center">
            <p className="text-xs text-ink-dim font-mono">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
