import { motion, AnimatePresence } from 'framer-motion'
import type { HouseStanding } from '../types/db'

const HOUSE_META: Record<string, { emoji: string; colors: { bg: string; border: string; text: string; badge: string } }> = {
  gryffindor: {
    emoji: '🦁',
    colors: {
      bg: 'rgba(127,29,29,0.12)',
      border: 'rgba(185,28,28,0.35)',
      text: '#ef4444',
      badge: 'rgba(127,29,29,0.3)',
    },
  },
  slytherin: {
    emoji: '🐍',
    colors: {
      bg: 'rgba(20,83,45,0.12)',
      border: 'rgba(21,128,61,0.35)',
      text: '#4ade80',
      badge: 'rgba(20,83,45,0.3)',
    },
  },
  ravenclaw: {
    emoji: '🦅',
    colors: {
      bg: 'rgba(30,58,95,0.12)',
      border: 'rgba(29,78,216,0.35)',
      text: '#60a5fa',
      badge: 'rgba(30,58,95,0.3)',
    },
  },
  hufflepuff: {
    emoji: '🦡',
    colors: {
      bg: 'rgba(113,63,18,0.12)',
      border: 'rgba(146,64,14,0.35)',
      text: '#fcd34d',
      badge: 'rgba(113,63,18,0.3)',
    },
  },
}

interface HouseCardProps {
  standing: HouseStanding
  isLeading?: boolean
  rank: number
}

export default function HouseCard({ standing, isLeading, rank }: HouseCardProps) {
  const meta = HOUSE_META[standing.house_slug] ?? HOUSE_META.gryffindor
  const { colors } = meta

  const rankLabel = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-xl overflow-hidden"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: isLeading ? `0 0 32px ${colors.border}` : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {isLeading && (
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.text}, transparent)` }}
        />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={standing.house_name}>
              {meta.emoji}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink" style={{ color: colors.text }}>
                {standing.house_name}
              </h3>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: colors.badge, color: colors.text, opacity: 0.8 }}
              >
                {rankLabel} place
              </span>
            </div>
          </div>

          {isLeading && (
            <span className="text-xs font-mono text-parchment-gold border border-parchment-gold/40 px-2 py-0.5 rounded bg-parchment-gold/10">
              LEADING
            </span>
          )}
        </div>

        {/* Points counter */}
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={standing.total_points}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="font-mono text-4xl font-medium"
              style={{ color: colors.text }}
            >
              {standing.total_points.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-ink-dim font-body text-sm ml-1">points</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: colors.text }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (standing.total_points / 600) * 100)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
