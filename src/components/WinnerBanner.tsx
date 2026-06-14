import { motion } from 'framer-motion'
import type { WinnerBanner as WinnerBannerType } from '../types/db'
import HouseCrest from './HouseCrest'
import { getHouseTheme } from '../lib/houseTheme'
import type { HouseSlug } from '../types/db'

interface WinnerBannerProps {
  banner: WinnerBannerType
}

export default function WinnerBanner({ banner }: WinnerBannerProps) {
  if (!banner) return null

  const isFinal = banner.winner_status === 'final_winner'
  const isTie   = banner.winner_status === 'tie'
  const slug    = banner.leading_house_slug as HouseSlug | null | undefined
  const theme   = slug ? getHouseTheme(slug) : null
  const houseName = banner.leading_house_name ?? ''

  const bannerLabel = isFinal
    ? 'House Cup Winner · 2025–2026'
    : isTie
    ? 'Current Standings'
    : 'Prepared to Win'

  const borderColor = theme ? theme.border : 'rgba(201,168,76,0.35)'
  const glowColor   = theme ? theme.glow   : 'rgba(201,168,76,0.12)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-xl mb-6"
      style={{
        background: theme
          ? `linear-gradient(135deg, ${theme.bg} 0%, rgba(12,9,3,0.95) 60%)`
          : 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(12,9,3,0.95) 60%)',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 48px ${glowColor}, 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: theme
            ? `linear-gradient(90deg, transparent, ${theme.text}, ${theme.secondary}, ${theme.text}, transparent)`
            : 'linear-gradient(90deg, transparent, #c9a84c, #fde68a, #c9a84c, transparent)',
        }}
      />

      {/* Candle-glow radial */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
        style={{
          background: theme
            ? `radial-gradient(ellipse at 50% 0%, ${theme.glow}, transparent 70%)`
            : 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.10), transparent 70%)',
        }}
      />

      <div className="relative flex items-center gap-5 px-6 py-5">
        {/* Crest or icon */}
        {slug && !isTie ? (
          <div
            className="shrink-0 rounded-xl p-2"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${theme?.border}`,
              boxShadow: `0 0 24px ${glowColor}`,
            }}
          >
            <HouseCrest house={slug} size={60} />
          </div>
        ) : (
          <div className="shrink-0 flex items-center justify-center w-16 h-16">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              {isFinal ? (
                <path d="M24 4 L30 16 L44 18 L34 28 L36 42 L24 36 L12 42 L14 28 L4 18 L18 16 Z"
                  fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" />
              ) : (
                <>
                  <circle cx="24" cy="24" r="16" fill="none" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="16" y1="24" x2="32" y2="24" stroke="#c9a84c" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="section-label mb-1"
            style={{ color: theme ? theme.textDim : '#8a6e35' }}
          >
            {bannerLabel}
          </p>
          {isTie ? (
            <p className="font-display text-2xl md:text-3xl text-ink font-semibold">
              All Houses Tied
            </p>
          ) : (
            <p
              className="font-display text-2xl md:text-3xl font-semibold"
              style={{ color: theme ? theme.text : '#c9a84c' }}
            >
              {houseName}
            </p>
          )}
          {isFinal && (
            <p className="text-xs font-mono mt-1" style={{ color: theme ? theme.textDim : '#8a6e35' }}>
              End-of-year House Cup awarded
            </p>
          )}
        </div>

        {/* Lead indicator */}
        {banner.point_lead && banner.point_lead > 0 && !isTie && (
          <div
            className="text-right shrink-0 rounded-lg px-4 py-2"
            style={{
              background: 'rgba(0,0,0,0.30)',
              border: `1px solid ${borderColor}`,
            }}
          >
            <p className="text-xs font-mono text-ink-dim uppercase tracking-widest mb-0.5">Lead</p>
            <p
              className="font-mono text-2xl font-semibold leading-none"
              style={{ color: theme ? theme.secondary : '#c9a84c' }}
            >
              +{banner.point_lead}
            </p>
            <p className="text-xs text-ink-dim font-mono mt-0.5">points</p>
          </div>
        )}
      </div>

      {/* Bottom shimmer */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: theme
            ? `linear-gradient(90deg, transparent, ${theme.border}, transparent)`
            : 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)',
        }}
      />
    </motion.div>
  )
}
