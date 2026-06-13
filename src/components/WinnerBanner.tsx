import { motion } from 'framer-motion'
import type { WinnerBanner as WinnerBannerType } from '../types/db'

interface WinnerBannerProps {
  banner: WinnerBannerType
}

export default function WinnerBanner({ banner }: WinnerBannerProps) {
  if (!banner) return null

  const isFinal = banner.winner_status === 'final_winner'
  const isTie = banner.winner_status === 'tie'

  // Prefer banner_text from DB, fall back to composing from leading_house_name
  const bannerLabel = isFinal
    ? 'House Cup Winner'
    : isTie
    ? 'Current Standings'
    : 'Prepared to Win'

  const houseName = banner.leading_house_name ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl border border-parchment-gold/30 bg-surface-raised mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(25,18,8,1) 60%)',
        boxShadow: '0 0 40px rgba(201,168,76,0.1), 0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Gold shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-parchment-gold to-transparent" />

      <div className="flex items-center gap-5 px-6 py-4">
        {/* Icon */}
        <div className="flex-shrink-0 text-4xl" role="img" aria-label="trophy">
          {isFinal ? '🏆' : isTie ? '⚖️' : '✨'}
        </div>

        <div className="flex-1">
          {isTie ? (
            <>
              <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-widest mb-0.5">
                Current Standings
              </p>
              <p className="font-display text-2xl text-ink font-semibold">
                All Houses Tied
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-mono text-parchment-gold-dim uppercase tracking-widest mb-0.5">
                {bannerLabel}
              </p>
              <p className="font-display text-2xl text-parchment-gold font-semibold">
                {houseName}
              </p>
            </>
          )}
        </div>

        {banner.point_lead && banner.point_lead > 0 && (
          <div className="text-right shrink-0">
            <p className="text-xs font-mono text-ink-dim uppercase tracking-widest mb-0.5">Lead</p>
            <p className="font-mono text-xl text-parchment-gold font-medium">
              +{banner.point_lead}
            </p>
            <p className="text-xs text-ink-dim">points</p>
          </div>
        )}
      </div>

      {/* Bottom shimmer */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-parchment-gold/30 to-transparent" />
    </motion.div>
  )
}
