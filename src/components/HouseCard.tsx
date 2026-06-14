import { motion, AnimatePresence } from 'framer-motion'
import type { HouseStanding } from '../types/db'
import type { HouseSlug } from '../types/db'
import HouseCrest from './HouseCrest'
import { getHouseTheme } from '../lib/houseTheme'

interface HouseCardProps {
  standing: HouseStanding
  isLeading?: boolean
  rank: number
  recentDelta?: number
}

const RANK_LABELS = ['—', '1st', '2nd', '3rd', '4th']

export default function HouseCard({ standing, isLeading, rank, recentDelta }: HouseCardProps) {
  const theme = getHouseTheme(standing.house_slug)
  const rankLabel = RANK_LABELS[rank] ?? `${rank}th`
  const slug = standing.house_slug as HouseSlug

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (rank - 1) * 0.07 }}
      className="relative rounded-xl overflow-hidden flex flex-col"
      style={{
        background: theme.gradient,
        backgroundColor: 'rgba(20,14,5,0.7)',
        border: `1px solid ${theme.border}`,
        boxShadow: isLeading
          ? `0 0 40px ${theme.glow}, 0 0 80px ${theme.glow}40, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top shimmer line for leader */}
      {isLeading && (
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.secondary}, ${theme.text}, ${theme.secondary}, transparent)`,
          }}
        />
      )}

      {/* Subtle corner ornament */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-[0.04] pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${theme.text}, transparent 70%)`,
        }}
      />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Rank badge */}
        <div className="flex items-start justify-between">
          <span
            className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
            style={{
              color: theme.secondary,
              background: theme.badgeBg,
              border: `1px solid ${theme.border}`,
              letterSpacing: '0.08em',
            }}
          >
            {rankLabel} place
          </span>

          {/* Recent movement badge */}
          {recentDelta !== undefined && recentDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
              style={recentDelta > 0
                ? { color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }
                : { color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)' }
              }
            >
              {recentDelta > 0 ? '+' : ''}{recentDelta}
            </motion.span>
          )}

          {isLeading && !recentDelta && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                color: theme.secondary,
                background: theme.badgeBg,
                border: `1px solid ${theme.secondary}60`,
              }}
            >
              LEADING
            </span>
          )}
        </div>

        {/* Crest + Name row */}
        <div className="flex items-center gap-3.5">
          <div
            className="shrink-0 rounded-lg p-1.5"
            style={{
              background: `rgba(0,0,0,0.3)`,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 16px ${theme.glow}`,
            }}
          >
            <HouseCrest house={slug} size={52} />
          </div>
          <div>
            <h3
              className="font-display text-xl font-semibold leading-tight"
              style={{ color: theme.text }}
            >
              {standing.house_name}
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: theme.textDim }}>
              House of Hogwarts
            </p>
          </div>
        </div>

        {/* Points */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={standing.total_points}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
              className="font-mono font-semibold"
              style={{ color: theme.text, fontSize: '2.4rem', lineHeight: 1 }}
            >
              {standing.total_points.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-ink-dim font-body text-sm">pts</span>
        </div>

        {/* Progress bar */}
        <div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${theme.progressFrom}, ${theme.progressTo})`,
                boxShadow: `0 0 8px ${theme.glow}`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(2, (standing.total_points / 600) * 100))}%` }}
              transition={{ duration: 1.0, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-mono" style={{ color: theme.textDim, opacity: 0.7 }}>0</span>
            <span className="text-xs font-mono" style={{ color: theme.textDim, opacity: 0.7 }}>600</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
